/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Dashboard chrome (deep blue-grey, matches the reference dashboard)
        ink: {
          950: '#060d14',
          900: '#0a1622',
          850: '#0d1d2c',
          800: '#122636',
          700: '#1b3a4f',
          600: '#24506b',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Segoe UI', 'Helvetica Neue', 'Arial', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'ui-monospace', 'monospace'],
      },
      keyframes: {
        blink: { '0%,100%': { opacity: '1' }, '50%': { opacity: '0.25' } },
        floatIn: {
          '0%': { opacity: '0', transform: 'translateY(-4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        dash: { to: { strokeDashoffset: '-24' } },
      },
      animation: {
        blink: 'blink 1.4s ease-in-out infinite',
        floatIn: 'floatIn .18s ease-out',
        dash: 'dash 1.2s linear infinite',
      },
    },
  },
  plugins: [],
}
