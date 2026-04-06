---
title: "nvim: per project configuration"
pubDate: 2026-04-02 
modDate: 2026-04-02
tags: [nvim, lua, dev]
---

I recently flipped the switch and upgraded to **Neovim 0.12**, and it’s a meaningful shift in how configuration and package management can be handled.

<img src="/images/syndications/neovim-11-12/neovim-11-12.png" alt="we" style="width: 100%; max-width: 500px; height: auto;" />

The standout change for me is the **built-in package manager**. 

### Leaving `lazy.nvim` Behind

Previously, I relied on `lazy.nvim` with a `.lazy.lua` setup. That approach worked well, but with the direction Neovim is heading, and things are getting inside neovim itself. Why to bother with external plugins.

So I migrated away from `lazy.nvim` to use the native package management approach.

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

* Installs `nvim-lspconfig` using the built-in package manager
* Enables a set of LSP servers with default config from upstream lspconfig plugin.

That’s it.
