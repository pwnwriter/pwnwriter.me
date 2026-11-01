const { fontFamily } = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      spacing: {
        xs: "0.5rem",
        sm: "1rem",
        md: "2rem",
        lg: "3rem",
        xl: "6rem",
      },
      fontFamily: {
        sans: ["var(--font-sans)", ...fontFamily.sans],
        serif: ["var(--font-serif)", ...fontFamily.serif],
        mono: ["var(--font-mono)", ...fontFamily.mono],
      },
      screens: {
        xs: "400px",
      },
      colors: {
        "f-high": "var(--f-high)",
        "f-low": "var(--f-low)",
        "b-high": "var(--b-high)",
        "b-med": "var(--b-med)",
        "b-low": "var(--b-low)",
        accent: "var(--accent)",
        background: "var(--background)",
      },
    },
  },
  plugins: [],
};
