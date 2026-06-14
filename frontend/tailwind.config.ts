import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: 'var(--cream)',
        'cream-deep': 'var(--cream-deep)',
        maroon: 'var(--maroon)',
        'maroon-dark': 'var(--maroon-dark)',
        gold: 'var(--gold)',
        peach: 'var(--peach)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        divider: 'var(--divider)',
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
