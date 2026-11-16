import { defineConfig } from "astro/config";
import remarkGfm from "remark-gfm";
import remarkMarkHighlight from "./src/lib/remark-mark-highlight.mjs";
import rehypeExternalLinks from "./src/lib/rehype-external-links.mjs";
import rehypeWrapTables from "./src/lib/rehype-wrap-tables.mjs";

export default defineConfig({
  vite: {
    server: {
      watch: {
        ignored: ["**/.direnv/**"],
      },
    },
  },
  markdown: {
    remarkPlugins: [remarkGfm, remarkMarkHighlight],
    rehypePlugins: [rehypeExternalLinks, rehypeWrapTables],
    syntaxHighlight: "prism",
  },
  site: "https://pwnwriter.me",
});
