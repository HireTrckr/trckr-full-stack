/** @type {import('tailwindcss').Config} */

import colors from 'tailwindcss/colors';

module.exports = {
  safelist: [
    {
      pattern:
        /^(bg|text|ring|border)-.*-(50|100|200|300|400|500|600|700|800|900|950)$/,
    },
  ],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './_error.tsx',
    './error.tsx',
    './pages/_error.tsx',
    './pages/error.tsx',
  ],
  darkMode: 'class', // or 'media' if you want to respect system preferences
  theme: {
    extend: {
      transitionDuration: {
        text: '100ms',
        bg: '300ms',
      },
      boxShadow: {
        light:
          '0 2px 15px -3px rgba(0,0,0,0.07), 0 10px 20px -2px rgba(0,0,0,0.04)',
        dark: '0 2px 15px -3px rgba(255,255,255,0.07), 0 10px 20px -2px rgba(255,255,255,0.04)',
      },
      colors: {
        background: {
          primary: 'var(--background-primary)',
          secondary: 'var(--background-secondary)',
        },
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          accent: 'var(--text-accent)',
        },
        accent: {
          primary: 'var(--accent-color)',
        },
      },
    },
  },
  plugins: [],
};
