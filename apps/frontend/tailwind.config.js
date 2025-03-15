/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        primary: ['Lora', 'serif'],
        secondary: ['David Libre', 'serif'],
      },
      colors: {
        primary: {
          yellow: '#FAF205',
          'dark-grey': '#2C2C2C',
          green: '#799A18',
          'light-grey': '#818286',
        },
        secondary: {
          'light-grey': '#C1C2C5',
          green: '#799A18',
        },
        neutral: {
          black: '#000000',
          white: '#FFFFFF',
          heading: '#5D5A88',
        },
      },
    },
  },
  plugins: [],
} 