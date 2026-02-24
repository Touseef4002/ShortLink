/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        /* ── Surfaces ── */
        'pg': '#F5F5F0',
        'pg-card': '#FFFFFF',
        'pg-elevated': '#EDEDEA',

        /* ── Text / ink ── */
        'ink': '#0A0A0A',
        'ink-secondary': '#6B6B6B',
        'ink-muted': '#A0A0A0',
        'ink-inverse': '#FFFFFF',

        /* ── Borders ── */
        'ln': '#E5E5E0',
        'ln-hover': '#D0D0CB',
        'ln-strong': '#C0C0BB',

        /* ── Accent ── */
        'accent': '#DC2626',
        'accent-hover': '#B91C1C',
        'accent-light': '#FEF2F2',

        /* ── Dark mode surfaces ── */
        'dk': '#0C0C0C',
        'dk-card': '#161616',
        'dk-elevated': '#1E1E1E',
        'dk-ln': '#2A2A2A',
        'dk-ln-hover': '#3A3A3A',
        'dk-muted': '#707070',
        'dk-secondary': '#999999',
        'dk-text': '#E8E8E8',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Instrument Serif"', 'Georgia', 'Times New Roman', 'serif'],
      },
      fontSize: {
        'display': ['clamp(3rem, 6vw, 4.5rem)', { lineHeight: '1.05', letterSpacing: '-0.02em' }],
        'h1': ['clamp(2.5rem, 5vw, 3.5rem)', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'h2': ['clamp(2rem, 4vw, 2.75rem)', { lineHeight: '1.15', letterSpacing: '-0.01em' }],
        'h3': ['clamp(1.5rem, 3vw, 2rem)', { lineHeight: '1.2' }],
        'h4': ['clamp(1.25rem, 2vw, 1.5rem)', { lineHeight: '1.25' }],
      },
      maxWidth: {
        'container': '1140px',
      },
      borderRadius: {
        'btn': '8px',
        'card': '12px',
        'pill': '999px',
      },
      boxShadow: {
        'xs': '0 1px 2px rgba(0,0,0,0.03)',
        'sm': '0 1px 3px rgba(0,0,0,0.04)',
        'md': '0 2px 8px rgba(0,0,0,0.05)',
        'overlay': '0 8px 30px rgba(0,0,0,0.12)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'scale-in': 'scaleIn 0.25s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(16px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}