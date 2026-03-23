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
        base:    '#08090d',
        surface: '#0e1016',
        raised:  '#141620',
        border:  '#1c1f2e',
        muted:   '#2a2d3d',
        dim:     '#4a4f6a',
        secondary: '#7b82a0',
        primary: '#c8cdd8',
        bright:  '#eef0f6',
        accent:  '#4fffc8',
        'accent-dim': '#1a6b55',
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
