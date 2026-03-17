/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: 'rgb(var(--color-primary) / <alpha-value>)',
        secondary: 'rgb(var(--color-secondary) / <alpha-value>)',
        dark: '#0f172a',
        light: '#f8fafc',
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        glass: '0 10px 30px rgba(2, 6, 23, 0.12)',
        soft: '0 6px 18px rgba(2, 6, 23, 0.08)',
      },
    },
  },
  plugins: [],
}
