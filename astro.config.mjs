import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import remarkMarkHighlight from "./src/lib/remark-mark-highlight.mjs";
import rehypeExternalLinks from "./src/lib/rehype-external-links.mjs";

export default defineConfig({
  vite: {
    server: {
      watch: {
        ignored: ["**/.direnv/**"],
      },
    },
  },
  integrations: [tailwind({ config: { applyBaseStyles: false } })],
  markdown: {
    remarkPlugins: [remarkGfm, remarkMarkHighlight, remarkMath],
    rehypePlugins: [rehypeKatex, rehypeExternalLinks],
    syntaxHighlight: "prism",
  },
  site: "https://pwnwriter.me",
});
