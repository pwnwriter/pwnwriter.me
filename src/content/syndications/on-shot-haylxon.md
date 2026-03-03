---
title: "fix(hxn): Oneshot canceled haylxon"
pubDate: 2026-02-26
modDate: 2026-02-26
tags: [nix, rust, dev, infra]
---


A small bug in [`haylxon`](https://github.com/pwnwriter/haylxon)caused screenshots to fail with this warning:

```warning: oneshot canceled```

But the tool still said:

```
info: Screenshots Taken and saved in directory hxnshots
```

No screenshot was actually saved.

## What Was Happening

`haylxon` uses `chromiumoxide` to talk to Chrome. In the background, there’s a handler loop that keeps reading messages from Chrome and sending responses back through oneshot channels.

This was the code:

```rust
task::spawn(async move {
    while let Some(h) = handler.next().await {
        if h.is_err() {
            break;
        }
    }
});
```

It looks fine. If something errors, stop.

But Chrome sends non-fatal errors all the time — like console warnings from websites. When that happened:

1. `handler.next()` returned `Some(Err(...))`
2. The loop hit `break`
3. The handler stopped running
4. All pending oneshot senders were dropped
5. The receiver saw that and returned: `"oneshot canceled"`

So the screenshot call was waiting for a response… but the handler had already exited.

The connection wasn’t broken. We just stopped listening too early.

## The Fix

I changed it to:

```rust
task::spawn(async move {
    while handler.next().await.is_some() {}
});
```

Now it keeps running until Chrome actually disconnects. It ignores non-fatal errors instead of shutting everything down.

That’s it.

One `break` statement was killing the whole message loop. Removing it fixed the issue completely.

**Issue:** [#140](https://github.com/pwnwriter/haylxon/issues/140)
