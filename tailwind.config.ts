/** @type {import('tailwindcss').Config} */
export default {
	darkMode: ['class'],
	content: [
		'./pages/**/*.{ts,tsx}',
		'./components/**/*.{ts,tsx}',
		'./app/**/*.{ts,tsx}',
		'./src/**/*.{ts,tsx}',
	],
	prefix: '',
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px',
			},
		},
		extend: {
			fontFamily: {
				sans: [
					'Inter var',
					'ui-sans-serif',
					'system-ui',
					'sans-serif',
					'"Apple Color Emoji"',
					'"Segoe UI Emoji"',
					'"Segoe UI Symbol"',
					'"Noto Color Emoji"',
				],
			},
			colors: {
				// cobalt: {
				// 	50: 'oklch(97.29% 0.01 235.37)',
				// 	100: 'oklch(93.54% 0.03 242.68)',
				// 	200: 'oklch(89.05% 0.06 240.07)',
				// 	300: 'oklch(82.70% 0.10 237.87)',
				// 	400: 'oklch(74.45% 0.14 243.32)',
				// 	500: 'oklch(66.18% 0.18 252.49)',
				// 	600: 'oklch(58.98% 0.22 259.35)',
				// 	700: 'oklch(53.04% 0.23 261.53)',
				// 	800: 'oklch(45.53% 0.19 262.02)',
				// 	900: 'oklch(42.85% 0.16 260.95)',
				// 	950: 'oklch(39.37% 0.14 258.49)',
				// 	DEFAULT: 'oklch(42.85% 0.16 260.95)',
				// },
				// orange: {
				// 	'50': 'oklch(97.74% 0.02 70.54)',
				// 	'100': 'oklch(94.79% 0.04 69.88)',
				// 	'200': 'oklch(89.00% 0.08 65.30)',
				// 	'300': 'oklch(81.96% 0.12 60.06)',
				// 	'400': 'oklch(73.68% 0.18 48.95)',
				// 	'500': 'oklch(68.74% 0.21 40.89)',
				// 	'600': 'oklch(66.02% 0.23 35.40)',
				// 	'700': 'oklch(55.26% 0.20 33.90)',
				// 	'800': 'oklch(46.58% 0.16 32.93)',
				// 	'900': 'oklch(40.50% 0.13 33.84)',
				// 	'950': 'oklch(26.21% 0.09 32.63)',
				// 	DEFAULT: 'oklch(68.74% 0.21 40.89)',
				// },
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))',
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))',
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))',
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))',
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))',
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))',
				},
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' },
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' },
				},
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
			},
		},
	},
	plugins: [require('tailwindcss-animate')],
};
