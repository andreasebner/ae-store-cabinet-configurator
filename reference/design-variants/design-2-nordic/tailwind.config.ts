import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        nordic: {
          cream: '#FAF8F5',
          'warm-white': '#FFFFFF',
          linen: '#F5F2EE',
          sand: '#EDE8E1',
          clay: '#D9D0C7',
        },
        terracotta: {
          DEFAULT: '#C4644A',
          dark: '#A8523B',
          light: '#F3E0DA',
          muted: '#E8A998',
        },
        sage: {
          DEFAULT: '#7B9E87',
          dark: '#5F8369',
          light: '#E3EDE6',
          muted: '#A3C2AE',
        },
        'warm-gray': {
          50: '#F5F2EE',
          100: '#EDE8E3',
          200: '#DDD7D1',
          300: '#C4BCB5',
          400: '#A69E97',
          500: '#8A817A',
          600: '#6E6660',
          700: '#5C5550',
          800: '#4A433E',
          900: '#3D3532',
        },
        'warm-red': '#C96156',
      },
      fontFamily: {
        outfit: ['var(--font-outfit)', 'Outfit', 'sans-serif'],
        manrope: ['var(--font-manrope)', 'Manrope', 'sans-serif'],
        sans: ['var(--font-manrope)', 'Manrope', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '16px',
        sm: '10px',
        xs: '8px',
        '2xl': '16px',
        '3xl': '20px',
      },
      boxShadow: {
        'warm-sm': '0 1px 4px rgba(61, 53, 50, 0.04)',
        'warm': '0 2px 12px rgba(61, 53, 50, 0.06)',
        'warm-md': '0 4px 16px rgba(61, 53, 50, 0.08)',
        'warm-lg': '0 8px 32px rgba(61, 53, 50, 0.1)',
        'terracotta': '0 4px 16px rgba(196, 100, 74, 0.25)',
      },
    },
  },
  plugins: [],
};

export default config;
