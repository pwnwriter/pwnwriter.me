---
title: "How Nix Actually Works"
pubDate: 2026-08-02
modDate: 2026-08-02
tags: ["nix", "guide"]
---

Most people meet Nix as a package manager, get scared by the syntax, and leave.
That's a shame, because the whole thing is built on about three ideas. Once they
click, the weird `/nix/store/` paths, the reproducibility, the rollbacks, all of
it stops being magic.

No fluff. Let's look at what Nix is actually doing under the hood.

## 1. The language is just a calculator for attribute sets

Before any packaging, Nix is a small, lazy, purely functional language. No
statements, no loops, no mutation. Every expression evaluates to a value. Open a
repl and poke it:

```nix
$ nix repl
nix-repl> 1 + 2
3

nix-repl> "pwn" + "writer"
"pwnwriter"

nix-repl> { name = "nix"; year = 2003; }
{ name = "nix"; year = 2003; }

nix-repl> let x = 10; in x * x
100
```

Functions are `arg: body`. That colon is the whole syntax.

```nix
nix-repl> square = x: x * x
nix-repl> square 12
144

nix-repl> greet = name: "hello ${name}"
nix-repl> greet "world"
"hello world"
```

<mark>Everything you write in Nix is one big expression that evaluates to an
attribute set.</mark> Your whole NixOS config? One attribute set. A package? One
attribute set. That's the trick to reading any `.nix` file: find the set, follow
the attributes.

**Fun fact:** Nix is *lazy*. Nothing is evaluated until it's needed. You can
define an infinite value and Nix won't blink until you touch it:

```nix
nix-repl> rec { a = b; b = 1; }.a   # b defined after a, still fine
1
```

## 2. Everything is a derivation

A **derivation** is Nix's word for "a recipe to build one thing." A package, a
config file, a whole OS, all derivations. It's a pure function:

```
derivation = f(inputs) -> output in the store
```

Same inputs always produce the same output path. Here's the most minimal
derivation that exists, no nixpkgs, no helpers:

```nix
nix-repl> d = derivation {
            name = "hello";
            builder = "/bin/sh";
            args = [ "-c" "echo hi > $out" ];
            system = "x86_64-linux";
          }

nix-repl> d
«derivation /nix/store/xd6r...-hello.drv»
```

Notice it's a `.drv` file, not the result yet. A `.drv` is the *build plan*,
frozen JSON-ish that lists every input, the builder, and the env. Nix builds the
plan, not your live shell. You can read one raw:

```bash
$ nix derivation show nixpkgs#hello | head -20
{
  "/nix/store/...-hello-2.12.1.drv": {
    "outputs": { "out": { "path": "/nix/store/...-hello-2.12.1" } },
    "inputDrvs": { ... },
    "env": { "pname": "hello", "version": "2.12.1", ... }
  }
}
```

When people say "Nix builds a graph," this is the graph: `.drv` files pointing
at other `.drv` files, all the way down to bootstrap.

## 3. Why the store paths look like that

Every build lands in `/nix/store/` under a name like:

```
/nix/store/1q2w3e4r5t...-hello-2.12.1
           └──────┬──────┘ └────┬────┘
              the hash        the name
```

That prefix is a hash of **every input that went into the build**: the source,
the compiler, the build flags, the dependencies' hashes, recursively. Change one
flag, get a different hash, get a different path.

This is the entire foundation. It buys you three things for free:

- **No dependency hell.** Two apps needing different OpenSSL versions get two
  different store paths. They coexist. There is no "global" version of anything.
- **Atomic upgrades.** The new build goes to a *new* path. Nothing is
  overwritten. Switching is just repointing a symlink.
- **Caching that can't lie.** If the hash matches, the binary is byte-identical
  to what that recipe produces. So Nix can download a prebuilt result from a
  cache instead of building, and know it's correct.

Check what a path actually depends on. `path-info` only queries paths that are
already built, so realise it first:

```bash
$ nix build nixpkgs#hello --no-link      # pull it into the store
$ nix path-info -rsh nixpkgs#hello        # -r recursive, -s size, -h human
/nix/store/wl60...-libiconv-115.100.1     43.7 MiB
/nix/store/b63h...-hello-2.12.3          110.4 KiB
```

That list is the **closure**: everything needed to run `hello`, nothing global,
nothing implicit. The exact deps differ by platform: this is macOS, so `hello`
leans on `libiconv`; on Linux you'd see `glibc` and friends instead. Either way,
it's the *whole* runtime, spelled out.

### Wait, how does it *know* the deps?

