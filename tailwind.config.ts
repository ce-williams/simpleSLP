import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          50: '#F5F7F2',
          100: '#EAF2EC',
          200: '#D4E8DB',
          300: '#B9D3C2',
          400: '#8FA79A',
          500: '#6E8579',
          600: '#5B7366',
          700: '#4A6357',
          800: '#2B4D3E',
          900: '#1F7A55',
          950: '#0C2B20',
        },
        lime: {
          DEFAULT: '#C8F169',
          50: '#F4FCDF',
          100: '#E8F8BF',
          200: '#D8F499',
          300: '#C8F169',
          400: '#B0D94E',
          500: '#96BD3A',
        },
        sage: {
          50: '#FAFCF9',
          100: '#E6EDE8',
          200: '#DCE6DE',
          300: '#D3DFD6',
          400: '#B9D3C2',
          500: '#9DB8A8',
          600: '#8FA79A',
        },
        canopy: {
          text: '#0A1A13',
          muted: '#4A6357',
          subtle: '#5B7366',
          faint: '#9DB8A8',
          card: '#FFFFFF',
          highlight: '#E4F0E8',
        },
      },
      fontFamily: {
        sans: [
          'var(--font-sans)', 'system-ui', '-apple-system', 'BlinkMacSystemFont',
          '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial', 'sans-serif',
        ],
        mono: [
          'var(--font-mono)', 'ui-monospace', 'SFMono-Regular', '"SF Mono"',
          'Menlo', 'Consolas', 'monospace',
        ],
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem' }],
      },
      boxShadow: {
        'soft': '0 1px 3px 0 rgb(0 0 0 / 0.04), 0 1px 2px -1px rgb(0 0 0 / 0.04)',
        'card': '0 1px 3px 0 rgb(0 0 0 / 0.04)',
        'elevated': '0 8px 24px -4px rgb(12 43 32 / 0.08), 0 2px 8px -2px rgb(12 43 32 / 0.04)',
      },
      borderRadius: {
        'xl': '0.875rem',
        '2xl': '1.125rem',
        '3xl': '1.25rem',
      },
    },
  },
  plugins: [],
};

export default config;
