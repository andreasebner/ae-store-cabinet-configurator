import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          base: '#0A0E1A',
          surface: '#141929',
          raised: '#1A2035',
          elevated: '#1F2847',
        },
        cyan: {
          DEFAULT: '#00E5FF',
          dim: '#00B8CC',
          glow: 'rgba(0, 229, 255, 0.35)',
          subtle: 'rgba(0, 229, 255, 0.08)',
        },
        lime: {
          DEFAULT: '#A6FF00',
          glow: 'rgba(166, 255, 0, 0.3)',
          subtle: 'rgba(166, 255, 0, 0.08)',
        },
        red: {
          DEFAULT: '#FF3D5A',
          glow: 'rgba(255, 61, 90, 0.3)',
        },
        amber: {
          DEFAULT: '#FFAA00',
          glow: 'rgba(255, 170, 0, 0.3)',
        },
        text: {
          primary: '#E8ECF4',
          secondary: '#7B8BA8',
          tertiary: '#4A5672',
        },
        border: {
          DEFAULT: 'rgba(0, 229, 255, 0.1)',
          subtle: 'rgba(255, 255, 255, 0.05)',
        },
      },
      fontFamily: {
        chakra: ['var(--font-chakra)', 'Chakra Petch', 'sans-serif'],
        instrument: ['var(--font-instrument)', 'Instrument Sans', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        sans: ['var(--font-instrument)', 'Instrument Sans', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '6px',
        sm: '4px',
      },
      boxShadow: {
        'glow-cyan': '0 0 12px rgba(0, 229, 255, 0.35), 0 0 24px rgba(0, 229, 255, 0.1)',
        'glow-cyan-lg': '0 0 20px rgba(0, 229, 255, 0.5), 0 0 50px rgba(0, 229, 255, 0.2)',
        'glow-lime': '0 0 12px rgba(166, 255, 0, 0.3)',
        'glow-red': '0 0 12px rgba(255, 61, 90, 0.3)',
      },
      animation: {
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
        'subtle-pulse': 'subtlePulse 2s ease-in-out infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 8px rgba(0, 229, 255, 0.3), 0 0 20px rgba(0, 229, 255, 0.1)' },
          '50%': { boxShadow: '0 0 16px rgba(0, 229, 255, 0.5), 0 0 40px rgba(0, 229, 255, 0.15)' },
        },
        subtlePulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
