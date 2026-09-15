/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1DB954',
        dark: {
          950: '#0f0f0f',
          900: '#121212',
          800: '#1e1e1e',
          700: '#282828',
          600: '#404040',
        }
      },
      backdropBlur: {
        xs: '2px',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'pulse-subtle': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-in',
        'slide-up': 'slide-up 0.3s ease-out',
        'pulse-subtle': 'pulse-subtle 2s ease-in-out infinite',
      }
    },
  },
  plugins: [],
}