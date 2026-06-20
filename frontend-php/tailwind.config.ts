import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: 'rgb(var(--cream) / <alpha-value>)',
        'cream-deep': 'rgb(var(--cream-deep) / <alpha-value>)',
        maroon: 'rgb(var(--maroon) / <alpha-value>)',
        'maroon-dark': 'rgb(var(--maroon-dark) / <alpha-value>)',
        gold: 'rgb(var(--gold) / <alpha-value>)',
        peach: 'rgb(var(--peach) / <alpha-value>)',
        'text-primary': 'rgb(var(--text-primary) / <alpha-value>)',
        'text-secondary': 'rgb(var(--text-secondary) / <alpha-value>)',
        divider: 'rgb(var(--divider) / <alpha-value>)',
        surface: 'rgb(var(--surface) / <alpha-value>)',
      },
      fontFamily: {
        serif: ['var(--font-playfair)', 'Georgia', 'serif'],
        sans: ['var(--font-poppins)', 'system-ui', 'sans-serif'],
      },
      borderRadius: { card: '24px', input: '16px' },
    },
  },
  plugins: [],
};

export default config;
