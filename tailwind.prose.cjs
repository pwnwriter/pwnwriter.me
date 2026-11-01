/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/components/prose.astro",
    "./src/layouts/Post.astro",
    "./src/pages/syndications/[slug].astro",
  ],
  corePlugins: { preflight: false },
  plugins: [require("@tailwindcss/typography")],
};
