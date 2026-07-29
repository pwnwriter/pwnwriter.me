---
title: "nvim: per project configuration"
pubDate: 2026-04-02
modDate: 2026-04-02
tags: [nvim, lua, dev]
---

I finally flipped my config to **Neovim 0.12**.

This release makes project-local config and package management feel much closer
to Neovim itself instead of another layer glued on top.

<img src="/images/syndications/neovim-11-12/neovim-11-12.png" alt="neovim 12" style="width: 100%; max-width: 500px; height: auto;" />

The part that got me interested: ==the built-in package manager==.

### Leaving `lazy.nvim` Behind

I was using `lazy.nvim` with a `.lazy.lua` setup. It worked fine, so this was not
some dramatic migration. But with more things moving into Neovim itself, I wanted
to see how far the native path could go.

So I moved this part away from `lazy.nvim` and tried the built-in approach.

Here’s what my `.nvim.lua` looks like now:

```lua
vim.pack.add({
  { src = "https://github.com/neovim/nvim-lspconfig", name = "lspconfig" }
})

vim.lsp.enable({
  "ts_ls", -- typescript
  "astro", -- astro
  "tailwindcss", -- tailwindcss
  "tinymist", -- typst
  "harper_ls", -- markdown
  "ty", -- python
})

return {}
```

### What This Does

- Installs `nvim-lspconfig` using the built-in package manager
- Enables a set of LSP servers using defaults from upstream `lspconfig`

<img src="/images/syndications/neovim-11-12/lsp.mov" alt="lsp usages" style="width: 100%; max-width: 500px; height: auto;" />

That’s it. Less config, fewer moving parts.
