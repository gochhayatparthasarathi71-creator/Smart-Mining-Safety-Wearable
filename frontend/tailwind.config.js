/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        safe: '#16a34a',
        warning: '#f59e0b',
        critical: '#dc2626',
        offline: '#6b7280',
        mine: {
          dark: '#0f172a',
          panel: '#1e293b',
          border: '#334155',
          accent: '#fbbf24',
        },
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
};
