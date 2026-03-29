/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#000000',
        neon: {
          purple: '#A100FF',
        }
      },
      boxShadow: {
        'neon': '0 0 5px theme("colors.neon.purple"), 0 0 20px theme("colors.neon.purple")',
        'neon-hover': '0 0 10px theme("colors.neon.purple"), 0 0 30px theme("colors.neon.purple"), 0 0 50px theme("colors.neon.purple")',
      }
    },
  },
  plugins: [],
}
