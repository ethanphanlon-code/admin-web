/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './lib/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#E8F5F1',
          100: '#D1EBE3',
          200: '#A3D7C7',
          300: '#76C3AB',
          400: '#12A085',
          500: '#0D7C66',
          600: '#095C4B',
          700: '#063E33',
          800: '#042621',
          900: '#021411',
        },
        accent: {
          500: '#E8913A',
          600: '#C47A2E',
        },
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
