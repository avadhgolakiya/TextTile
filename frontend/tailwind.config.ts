import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#FFF8F2',
        'cream-deep': '#F5EDE0',
        maroon: '#7B1428',
        'maroon-dark': '#4E0A15',
        gold: '#BF9B45',
        peach: '#FDE8DF',
        'text-primary': '#1E0D07',
        'text-secondary': '#7A6860',
        divider: '#EDE5DC',
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
