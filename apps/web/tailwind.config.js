/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          50: 'hsl(var(--gold-hue), var(--gold-sat), 96%)',
          100: 'hsl(var(--gold-hue), var(--gold-sat), 88%)',
          200: 'hsl(var(--gold-hue), var(--gold-sat), 77%)',
          300: 'hsl(var(--gold-hue), var(--gold-sat), 63%)',
          400: '#FACC15',
          500: '#EAB308',
          600: '#CA8A04',
          700: 'hsl(var(--gold-hue), 80%, 30%)',
        },
        slate: {
          850: '#141E33',
          950: '#0B0F19',
        }
      },
    },
  },
  plugins: [],
}

