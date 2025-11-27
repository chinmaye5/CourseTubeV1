/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        'mono': ['Roboto Mono', 'monospace'],
      },
      colors: {
        green: {
          400: '#22c55e',
          500: '#16a34a',
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'typewriter': 'typewriter 2s steps(11) 1s 1 normal both, blinkTextCursor 500ms steps(11) infinite normal',
      }
    },
  },
  plugins: [],
}