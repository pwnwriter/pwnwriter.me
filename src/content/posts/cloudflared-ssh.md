---
title: "SSH Home Server Anywhere"
pubDate: 2026-03-05
modDate: 2026-03-05
tags: ["setup", "ssh", "cloudflare", "tunnel", "homelab", "self-hosting"]
---

I recently got a ThinkPad and decided to turn it into a small home server. I
plan to use it for heavier tasks like running Hack The Box machines, practicing
for Red Hat, and other lab work. Since it stays at home, I wanted a simple way
to SSH into it from anywhere.

The usual way is to **port-forward port 22**, but that exposes your server
directly to the internet. I didn’t want that.

Instead, I used **Cloudflare Tunnel**.

With a tunnel, my server creates a secure outbound connection to Cloudflare’s network, and I reach it through my domain. No open ports, no public IP, and it works even behind NAT.

### Create the tunnel

After installing `cloudflared`, I logged in and created a tunnel:

```bash
cloudflared tunnel login
cloudflared tunnel create pwnlab
```

Cloudflare generates a credential file inside `~/.cloudflared/`.

### Configure the tunnel

Then I created a small config file:

`~/.cloudflared/config.yml`

```yaml
tunnel: pwnlab
credentials-file: /home/pwn/.cloudflared/<tunnel-id>.json

ingress:
  - hostname: ssh.pwnwriter.me
    service: ssh://localhost:22
  - service: http_status:404
```

This tells the tunnel to send traffic from `ssh.pwnwriter.me` to my local SSH server.

### Add the DNS route

Next I mapped the subdomain to the tunnel:

```bash
cloudflared tunnel route dns pwnlab ssh.pwnwriter.me
```

Cloudflare automatically creates the DNS record.

### Run the tunnel

```bash
cloudflared tunnel run pwnlab
```

Now my server stays connected to Cloudflare through a secure tunnel.

### SSH from anywhere

From any machine I can now simply run:

```bash
ssh pwn@ssh.pwnwriter.me
```

That’s it.

No router configuration.
No exposed ports.
Just a clean and secure.

