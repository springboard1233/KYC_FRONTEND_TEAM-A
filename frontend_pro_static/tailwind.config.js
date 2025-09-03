/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f5f7ff',
          100: '#e6edff',
          300: '#7c83ff',
          500: '#5b62ff',
          700: '#3a3ff7'
        },
        surface: {
          DEFAULT: '#08080a',
          soft: '#0f1113'
        }
      },
      boxShadow: {
        glow: '0 8px 30px rgba(91,98,255,0.14)'
      }
    }
  },
  plugins: []
}
