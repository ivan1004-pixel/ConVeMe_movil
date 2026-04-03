/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // <-- ¡Asegúrate de que esta línea esté PERFECTA!
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Montserrat', 'sans-serif'],
      },
      colors: {
        brand: {
          pink: '#f88fea',
          blue: '#0301ff',
          beige: '#ede0d1',
        },
        dark: '#1A1A1A',
      }
    },
  },
  plugins: [],
}
