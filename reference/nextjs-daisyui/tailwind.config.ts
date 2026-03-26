import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      {
        corporate: {
          ...require('daisyui/src/theming/themes')['corporate'],
          primary: '#4f46e5',
          'primary-content': '#ffffff',
          secondary: '#6366f1',
          accent: '#06b6d4',
          neutral: '#1e293b',
          'base-100': '#f8fafc',
          'base-200': '#f1f5f9',
          'base-300': '#e2e8f0',
          info: '#38bdf8',
          success: '#22c55e',
          warning: '#f59e0b',
          error: '#ef4444',
        },
      },
    ],
  },
};
export default config;
