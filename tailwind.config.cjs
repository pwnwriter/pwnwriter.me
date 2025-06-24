const { fontFamily } = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			spacing: {
				xs: '0.5rem',
				sm: '1rem',
				md: '2rem',
				lg: '3rem',
				xl: '6rem',
			},
			fontFamily: {
				sans: ['Arial', ...fontFamily.sans],
				serif: ['Georgia', ...fontFamily.serif],
				mono: ['Menlo', ...fontFamily.mono],
			},
			screens: {
				xs: '400px',
			},
			colors: {
				'f-high': 'var(--f-high)',
				'f-low': 'var(--f-low)',
				'b-high': 'var(--b-high)',
				'b-med': 'var(--b-med)',
				'b-low': 'var(--b-low)',
				accent: 'var(--accent)',
				background: 'var(--background)',
			},
			typography: ({ theme }) => ({
				custom: {
					css: {
						'--tw-prose-body': theme('colors.f-low'),
						'--tw-prose-headings': theme('colors.f-high'),
						'--tw-prose-lead': theme('colors.f-high'),
						'--tw-prose-links': theme('colors.f-high'),
						'--tw-prose-bold': theme('colors.f-high'),
						'--tw-prose-counters': theme('colors.f-high'),
						'--tw-prose-bullets': theme('colors.f-low'),
						'--tw-prose-hr': theme('colors.f-high'),
						'--tw-prose-quotes': theme('colors.f-high'),
						'--tw-prose-quote-borders': theme('colors.f-high'),
						'--tw-prose-captions': theme('colors.f-high'),
						'--tw-prose-code': theme('colors.f-high'),
						'--tw-prose-th-borders': theme('colors.f-high'),
						'--tw-prose-td-borders': theme('colors.f-high'),
					},
				},
			}),
		},
	},
	plugins: [require('@tailwindcss/typography')],
};
