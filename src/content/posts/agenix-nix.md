---
title: "Secrets in Nix, Publicly"
pubDate: 2026-05-06
modDate: 2026-05-06
cover:
  src: ~/assets/nix-age/nix-age.png
  alt: pwnwriter's talk in owasp Kathmandu
tags: ["nix", "security", "setup"]
---

I keep my entire Nix config in a public repo. Dotfiles, packages, shell setup,
everything. But I also need my SSH and GPG keys on every machine I use. Storing
private keys in a public repo is obviously a terrible idea. So how do you manage
secrets in Nix without going private?

The answer is [agenix].

## How it works

agenix uses [age] encryption. You encrypt secrets with your SSH **public** key,
and only someone with the matching **private** key can decrypt them. The
encrypted `.age` files live in your repo. On rebuild, agenix decrypts them
automatically.

```bash
nix
├── secrets/                     ~/.local/share/ssh/
│   ├── ssh-key.age  ───────────►  id_rsa (decrypted on rebuild)
│   └── gpg-key.age              id_ed25519 (decryption key)
├── secrets.nix
└── modules/agenix.nix
```

Anyone can clone the repo. Only I can use it.

## Setting it up

I generated a dedicated `ed25519` key for agenix. My existing RSA key stays
untouched for GitHub, servers, and everything else.

```bash
ssh-keygen -t ed25519 -C "agenix@pwnwriter" -f ~/.local/share/ssh/id_ed25519 -N "" # FIXME: change comment and path
```

### Add agenix to the flake

```diff
 inputs = {
   nixpkgs.url = "github:nixos/nixpkgs/nixpkgs-unstable";
   home-manager = { ... };
   darwin = { ... };
   catppuccin.url = "github:catppuccin/nix";
+
+  agenix = {
+    url = "github:ryantm/agenix";
+    inputs.nixpkgs.follows = "nixpkgs";
+  };
 };
```

### Define who can decrypt what

A `secrets.nix` file at the repo root maps public keys to secret files.

```nix
let
  pwnwriter = "ssh-ed25519 AAAA... agenix@pwnwriter"; # FIXME: your ed25519 public key
in
{
  "secrets/ssh-key.age".publicKeys = [ pwnwriter ]; # FIXME: your secret files
  "secrets/gpg-key.age".publicKeys = [ pwnwriter ];
}
```

This is just a list of public keys. Safe to commit. It tells agenix which keys
are allowed to encrypt and decrypt each secret.

### Encrypt the secrets

```bash
nix run github:ryantm/agenix -- -e secrets/ssh-key.age
nix run github:ryantm/agenix -- -e secrets/gpg-key.age
```

This opens your editor. Paste the secret, save, done. The output is an
encrypted `.age` file that only your ed25519 key can unlock.

### Wire it into home-manager

I created a module that tells agenix where the decryption key lives and where to
place the decrypted secrets.

```nix
# modules/agenix.nix
{ config, ... }:
{
  age = {
    identityPaths = [
      "${config.xdg.dataHome}/ssh/id_ed25519" # FIXME: path to your ed25519 key
    ];

    secrets = {
      ssh-key = {
        file = ../secrets/ssh-key.age;
        path = "${config.xdg.dataHome}/ssh/id_rsa"; # FIXME: where to place decrypted key
      };
      gpg-key = {
        file = ../secrets/gpg-key.age;
      };
    };
  };
}
```

Then each machine needs the agenix home-manager module. Here's the diff for one
of my darwin machines:

```diff nix
 # machines/earlymoon.nix
 let
   inherit (inputs)
     darwin
     home-manager
     catppuccin
+    agenix
     ;
 in
 darwin.lib.darwinSystem {
   modules = [
     home-manager.darwinModules.home-manager
     {
       home-manager.users.pwnwriter = { # FIXME: your username
         imports = [
           ./../modules
           catppuccin.homeModules.catppuccin
+          agenix.homeManagerModules.default
         ];
       };
     }
   ];
 }
```

Same pattern for every machine. My standalone home-manager config on Linux gets
the same one-liner.

### Rebuild

```bash
darwin-rebuild switch --flake .#earlymoon # FIXME: your machine name
```

That's it. agenix reads the ed25519 private key, decrypts the `.age` files, and
drops them where the module says. My SSH key appears at
`~/.local/share/ssh/id_rsa`, ready to use.

Five touchpoints total. No external services, no key servers, no runtime
daemons. Just age encryption and a rebuild.

### NOW,

## Adding a new secret later

```bash
# encrypt
nix run github:ryantm/agenix -- -e secrets/new-secret.age

# add to secrets.nix
"secrets/new-secret.age".publicKeys = [ pwnwriter ];

# add to modules/agenix.nix
age.secrets.new-secret.file = ../secrets/new-secret.age;
```

To edit an existing secret, same encrypt command. It decrypts to your editor,
you change it, and it re-encrypts on save.

<!--links-->

[agenix]: https://github.com/ryantm/agenix
[age]: https://age-encryption.org
[sops-nix]: https://github.com/Mic92/sops-nix
