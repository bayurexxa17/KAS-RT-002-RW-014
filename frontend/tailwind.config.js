/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#5e72e4",
        secondary: "#f7fafc",
        info: "#11cdef",
        success: "#2dce89",
        danger: "#f5365c",
        warning: "#fb6340",
        dark: "#32325d",
      },
      boxShadow: {
        'soft': '0 0.125rem 0.25rem rgba(0, 0, 0, 0.075)',
        'soft-xl': '0 20px 27px 0 rgba(0, 0, 0, 0.05)',
      }
    },
  },
  plugins: [],
}
