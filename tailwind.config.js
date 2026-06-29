/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        outfit: ['Outfit', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#465fff',
          600: '#3b4de8',
          800: '#1e3a8a',
          950: '#1e1b4b',
        },
        success: {
          50: '#f0fdf4',
          400: '#4ade80',
          500: '#22c55e',
        },
        error: {
          500: '#ef4444',
        }
      },
    },
  },
  plugins: [],
}
