---
title: "fix(hxn): Oneshot canceled haylxon"
pubDate: 2026-02-26
modDate: 2026-02-26
tags: [nix, rust, dev, infra]
---

A deep dive into how a single `break` statement silently killed screenshot captures in [haylxon](https://github.com/pwnwriter/haylxon).

## The Bug

Users reported that haylxon would fail to take screenshots with a cryptic warning:

```
warning: oneshot canceled
```

No screenshot was saved, but the tool reported success:

```
info: Screenshots Taken and saved in directory hxnshots
```

This happened across environments — snap-confined Chromium on Ubuntu, Google Chrome on GitHub Actions, Docker containers — with no clear pattern.

## Understanding the Architecture

Haylxon uses [chromiumoxide](https://github.com/mattsse/chromiumoxide) to control Chrome via the **Chrome DevTools Protocol (CDP)**. The architecture looks like this:

```
  haylxon                   chromiumoxide handler              Chrome
  ───────                   ──────────────────────             ──────
  new_page() ──────────────► sends CDP command ──────────────► creates tab
                             creates oneshot channel
  awaits oneshot ◄────────── forwards response ◄────────────── tab ready
  save_screenshot() ───────► sends CDP command ──────────────► captures
  awaits oneshot ◄────────── forwards response ◄────────────── screenshot data
```

The **handler** is the middleman. It runs in a background tokio task, continuously reading CDP messages from Chrome and routing responses back to callers via [tokio oneshot channels](https://docs.rs/tokio/latest/tokio/sync/oneshot/index.html) — single-use channels where one sender sends exactly one value to one receiver.

## The Root Cause

Here's the handler loop that shipped:

```rust
task::spawn(async move {
    while let Some(h) = handler.next().await {
        if h.is_err() {
            break; // <-- the bug
        }
    }
});
```

This looks reasonable at first glance: "if something goes wrong, stop." But Chrome routinely emits non-fatal errors through the handler — console errors from web pages, navigation warnings, resource loading failures. These are informational, not fatal.

When Chrome loads `https://github.com` and a third-party script throws a console error, here's what happens:

```
1. Chrome emits a console error event
2. handler.next() returns Some(Err(...))
3. The handler loop breaks
4. The handler task exits
5. All pending oneshot senders are dropped
6. save_screenshot() was awaiting a oneshot receiver
7. The receiver sees the sender was dropped → "oneshot canceled"
8. haylxon logs: "warning: oneshot canceled"
9. No screenshot is saved
```

The handler dying is like cutting the phone line between haylxon and Chrome mid-conversation.

## The Real-World Analogy

Imagine you hire a translator to relay messages between you and someone who speaks another language. The translator's instructions say: _"If anything confusing comes up, leave the room."_

The other person says something perfectly normal, then mumbles something unclear. Your translator walks out. Now you're standing there trying to ask questions, but there's nobody to relay them. Your messages go unanswered — not because anything is actually wrong, but because your translator gave up too early.

That `break` statement was the translator walking out.

## The Fix

```rust
task::spawn(async move {
    while handler.next().await.is_some() {}
});
```

The handler now drains the entire CDP stream until Chrome actually disconnects. Non-fatal errors flow through without killing the connection. The loop only ends when the stream yields `None` — meaning Chrome has genuinely shut down.

### What's Actually Happening in the Rust Code

Let's break this down piece by piece.

**`handler`** implements the `Stream` trait from the `futures` crate (think of it as an async iterator). Each call to `.next()` asynchronously waits for the next CDP message from Chrome. It returns:

- `Some(Ok(()))` — a message was processed successfully
- `Some(Err(e))` — a message was received but had an error (non-fatal)
- `None` — the stream is finished, Chrome has disconnected

**The old code:**

```rust
while let Some(h) = handler.next().await {
    if h.is_err() {
        break;
    }
}
```

`while let Some(h)` destructures the `Option` — the loop continues as long as `handler.next()` yields `Some(...)`. The variable `h` is a `Result<(), Error>`. Then `h.is_err()` checks if this particular message was an error. If it was, `break` exits the loop entirely.

The problem: once the loop exits, the `handler` is dropped (Rust's ownership model — when a value goes out of scope, it's dropped). Inside chromiumoxide, the handler holds the **sender halves** of every pending oneshot channel. When it's dropped, all those senders are dropped too. On the other end, whoever was `.await`ing the receiver gets `Err(RecvError)` — which surfaces as `"oneshot canceled"`.

Here's a minimal example of how oneshot channels work:

```rust
use tokio::sync::oneshot;

// chromiumoxide internally does something like this for each CDP command:
let (tx, rx) = oneshot::channel();

// The handler holds `tx` and will send the response through it
// The caller (save_screenshot) holds `rx` and awaits the response

// Normal case: handler sends the response
tx.send(screenshot_data).unwrap();
let result = rx.await.unwrap(); // gets the data

// Bug case: handler is dropped, tx is dropped with it
drop(tx);
let result = rx.await; // Err(RecvError) → "oneshot canceled"
```

**The new code:**

```rust
while handler.next().await.is_some() {}
```

`.is_some()` returns `true` for **both** `Some(Ok(()))` and `Some(Err(e))`. It only returns `false` for `None`. So the loop keeps running regardless of whether individual messages were errors. It only stops when Chrome genuinely disconnects and the stream ends.

This is idiomatic Rust for "drain a stream to completion." We don't need the value of each message (haylxon doesn't inspect handler events), so `.is_some()` is cleaner than destructuring with `while let`.

### Why It Has to Be in a `task::spawn`

```rust
task::spawn(async move {
    while handler.next().await.is_some() {}
});
```

The handler loop runs **concurrently** with the rest of haylxon. Without `task::spawn`, you'd have to poll the handler and do screenshot work in the same task, which would deadlock — `save_screenshot().await` needs the handler to process its CDP response, but the handler can't process anything because `save_screenshot` is blocking the task.

`task::spawn` puts the handler on its own tokio task. Now two things run concurrently:

```
Task 1 (spawned):  handler reads CDP messages from Chrome, routes responses
Task 2 (main):     haylxon sends CDP commands, awaits responses via oneshot channels
```

The `async move` moves ownership of `handler` into the spawned task. This is required because the spawned task needs to own the handler for its entire lifetime — Rust's borrow checker enforces this at compile time.

### Chrome Flags for Restricted Environments

We also added Chrome flags for restricted environments (snap, Docker, CI):

```rust
BrowserConfig::builder()
    .no_sandbox()
    .arg("--disable-dev-shm-usage")
    .arg("--disable-gpu")
```

- `--disable-dev-shm-usage` — Chrome uses `/dev/shm` (a tmpfs-backed shared memory filesystem) for inter-process communication during rendering. In sandboxed environments (snap, Docker), `/dev/shm` is often restricted in size (default 64MB in Docker) or blocked by AppArmor policies. When Chrome can't write to it, the renderer process crashes. This flag makes Chrome use `/tmp` instead, which doesn't have these restrictions.
- `--disable-gpu` — Chrome spawns a GPU process even in headless mode for compositing. In environments without GPU access (CI runners, containers), this process fails to initialize. The AppArmor `sys_nice` denial in the original issue was the GPU process trying to set its scheduling priority. Disabling it avoids this entirely.

These flags don't affect screenshot quality — headless Chrome renders via software rasterization regardless.

## Takeaway

The error message "oneshot canceled" gave zero indication that the handler loop was the problem. It pointed at the _symptom_ (a dropped channel) rather than the _cause_ (an overly aggressive error handler). Sometimes the most impactful fix is removing code rather than adding it — in this case, deleting a three-line `if` block that treated every hiccup as a catastrophe.

**Issue:** [#140](https://github.com/pwnwriter/haylxon/issues/140)
