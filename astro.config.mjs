import { defineConfig } from 'astro/config'; // import tailwind from '@astrojs/tailwind';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
	integrations: [tailwind({ config: { applyBaseStyles: false } })],
	markdown: { syntaxHighlight: 'prism' },
	site: 'https://pwnwriter.me',
});
