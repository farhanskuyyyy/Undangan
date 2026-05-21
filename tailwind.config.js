/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        sage: {
          DEFAULT: '#829460',
          dark: '#5F7144',
          light: '#A0B084',
        },
        cream: {
          DEFAULT: '#F3EFE0',
          dark: '#E5E1D1',
        },
        terracotta: '#BC8F8F',
        // Premium Wedding Design System Colors
        primary: '#DB2777', // Romantic Pink/Rose
        secondary: '#F472B6', // Soft Pink
        gold: '#CA8A04', // Elegant Gold
        blush: '#FDF2F8', // Blush Background
        burgundy: '#831843', // Deep text/accent burgundy
      },
      fontFamily: {
        serif: ['"Cormorant Infant"', '"Cormorant Garamond"', 'serif'],
        sans: ['"Montserrat"', '"Inter"', 'sans-serif'],
        script: ['"Great Vibes"', 'cursive'],
      },
      animation: {
        'spin-slow': 'spin 12s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        }
      }
    },
  },
  plugins: [],
}


