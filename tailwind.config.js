/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          50:  '#fefbf0',
          100: '#fdf3d0',
          200: '#fae49f',
          300: '#f5ce64',
          400: '#efb83a',
          500: '#C9A84C',
          600: '#b8922c',
          700: '#9a7423',
          800: '#7d5c22',
          900: '#684c21',
          950: '#3c290e',
        },
        cream: {
          50:  '#FDFAF4',
          100: '#FAF5EB',
          200: '#f5ebd6',
          300: '#ecd9b3',
          400: '#e0c288',
          500: '#d4a85f',
          600: '#c48e42',
          700: '#a47036',
          800: '#865a30',
          900: '#6e4b2a',
        },
        obsidian: {
          50:  '#f6f6f6',
          100: '#e7e7e7',
          200: '#d1d1d1',
          300: '#b0b0b0',
          400: '#888888',
          500: '#6d6d6d',
          600: '#5d5d5d',
          700: '#4f4f4f',
          800: '#454545',
          900: '#3d3d3d',
          950: '#0a0a0a',
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        sans:    ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #C9A84C 0%, #f5ce64 40%, #C9A84C 70%, #a47036 100%)',
        'dark-gradient': 'linear-gradient(180deg, #0a0a0a 0%, #1a1008 100%)',
      },
      keyframes: {
        'fade-up': {
          '0%':   { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'slide-in-right': {
          '0%':   { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
      },
      animation: {
        'fade-up':         'fade-up 0.6s ease-out forwards',
        'fade-in':         'fade-in 0.4s ease-out forwards',
        shimmer:           'shimmer 2s linear infinite',
        'slide-in-right':  'slide-in-right 0.35s cubic-bezier(0.16,1,0.3,1)',
        float:             'float 3s ease-in-out infinite',
      },
      boxShadow: {
        gold:    '0 4px 24px rgba(201,168,76,0.25)',
        'gold-lg':'0 8px 48px rgba(201,168,76,0.35)',
        luxury:  '0 25px 60px rgba(0,0,0,0.35)',
      },
      transitionTimingFunction: {
        luxury: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
  ],
}
