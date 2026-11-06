/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Atlassian-inspired neutral scale
        ink: {
          DEFAULT: '#172B4D', // primary text
          subtle: '#44546F', // secondary text
          muted: '#626F86', // tertiary text
          disabled: '#8993A4',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          sunken: '#F4F5F7', // app background
          raised: '#FFFFFF',
          hover: '#F1F2F4',
          selected: '#E9F2FF',
        },
        line: {
          DEFAULT: '#DFE1E6',
          bold: '#C1C7D0',
        },
        brand: {
          // primary action / navigation blue
          50: '#E9F2FF',
          100: '#CCE0FF',
          200: '#85B8FF',
          300: '#579DFF',
          400: '#388BFF',
          500: '#0C66E4',
          600: '#0055CC',
          700: '#09326C',
        },
        // Status colors
        success: { bg: '#DCFFF1', fg: '#216E4E', border: '#7EE2B8' },
        warning: { bg: '#FFF7D6', fg: '#974F0C', border: '#F5CD47' },
        danger: { bg: '#FFECEB', fg: '#AE2A19', border: '#FD9891' },
        info: { bg: '#E9F2FF', fg: '#0055CC', border: '#85B8FF' },
        neutralTag: { bg: '#EBECF0', fg: '#44546F' },
        // Company accent (logo)
        tecno: { orange: '#D2451E', graphite: '#434041' },
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
      boxShadow: {
        card: '0 1px 1px rgba(9,30,66,0.13), 0 0 1px rgba(9,30,66,0.13)',
        raised: '0 1px 3px rgba(9,30,66,0.14), 0 0 1px rgba(9,30,66,0.12)',
        overlay: '0 8px 16px -4px rgba(9,30,66,0.18), 0 0 1px rgba(9,30,66,0.31)',
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem' }],
      },
    },
  },
  plugins: [],
}
