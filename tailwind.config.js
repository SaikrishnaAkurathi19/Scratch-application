/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: '#6C63FF',
        'primary-light': '#f0eeff',
        high: '#E24B4A',
        medium: '#F59E0B',
        low: '#16A34A',
      },
    },
  },
  plugins: [],
};
