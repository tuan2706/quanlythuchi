/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Inter', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        border: 'var(--border)',
        'border-strong': 'var(--border-strong)',
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        'surface-2': 'var(--surface-2)',
        ink: 'var(--ink)',
        muted: 'var(--muted)',
        brand: {
          DEFAULT: 'hsl(var(--brand) / <alpha-value>)',
          light: 'var(--brand-light)',
        },
        income: 'hsl(var(--income) / <alpha-value>)',
        expense: 'hsl(var(--expense) / <alpha-value>)',
        warn: 'hsl(var(--warn) / <alpha-value>)',
      },
      borderRadius: {
        xl2: '1.25rem',
        '3xl': '1.75rem',
        '4xl': '2.25rem',
      },
      boxShadow: {
        soft: '0 1px 2px 0 rgb(0 0 0 / 0.16), 0 1px 6px -1px rgb(0 0 0 / 0.16)',
        card: '0 8px 24px -8px rgb(0 0 0 / 0.35), 0 2px 8px -2px rgb(0 0 0 / 0.25)',
        float: '0 12px 40px -8px rgb(0 0 0 / 0.5)',
        glow: '0 8px 28px -4px var(--brand-glow)',
      },
      backdropBlur: {
        xs: '2px',
      },
      keyframes: {
        'fade-in': { from: { opacity: 0, transform: 'translateY(4px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        'scale-in': { from: { opacity: 0, transform: 'scale(0.96)' }, to: { opacity: 1, transform: 'scale(1)' } },
        'sheet-up': { from: { transform: 'translateY(100%)' }, to: { transform: 'translateY(0)' } },
        'sheet-overlay': { from: { opacity: 0 }, to: { opacity: 1 } },
        pop: { '0%': { transform: 'scale(0.9)', opacity: 0 }, '60%': { transform: 'scale(1.03)' }, '100%': { transform: 'scale(1)', opacity: 1 } },
      },
      animation: {
        'fade-in': 'fade-in 0.25s ease-out',
        'scale-in': 'scale-in 0.18s cubic-bezier(0.16,1,0.3,1)',
        'sheet-up': 'sheet-up 0.32s cubic-bezier(0.16,1,0.3,1)',
        'sheet-overlay': 'sheet-overlay 0.25s ease-out',
        pop: 'pop 0.22s cubic-bezier(0.16,1,0.3,1)',
      },
    },
  },
  plugins: [],
}
