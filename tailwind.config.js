/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        mono: ['"IBM Plex Mono"', 'monospace'],
        sans: ['Outfit', 'sans-serif'],
      },
      colors: {
        base:        'rgb(var(--color-base) / <alpha-value>)',
        surface:     'rgb(var(--color-surface) / <alpha-value>)',
        raised:      'rgb(var(--color-raised) / <alpha-value>)',
        border:      'rgb(var(--color-border) / <alpha-value>)',
        muted:       'rgb(var(--color-muted) / <alpha-value>)',
        dim:         'rgb(var(--color-dim) / <alpha-value>)',
        secondary:   'rgb(var(--color-secondary) / <alpha-value>)',
        primary:     'rgb(var(--color-primary) / <alpha-value>)',
        bright:      'rgb(var(--color-bright) / <alpha-value>)',
        accent:      'rgb(var(--color-accent) / <alpha-value>)',
        'accent-dim':'rgb(var(--color-accent-dim) / <alpha-value>)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
