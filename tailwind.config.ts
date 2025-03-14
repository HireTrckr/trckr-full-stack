import type { Config } from 'tailwindcss';

export default {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class', // or 'media' if you want to respect system preferences
  theme: {
    extend: {
      colors: {
        // Map your theme variables to Tailwind classes
        background: {
          primary: 'var(--background-primary)',
          secondary: 'var(--background-secondary)',
        },
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
        },
        accent: {
          primary: 'var(--accent-color)',
          hover: 'var(--accent-hover)',
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
