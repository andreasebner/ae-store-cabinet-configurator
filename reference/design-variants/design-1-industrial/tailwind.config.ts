import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        forge: {
          base: '#1A1D23',
          surface: '#22262E',
          'surface-raised': '#2A2F38',
          'surface-overlay': '#323842',
          border: '#3A3F4A',
          'border-light': '#2E333C',
          orange: '#FF6B2C',
          'orange-dim': '#CC5523',
          amber: '#F5A623',
          red: '#E74C3C',
          green: '#27AE60',
          blue: '#3B82F6',
          text: '#E8EAED',
          'text-secondary': '#9DA3AE',
          'text-tertiary': '#6B7280',
          'text-muted': '#4B5563',
          steel: '#8B95A5',
          'steel-light': '#A8B0BC',
          'steel-dark': '#5C6370',
          canvas: '#12141A',
        },
      },
      fontFamily: {
        sans: ['DM Sans', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Cascadia Code', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '4px',
        sm: '2px',
      },
    },
  },
  plugins: [],
};

export default config;
