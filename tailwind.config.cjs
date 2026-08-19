module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        theme: {
          primary: 'var(--color-primary)',
          bg: 'var(--color-bg)',
          surface: 'var(--color-surface)',
          text: 'var(--color-text)',
          'text-secondary': 'var(--color-text-secondary)',
          accent: 'var(--color-accent)',
          border: 'var(--color-border)',
          hover: 'var(--color-hover)',
          'cell-bg': 'var(--color-calendar-cell-bg)',
          'cell-border': 'var(--color-calendar-cell-border)',
          'header-bg': 'var(--color-header-bg)',
        },
      },
    },
  },
  plugins: [],
}