Here's the part nobody tells you: Nix does not parse your code to find runtime
dependencies. After a build, it **scans the raw output bytes for store-path
hashes**. If a 32-character store hash shows up anywhere in the result, that path
is a dependency. That's the entire algorithm.

Don't believe me? The `hello` binary literally has the libiconv path baked into
it:

```bash
$ strings result/bin/hello | grep /nix/store
/nix/store/wl60...-libiconv-115.100.1/lib/libiconv.2.dylib

$ nix-store -q --references $(nix path-info nixpkgs#hello)
/nix/store/wl60...-libiconv-115.100.1        # ← same path, now a registered dep
```

Nix found `libiconv` because the string was *in the file*. This has real
consequences: `strip` a binary and its closure can shrink; leave a compiler's
path in a debug comment and you've accidentally added GCC to your runtime
closure. Dependencies aren't declared, they're *discovered*.

**Where do prebuilt results come from?** Since the hash pins the exact recipe,
Nix can ask a **binary cache** (`cache.nixos.org` by default, or your own via
[cachix]) "got a build for this hash?" before building. If yes, it downloads the
closure instead of compiling. A cache can't feed you the wrong thing, because the
only question is whether the hash matches. That's what "caching that can't lie"
actually means in practice.

## 4. Purity is enforced, not requested

Here's the part that makes reproducibility real instead of aspirational: Nix
builds in a **sandbox**. No network. No `/usr/bin`. No `$HOME`. No system time
that matters. If your build secretly `curl`s something or reads a file from the
host, it fails, on purpose.

That's why a Nix build on my Mac and on a CI runner in Frankfurt produce the same
store hash. The build literally *cannot* see anything that isn't a declared
input.

Want network access? You have to declare the hash of what you're downloading up
front, so the result is still deterministic:

```nix
fetchurl {
  url = "https://ftp.gnu.org/gnu/hello/hello-2.12.1.tar.gz";
  hash = "sha256-jZkUKv2SV28wsM18tCqNxoCZmLxdYH2Idh9RLibH2yA=";
  # ↑ if the download doesn't match this, the build fails
}
```

No hash, no network. The impurity is boxed in and pinned.

## 5. Reading the graph

Once you internalize "it's all a dependency graph," Nix ships tools to interrogate
it. This is genuinely useful for debugging bloat.

**Why is this thing even here?** (`--precise` shows the exact file that
references it, pin `perl.out` since Perl has multiple outputs.)

```bash
$ nix why-depends --precise nixpkgs#git nixpkgs#perl.out
/nix/store/...-git-2.54.0
└───bin/git-cvsserver: #!/nix/store/...-perl-5.42.0/bin/perl  use lib (…
    → /nix/store/...-perl-5.42.0
```

Git pulls in Perl because scripts like `git-cvsserver` have a Perl shebang. You
didn't have to guess. The graph told you which file did it.

**How big is the whole closure?**

```bash
$ nix path-info --closure-size -h nixpkgs#git
/nix/store/...-git-2.54.0   1.5 GiB
```

Yes, 1.5 GiB. Git's full closure drags in Perl, Python, and their deps. The
graph doesn't let anything hide.

**What changed between two builds?**

```bash
$ nix store diff-closures /run/current-system ./result
python3: 3.11.9 → 3.12.4, +2.1 MiB
openssl: 3.0.14 → 3.0.15
```

## 6. Generations: time travel that always works

Every time you rebuild, Nix keeps the old one. Your system profile is just a
symlink to the current generation, and the old generations are still sitting in
the store untouched.

```bash
$ nix-env --list-generations --profile /nix/var/nix/profiles/system
  42   2026-07-28 09:14:02
  43   2026-07-30 21:03:55
  44   2026-08-02 11:20:10   (current)
```

Broke your system on generation 44? Reboot, pick 43 from the boot menu, you're
back. Nothing was destroyed, because Nix never overwrites; it only ever adds a
new path and moves a symlink. Rollback is `nixos-rebuild switch --rollback`, and
it's instant because the old closure never left.

<mark>The store is append-only. That single design choice is why rollbacks can't
fail.</mark>

## Bending packages without forking

<aside class="marginalia" data-note="the moment nix stopped being a package manager to me">

Every package exposes `override` (change its *inputs*) and `overrideAttrs`
(change its *build*). You patch someone else's package inline, no fork, no
maintaining a copy:

</aside>

```nix
# add a patch and a build flag to upstream `hello`, in place
hello.overrideAttrs (old: {
  pname = "hello-patched";
  patches = (old.patches or [ ]) ++ [ ./fix.patch ];
  configureFlags = (old.configureFlags or [ ]) ++ [ "--enable-silent-rules" ];
})
```

