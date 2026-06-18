---
title: "Remote browsers and tab pooling in haylxon"
pubDate: 2026-06-09
modDate: 2026-06-09
tags: [rust, dev, haylxon]
---

I've been working on [haylxon](https://github.com/pwnwriter/haylxon) for a while now. It takes screenshots of URLs from the terminal using Chrome's headless mode, talking to Chrome over CDP (Chrome DevTools Protocol). I even [gave a talk about it at PTN 11](/posts/my-talk-on-ptn). It was already pretty fast. But I kept noticing things that bugged me about how it worked under the hood.

## what was bothering me

Every time you ran `hxn`, it would spin up an entirely new Chromium process. Boot it. Wait for it. Connect via CDP. Do the work. Kill it. That browser startup alone eats 300-500ms. If you're screenshotting a handful of URLs, most of your time is just... waiting for Chrome to exist.

The other thing, for every single URL, haylxon would open a fresh tab, navigate to the page, take the screenshot, close the tab. Open, close, open, close. Each of those is a CDP round-trip. Felt wasteful. Why not just reuse the tab?

And then there was the bigger question I'd been sitting on for a while: why does haylxon need to launch Chrome at all? What if Chrome is already running somewhere, on a server, on another laptop, in a container? CDP is a network protocol. It works over WebSockets. There's no reason the browser has to be on the same machine.

## digging into chromiumoxide

