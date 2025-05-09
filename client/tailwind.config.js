/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        black: '#1F1D2B',
        white: '#FFFFFF',
        grey: {
          DEFAULT: '#858585',
          light: '#E5E5E5'
        },
        primary: {
          DEFAULT: '#2364C0',
          light: '#F5F9FF'
        },
        secondary: {
          DEFAULT: '#38ABBE'
        },
        alert: '#ED6363',
        warning: '#FFFF00',
        success: '#51C17E'
      },
      fontFamily: {
        sans: ["Poppins", "sans-serif"]
      },
    },
  },
  plugins: [],
}

