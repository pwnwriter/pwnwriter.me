---
title: "Typst for University Notes"
pubDate: 2025-07-17T08:26:54-04:00
modDate: 2025-07-17T08:26:54-04:00
tags: ['guide', 'typst', 'productivity']
---
> _“Your assignments look so beautiful — do you spend hours making them?”_  
My professor once asked me this with genuine curiosity.

The truth? **Not really.** I just take my rough class notes, clean them up a bit, and turn them into polished PDFs — all in far less time than most of my classmates.

---

### Why I moved from Markdown to Typst

In my first two semesters, I relied on [Markdown] and [Obsidian] to take notes, [Git] to version them, and [GitHub] to back them up. I exported them as PDFs when needed. It worked — but it always felt like a patchwork solution.

Then I discovered [Typst] — a modern typesetting system built for simplicity and power. The moment I tried it, I knew this was the upgrade I needed. Typst gives me **beautiful PDFs, powerful macros, and math support** — all without the friction I had with Markdown.

>  _Here’s a screenshot of a CSIT assignment I did using Typst:_

![Typst Assignment][typst-assignment]

---

### My Workflow: Typst + Git + Neovim

Here’s how I’ve set up my note-taking flow now:

- A dedicated `Git` repo for notes on `Github`.
- [Neovim] as my editor with [tinymist] for Typst LSP.
- A `flake` / `nix-direnv` for all dependencies.

---

Now, you'd be asking, why this complex setup??

- I use `NixOS` and macOS, so flakes work everywhere.
- I love `git push/pull` workflow.
- I can use `Neovim` as the editor.

### My `flake.nix` setup

```nix
{
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
  };

  outputs = { nixpkgs, ... }:
    let
      systems = [ "x86_64-linux" "aarch64-linux" "x86_64-darwin" "aarch64-darwin" ];
      forAllSystems = f: nixpkgs.lib.genAttrs systems (system: f (import nixpkgs { inherit system; }));
    in {
      devShells = forAllSystems (pkgs: {
        default = pkgs.mkShell {
          packages = with pkgs; [
            typst         # Typesetting
            tinymist      # LSP for Typst
            python3       # Python runtime
            basedpyright  # Python LSP
            ruff          # Formatter
            uv            # Python package manager
          ];

          env.LD_LIBRARY_PATH = pkgs.lib.makeLibraryPath [
            pkgs.libz
            pkgs.stdenv.cc.cc.lib
          ];
        };
      });
    };
}
````

---

### Neovim Configuration

I use `lazy.nvim` plugin manager which allows having a seprate `.lazy.lua` file for setting up plugins specific to the project `directory`.

Here’s my `.lazy.lua` spec for the `lazy.nvim` plugin manager which sets the `lsp` for `python` and `typst` with a couple of keybind for the specific project only.

```lua
return {
  {
    "neovim/nvim-lspconfig",
    name = "lspconfig",
    event = { "BufReadPost", "BufNewFile" },
  },

  vim.lsp.enable({ 'basedpyright', 'tinymist' }),

  vim.api.nvim_create_autocmd("filetype", {
    pattern = "python",
    callback = function()
      vim.keymap.set("n", "<leader>lf", function()
        vim.cmd("silent! !ruff format %") -- Format current file
        vim.cmd("edit!")                  -- Reload file after formatting
      end, { desc = "Format Python file with ruff" })
    end,
  }),
}
```


With this, I get inline errors, autocompletion, signature help, and quick formatting — exactly what I want.
Here’s how it feels in action:

![typst-nvim]


---

### Final Thoughts


At this point, Typst feels like the real OG. A couple of years ago, my older
brothers introduced me to LaTeX — and I thought that was the gold standard. But
after showing them Typst, even they’ve made the switch.

I’m still keeping an eye on the [HTML support] pull request, which would make
it even easier to integrate Typst on many places like even website itself.. But
even now, it’s already changed how I work.

If you’re a student, especially one who writes a lot of math-heavy content, I
can’t recommend Typst enough.


<!-- Links -->

[Markdown]: https://daringfireball.net/projects/markdown/
[Obsidian]: https://obsidian.md
[Git]: https://git-scm.com
[GitHub]: https://github.com
[Typst]: https://typst.app
[Neovim]: https://neovim.io/
[tinymist]: https://github.com/nyinyithann/tinymist
[typst-assignment]: ~/assets/typst/typst-assignment.png
[typst-nvim]: https://github.com/user-attachments/assets/feafaffe-3db2-4e67-8bb0-ae16d3b69744
[HTML support]: https://github.com/typst/typst/issues/5512