I started looking at what [chromiumoxide](https://crates.io/crates/chromiumoxide) (the Rust CDP library haylxon uses) actually supports. Turns out it has two ways to get a `Browser`:

```rust
// what haylxon was doing, launch a new process
let (browser, handler) = Browser::launch(config).await?;

// what I didn't know existed, connect to an existing one
let (browser, handler) = Browser::connect(url).await?;
```

The interesting part: both return the exact same `Browser` type. Same API. Same everything. The pages you create, the screenshots you take, the JavaScript you evaluate, all identical regardless of how you got the browser. The only difference is whether Chrome was already running or not.

Even better, `Browser::connect()` is smart about what you pass it. Give it a WebSocket URL like `ws://host:9222/devtools/browser/<uuid>` and it connects directly. Give it an HTTP URL like `http://host:9222` and it hits `/json/version` to discover the WebSocket endpoint automatically. That's the same endpoint you'd hit with `curl`:

```json
{
  "Browser": "Chrome/148.0.7778.0",
  "webSocketDebuggerUrl": "ws://127.0.0.1:9222/devtools/browser/68dbbb49-..."
}
```

So the abstraction I needed was thin. Really thin. Not a trait over every CDP operation, just a trait over how you *get* the browser in the first place:

```rust
#[async_trait]
pub trait BrowserProvider: Send + Sync {
    async fn connect(&self) -> miette::Result<Arc<Browser>>;
}
```

`LocalBrowser` wraps the existing launch logic. `RemoteBrowser` calls `Browser::connect()`. Done.

## how LocalBrowser works

Before this change, the browser launch code lived directly in the main execution function, a big block of `BrowserConfig::builder()` calls mixed with CLI argument handling. I pulled it into its own struct:

```rust
pub struct LocalBrowser {
    config: BrowserConfig,
}

impl LocalBrowser {
    pub fn new(
        binary_path: &str,
        width: u32,
        height: u32,
        user_agent: Option<&str>,
        proxy: Option<&str>,
    ) -> miette::Result<Self> {
        let mut builder = BrowserConfig::builder();
        builder = builder
            .no_sandbox()
            .arg("--disable-dev-shm-usage")
            .arg("--disable-gpu")
            .window_size(width, height)
            .chrome_executable(binary_path)
            .viewport(Viewport {
                width, height,
                device_scale_factor: None,
                emulating_mobile: false,
                is_landscape: false,
                has_touch: false,
            });

        if let Some(ua) = user_agent {
            builder = builder.arg(format!("--user-agent={ua}"));
        }
        if let Some(proxy_url) = proxy {
            builder = builder.arg(format!("--proxy-server={proxy_url}"));
        }

        let config = builder.build().map_err(|e| miette::miette!(e))?;
        Ok(Self { config })
    }
}
```

The `BrowserProvider` impl just calls `Browser::launch()` with that config and spawns the CDP event handler:

```rust
#[async_trait]
impl BrowserProvider for LocalBrowser {
    async fn connect(&self) -> miette::Result<Arc<Browser>> {
        let (browser, mut handler) = Browser::launch(self.config.clone())
            .await.into_diagnostic()?;
        tokio::task::spawn(async move {
            while handler.next().await.is_some() {}
        });
        Ok(Arc::new(browser))
    }
}
```

That `handler` loop is important, chromiumoxide uses it to process CDP events from Chrome. Without it, nothing works. The old code had this exact same spawn, just inlined in `exec.rs`. Now it lives where it belongs.

## how RemoteBrowser works

This is the part I was most excited about. The entire remote browser implementation:

```rust
pub struct RemoteBrowser {
    url: String,
}

impl RemoteBrowser {
    pub fn from_ws_url(url: String) -> Self {
        Self { url }
    }

    pub fn from_host(host: String) -> Self {
        Self { url: format!("http://{host}") }
    }
}

#[async_trait]
impl BrowserProvider for RemoteBrowser {
    async fn connect(&self) -> miette::Result<Arc<Browser>> {
        let (browser, mut handler) = Browser::connect(&self.url)
            .await
            .into_diagnostic()
            .map_err(|e| miette::miette!(
                "Failed to connect to remote browser at {}: {e}", self.url
            ))?;
        tokio::task::spawn(async move {
            while handler.next().await.is_some() {}
        });
        Ok(Arc::new(browser))
    }
}
```

That's it. The `from_host` constructor just prepends `http://`, chromiumoxide handles the `/json/version` discovery internally. No extra HTTP client code. No JSON parsing. The library already does all of that.

The orchestration code in `exec.rs` picks the right provider based on CLI flags:

```rust
let provider: Box<dyn BrowserProvider> = if let Some(ws_url) = remote_url {
    Box::new(RemoteBrowser::from_ws_url(ws_url))
} else if let Some(host) = remote_host {
    Box::new(RemoteBrowser::from_host(host))
} else {
    Box::new(LocalBrowser::new(&binary_path, width, height, ...)?)
};

let browser = provider.connect().await?;
```

After this point, the rest of the code doesn't know or care whether Chrome is local or remote. Same `browser.new_page()`, same `page.goto()`, same `page.save_screenshot()`.

## tab pooling, the details

The tab reuse was even simpler conceptually. I already had a `Semaphore` controlling how many tabs run in parallel:

```rust
let semaphore = Arc::new(Semaphore::new(tabs));

for url in urls {
    let permit = semaphore.clone().acquire_owned().await?;
    tokio::spawn(async move {
        take_screenshot(...).await;
        drop(permit); // release the slot
    });
}
```

This gates concurrency, if `tabs` is 8, only 8 screenshots run at once. But every one of those screenshots was creating a fresh page and destroying it. The pool sits behind that gate:

```rust
pub struct PagePool {
    browser: Arc<Browser>,
    pages: Mutex<Vec<Page>>,
    max_size: usize,
}

impl PagePool {
    pub async fn acquire(&self) -> miette::Result<Page> {
        let mut pages = self.pages.lock().await;
        if let Some(page) = pages.pop() {
            drop(pages);
            let _ = page.goto("about:blank").await;
            Ok(page)
        } else {
            drop(pages);
            self.browser.new_page("about:blank").await.into_diagnostic()
        }
    }

    pub async fn release(&self, page: Page) {
        let mut pages = self.pages.lock().await;
        if pages.len() < self.max_size {
            pages.push(page);
        } else {
            drop(pages);
            let _ = page.close().await;
        }
    }
}
```

The lock is held only for the `push`/`pop`, microseconds. The actual page navigation and screenshot happen outside the lock. No contention in practice.

The `about:blank` navigation on acquire is the cheapest way to reset a page. No cookies from the previous URL leak through. No leftover DOM. Clean slate. I thought about calling `page.close()` and creating a new one every time, but that defeats the whole point, `new_page` is a CDP command that allocates renderer resources. Reusing the existing page and just navigating away is way cheaper.

The screenshot function now does this instead of the old create/close dance:

```rust
// acquire page from pool (or create new)
let page = if let Some(pool) = page_pool {
    pool.acquire().await?
} else {
    browser.new_page("about:blank").await.into_diagnostic()?
};

// ... set user agent, navigate, screenshot ...

// release back to pool (or close)
if let Some(pool) = page_pool {
    pool.release(page).await;
} else {
    page.close().await.into_diagnostic()?;
}
```

The `Option<&PagePool>` keeps it backwards compatible, pass `--reuse-tabs false` and there's no pool, falls back to the old behavior.

## wiring it up

The CLI got three new flags:

```bash
# connect to a remote browser, just give it host:port
hxn --remote-host 192.168.1.42:9222 -f urls.txt

# or a direct WebSocket URL if you already have it
hxn --remote-url ws://192.168.1.42:9222/devtools/browser/<uuid> -u https://example.com

# tab pool size (default 8, enabled by default)
hxn -b $(which brave) -f urls.txt --pool-size 16
```

The `--remote-host` flag is the one I use most. You start Chrome headless somewhere:

```bash
chromium --headless --remote-debugging-port=9222 --no-sandbox
```

And point haylxon at it. No UUIDs to copy. The tool discovers the WebSocket URL itself.

One gotcha I ran into while testing this: Chrome often ignores `--remote-debugging-address=0.0.0.0` and only binds to localhost even when you tell it not to. Spent way too long debugging that. Ended up using `socat` to expose the port:

```bash
socat TCP-LISTEN:9223,fork,reuseaddr,bind=0.0.0.0 TCP:127.0.0.1:9222 &
```

Not ideal, but it works reliably. Chrome's fault, not ours.

## how fast is it now

I set up a [hyperfine](https://github.com/sharkdp/hyperfine) benchmark on GitHub Actions comparing haylxon against [gowitness](https://github.com/sensepost/gowitness):

| Benchmark | hxn | gowitness | |
|---|---|---|---|
| Single URL | 360ms | 3.99s | **11x faster** |
| 5 URLs, 4 tabs | 1.81s | 26.29s | **14x faster** |
| 5 URLs, 8 tabs | 1.70s | 14.67s | **8x faster** |

The single URL case is the one that got me. 360ms. That includes launching Chrome, connecting, navigating, rendering the page, capturing the screenshot, and writing it to disk. On a CI runner. That's not a lot of time.

With a remote browser that's already running, you skip the launch entirely. The first screenshot comes back even faster because there's no boot cost to amortize.

## what I kept simple

I didn't add connection retry logic. I didn't add health checks or reconnection pools or a configuration file for remote browser settings. I didn't build a browser manager that keeps Chrome alive between runs.

All of that might make sense someday. But right now, the tool is fast, the code is small, and there's nothing in it that doesn't need to be there. That feels right.

Sometimes the fastest path is just removing the things that were slow.
