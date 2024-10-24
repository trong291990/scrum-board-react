/** @type {import('tailwindcss').Config} */
export default {
  content: [
      "./index.html",
      "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
      extend: {
          fontSize: {
              'ssm': '0.625rem',
          },
      },
  },
  plugins: [],
}