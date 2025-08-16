/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#006a78',
        secondary: '#1eaeba'
      },
      ringColor: {
        primary: '#006a78',
        secondary: '#1eaeba'
      }
    }
  },
  plugins: []
}
