---
title: "My talk on PTN 11"
pubDate: 2024-08-03T15:32:00-05:00
modDate: 2024-08-03T15:32:00-05:00
cover:
  src: ~/assets/ptn11/cover.jpg
  alt: pwnwriter's talk in owasp Kathmandu
tags: ["talks", "nix"]
---

[PTN][ptn] — Pentester Nepal, is a community for security folks in Nepal. They
organize events, meetups, and challenges. PTN 11 was their 11th anniversary event,
and I got to speak there.

My talk was on **OS as Code: Using Nix on Apple Silicon**.

## What even is Nix?

Nix is three things at once — a purely functional programming language, a package
manager, and an entire Linux distro (NixOS) built around it.

The package repo, [nixpkgs][nixpkgs], lives on GitHub and is honestly the largest
and most up-to-date collection of packages I've seen. Everything is a derivation.

## NixOS

If you take Nix the package manager and build an entire OS around it, you get NixOS.
Your whole system — packages, services, users, networking — lives in a single
`configuration.nix` file. That's the "OS as Code" part. You commit it to git, push
it, and spin up the exact same machine anywhere. Wipe and reinstall? Just run
`nixos-rebuild switch`. Back to exactly where you were.

## Why Nix though?

The main idea is **declarative** configuration. Instead of running:

```bash
$ apt install git
```

You write:

```nix
{
  environment.systemPackages = with pkgs; [ git ];
}
```

And you get the exact same result every time, on every machine. That's the whole
point — **reproducible** environments. No more "works on my machine" nonsense.

It's also **immutable** by default. All packages live in `/nix/store` with their
hash in the path. Nothing overwrites anything. Rollbacks are trivial.

The learning curve is real though. New filesystem layout, new language, a whole
rabbit hole — but once it clicks, it clicks.

## Installing

The cleanest way to install Nix (not NixOS, just the package manager) is via the
Determinate Systems installer:

```bash
curl --proto '=https' --tlsv1.2 -sSf -L https://install.determinate.systems/nix | sh -s -- install
```

It comes with flake support out of the box, it's easy to uninstall, and it's
written in Rust — so obviously I like it.

## Flakes and Direnv

A `flake.nix` has two parts — `inputs` (your dependencies) and `outputs` (what
you're providing). It pins everything, so unlike the old `nix-shell` approach,
you're not at the mercy of whatever channel your system has.

Pair that with [direnv][direnv] and `nix-direnv`, and your dev shell loads
automatically when you `cd` into a directory. The presentation repo itself is an
example of this — just `direnv allow` and you're in.

## Home Manager and nix-darwin

[Home Manager][hm] lets you manage all your dotfiles and user packages declaratively
through Nix. One fun example from the talk — building a starship prompt that
shows a different icon depending on whether you're on macOS or Linux, all in Nix.

For Apple Silicon specifically, [nix-darwin][nix-darwin] brings the NixOS-style
declarative config to macOS. You get the same `environment.systemPackages` and
module system but on Darwin.

This is what makes "OS as Code" actually work on a Mac — nix-darwin handles the
system layer, home-manager handles the user layer, and flakes tie it all together.

The presentation itself was built and rendered using `presenterm`, inside a Nix
flake, on NixOS. Bit of a meta moment.

You can find the slides at [github:pwnwriter/PTN11][ptn11].

[ptn]: https://pentesternepal.com
[nixpkgs]: https://github.com/nixos/nixpkgs
[direnv]: https://direnv.net
[hm]: https://github.com/nix-community/home-manager
[nix-darwin]: https://github.com/LnL7/nix-darwin
[ptn11]: https://github.com/pwnwriter/PTN11
