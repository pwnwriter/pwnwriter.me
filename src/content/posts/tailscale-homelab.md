---
title: "Ditching Cloudflared for Tailscale"
pubDate: 2026-09-07
modDate: 2026-09-07
tags: ["setup", "ssh", "tailscale", "nix", "homelab", "self-hosting"]
---

A while back I wrote about SSHing into my home server from anywhere using a
[Cloudflare Tunnel]. It worked. But the more I lived with it, the more it felt
like the wrong tool.

Cloudflared needs a domain. It routes my SSH through Cloudflare's edge. It's a
daemon babysitting a `config.yml`, and every service I want to reach needs its
own `ingress` rule. That's a lot of moving parts, and another company sitting in
the middle of me talking to my own machine.

So I ripped it out and moved to [Tailscale].

## Why it's better for me

Tailscale is a WireGuard mesh. My machines talk to each other **directly**,
peer to peer, over an encrypted tunnel. No domain, no public IP, no open ports,
no ingress config. Every box gets a `100.x` address and a name, and I can reach
**any** port on it, not just the one I remembered to forward.

And because everything I own is Nix, I don't click around an app. I add a line,
rebuild, done.

## The Linux box (dom)

`dom` is my NixOS home server. Enabling Tailscale is one line, plus telling the
firewall to trust the tailnet interface so I'm not fighting my own rules.

```nix
# machines/dom/services.nix
{
  # tailscale
  services.tailscale.enable = true;

  # firewall — allow ssh + trust the tailnet, block the rest
  networking.firewall = {
    enable = true;
    allowedTCPPorts = [ 22 ];
    trustedInterfaces = [ "tailscale0" ];
  };
}
```

`services.tailscale.enable` installs the daemon, starts it at boot, and opens
the UDP port it needs to punch through NAT. Rebuild:

```bash
sudo nixos-rebuild switch --flake .#dom
```

## The Mac (whiterose)

My MacBook is a nix-darwin machine. nix-darwin has the same option, it just
runs the daemon under launchd. I only wanted it on the laptop, not the Mac Mini,
so I dropped it straight into that machine's config:

```diff nix
 # machines/whiterose/default.nix
   modules = [
     {
       nixpkgs.config.allowUnfree = true;
     }
+
+    # MacBook-specific: Tailscale client to reach the homelab from anywhere
+    {
+      services.tailscale.enable = true;
+    }

     ./../../modules/darwin.nix
```

```bash
darwin-rebuild switch --flake .#whiterose
```

## Log in

Enabling the service installs everything, but the node still has to join the
tailnet. Once per machine:

```bash
sudo tailscale up
```

It prints a login URL, I approve it in the browser, and the box shows up in my
tailnet. On macOS I also set myself as operator so I stop needing `sudo` for
everyday commands:

```bash
sudo tailscale set --operator=$USER
```

Now `tailscale status` lists everything:

```
100.124.21.97   whiterose   macOS   -
100.109.246.23  dom         linux   active; direct 71.121.175.97:41641
```

`direct` is the word I wanted. No relay, ~12ms, straight laptop-to-server.

## Point SSH at the tailnet

My `ssh dom` alias was still hardcoded to the LAN IP, so it only worked at home.
The whole point was reaching it from anywhere, so I swapped it for the MagicDNS
name. That name resolves on my LAN *and* from a coffee shop, Tailscale figures
out the route.

```diff
 # modules/ssh.nix
   "dom" = {
     User = "pwn";
-    Hostname = "192.168.1.213";
+    # Tailscale MagicDNS name — reachable on LAN and from anywhere.
+    Hostname = "dom";
   };
```

After a rebuild, this just works, from my bed or from another country:

```bash
ssh dom
```

No `ssh.pwnwriter.me`. No tunnel daemon. No DNS records to manage.

## I don't want it running 24/7

Here's the part I actually care about. I don't want a VPN glued on all day. I
want it up when I need the homelab and gone when I don't.

Turns out you don't fight the daemon for this:

```bash
tailscale down    # off — disconnects from the tailnet
tailscale up      # on  — back in
```

`tailscale down` sets `WantRunning=false`, and that **sticks across reboots**.
Turn it off once and it stays off until I explicitly bring it up. The daemon is
still there, but parked, doing nothing.

Battery? I worried about this and it's basically a non-issue. Connected and idle,
it's a small keepalive every ~25s and one long-poll to a relay, nothing you'd
feel on a day's charge. After `tailscale down` it's effectively zero. The only
thing that actually costs you is using a box as an exit node, so don't, unless
you mean to.

## SSH bits worth stealing

Two lines in my `Host *` block that make daily SSH nicer over the tunnel:

```nix
# modules/ssh.nix, the "*" block
ServerAliveInterval = 30;     # don't let idle sessions die on NAT
ControlMaster = "auto";       # reuse one connection
ControlPersist = "10m";       # 2nd+ ssh/scp/rsync are instant
```

Multiplexing means the second `ssh dom` rides the first tunnel, no re-auth,
near-instant. And the stuff I run constantly:

```bash
ssh dom 'docker ps'              # one-off command, no shell
rsync -avP ~/dir/ dom:~/dir/     # resumable folder sync
ssh -L 8080:localhost:80 dom     # reach dom's :80 at localhost:8080
```

## That's it

Cloudflared was a tunnel to one port behind a domain behind a company.
Tailscale is my machines talking to each other, off when I say so, and it's four
lines of Nix across two hosts.

The old post stays up for history. This is what I run now.

<!--links-->

[Cloudflare Tunnel]: /notes/cloudflared-ssh
[Tailscale]: https://tailscale.com
