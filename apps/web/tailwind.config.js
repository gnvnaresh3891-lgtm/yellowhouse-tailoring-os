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
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Text"',
          '"SF Pro Display"',
          '"SF Pro"',
          'Inter',
          'system-ui',
          'sans-serif',
        ],
        display: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Display"',
          '"SF Pro"',
          'Inter',
          'system-ui',
          'sans-serif',
        ],
        mono: [
          '"SF Mono"',
          'ui-monospace',
          'Menlo',
          'Monaco',
          'Consolas',
          'monospace',
        ],
      },
      colors: {
        canvas: '#07090E',
        surface: {
          DEFAULT: '#0D111A',
          subtle: '#101625',
          elevated: '#141C2E',
          card: '#161D2E',
          hover: '#1B2438',
        },
        gold: {
          50: 'hsl(var(--gold-hue, 45), var(--gold-sat, 93%), 96%)',
          100: 'hsl(var(--gold-hue, 45), var(--gold-sat, 93%), 88%)',
          200: 'hsl(var(--gold-hue, 45), var(--gold-sat, 93%), 77%)',
          300: 'hsl(var(--gold-hue, 45), var(--gold-sat, 93%), 63%)',
          400: '#E4BF64',
          500: '#D4AF37', // Warm Atelier Gold
          600: '#C59B27', // Deep Burnished Gold
          700: '#A47D1C',
          800: '#7F5E16',
          900: '#543D0F',
          DEFAULT: '#D4AF37',
        },
        slate: {
          850: '#141E33',
          900: '#0F172A',
          925: '#0B0F19',
          950: '#07090E',
        },
      },
      boxShadow: {
        'ios-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.3), 0 1px 3px 1px rgba(0, 0, 0, 0.15)',
        'ios-md': '0 4px 14px -2px rgba(0, 0, 0, 0.45), 0 2px 6px -1px rgba(0, 0, 0, 0.25)',
        'ios-lg': '0 12px 30px -4px rgba(0, 0, 0, 0.55), 0 4px 12px -2px rgba(0, 0, 0, 0.35)',
        'ios-xl': '0 24px 50px -8px rgba(0, 0, 0, 0.65), 0 8px 24px -4px rgba(0, 0, 0, 0.45)',
        'ios-gold': '0 8px 25px -4px rgba(212, 175, 55, 0.25), 0 2px 8px -2px rgba(212, 175, 55, 0.15)',
        'ios-gold-lg': '0 16px 36px -4px rgba(212, 175, 55, 0.35), 0 4px 12px -2px rgba(212, 175, 55, 0.2)',
        'hairline': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.08)',
      },
      borderRadius: {
        '2.5xl': '1.25rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
        'squircle': '1.5rem',
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'spring-bounce': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'spring-subtle': 'cubic-bezier(0.25, 1, 0.5, 1)',
      },
      transitionDuration: {
        'spring': '300ms',
        'spring-fast': '200ms',
        'spring-slow': '450ms',
      },
      spacing: {
        '4.5': '1.125rem',
        '18': '4.5rem',
        '88': '22rem',
        '112': '28rem',
        '128': '32rem',
      },
      letterSpacing: {
        'tightest': '-0.035em',
        'tighter': '-0.025em',
        'tight': '-0.015em',
      },
    },
  },
  plugins: [],
};
