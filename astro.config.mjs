import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

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
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex],
    syntaxHighlight: "prism",
  },
  site: "https://pwnwriter.me",
});