And because you changed an input, the hash changes, so you get a *different*
store path. The original stays untouched:

```bash
$ nix eval --raw --expr \
    '(import <nixpkgs> {}).hello.overrideAttrs (o: { pname = "hello-patched"; }).name'
hello-patched-2.12.3
```

Scale that up with an **overlay** and you can rewrite any package in nixpkgs for
your whole system, from one file. That's the "why I keep coming back to Nix"
feeling: the entire ecosystem is a value you're allowed to edit.

## When a build breaks

Nix build errors scare people off, but the debugging tools are right there:

```bash
# see the full build log of anything (only for locally-built paths,
# not ones downloaded from a cache)
$ nix log nixpkgs#somepkg

# keep the failed build sandbox around so you can poke at it
$ nix build nixpkgs#somepkg --keep-failed

# drop into the exact environment the build runs in, then run the
# phases by hand: unpackPhase, configurePhase, buildPhase, ...
$ nix develop nixpkgs#somepkg
```

For a build that dies deep in a phase, add `breakpointHook` to the derivation
and Nix pauses *inside* the sandbox at the failure so you can look around. Beats
staring at a wall of C errors.

## Where flakes fit

You've seen `flake.nix` in every other post here without me ever saying what it
*is*. A flake is just this whole model with a clean boundary drawn around it: a
`flake.nix` with typed **inputs** (its dependencies, pinned) and **outputs**
(packages, dev shells, NixOS configs), plus a `flake.lock` that nails every
input to an exact commit hash. Same derivations, same store, same graph, now
reproducible down to the git rev and evaluated purely by default. That's why
`nix run nixpkgs#hello` and `.#wolf` from my [VPS post][nixos-hetzner] work the
way they do.

## Tricks I actually use

**Run anything without installing it.** The store makes this cheap; it downloads
the closure, runs it, and garbage-collects it later.

```bash
$ nix run nixpkgs#cowsay -- "no install, no trace"
$ nix run nixpkgs#nmap -- -sV scanme.nmap.org
```

**Drop into a shell with tools, just for now:**

```bash
$ nix shell nixpkgs#{ripgrep,fd,jq}
# rg, fd, jq available; exit the shell and they're gone from PATH
```

**"I typed a command that isn't installed."** [comma] runs it straight from
nixpkgs by finding which package ships that binary:

```bash
$ , htop        # not installed? comma fetches and runs it anyway
```

**Find which package provides a file:**

```bash
$ nix-locate bin/ffmpeg
ffmpeg-full.out   ...   bin/ffmpeg
ffmpeg.out        ...   bin/ffmpeg
```

**Pin nixpkgs to an exact commit** so a project builds the same in two years:

```bash
$ nix run github:nixos/nixpkgs/a1b2c3d4#hello
```

**Explore nixpkgs like a data structure**, because that's all it is:

```nix
$ nix repl -f '<nixpkgs>'
nix-repl> lib.version
"26.11pre-git"
nix-repl> hello.meta.description
"A program that produces a familiar, friendly greeting"
nix-repl> builtins.length (builtins.attrNames pkgs)   # top-level attrs
27648
```

## A few fun facts to leave with

- **The hash comes before the build.** Nix knows a package's store path *before
  it compiles anything*, because the path is derived from inputs, not output.
  That's how it checks the cache first and skips the build entirely.
- **`nixpkgs` is one giant function.** The entire package set is a single Nix
  expression that evaluates to an attribute set, with tens of thousands of top-level
  entries, many of them nested sets with thousands more. `import <nixpkgs> {}`
  calls it.
- **Reproducible enough to prove it.** Projects rebuild NixOS twice on different
  machines and diff the hashes bit-for-bit. [r13y.com] tracks how many packages
  are 100% reproducible.
- **`/nix/store` is world-readable and that's fine.** The hash *is* the identity,
  so there's nothing to hide and nothing to collide. Same reason I can keep [my
  whole config public][agenix].
- **Deleting is safe.** `nix-collect-garbage -d` only removes store paths that
  nothing (no generation, no profile, no shell) points at. The graph decides
  what's garbage, not you.

That's the mental model. Language → derivation → hashed store → sandbox. Every
fancy Nix feature is just those four ideas wearing a different hat. Once you see
the graph, you can't unsee it.

<!--links-->

[comma]: https://github.com/nix-community/comma
[cachix]: https://www.cachix.org
[nixos-hetzner]: /notes/nixos-hetzner
[r13y.com]: https://reproducible.nixos.org
[agenix]: /notes/agenix-nix
