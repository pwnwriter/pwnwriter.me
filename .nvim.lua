vim.pack.add({
  { src = "https://github.com/neovim/nvim-lspconfig", name = "lspconfig" }
})

vim.lsp.enable({
  "ts_ls",       -- typescript
  "astro",       -- astro
  "tailwindcss", -- tailwindcss
  "tinymist",    -- typst
  "harper_ls",   -- markdown
  "ty",          -- python
})

return {}
