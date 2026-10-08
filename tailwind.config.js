/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Corporate B2B Visual System
        primary: {
          DEFAULT: '#0F2A43',  // Deep medical navy
          50: '#F0F5FA',
          100: '#D9E6F2',
          200: '#B3CCE3',
          700: '#163A5C',
          800: '#12304C',
          900: '#0F2A43',
          950: '#0A1C2E',
        },
        secondary: {
          DEFAULT: '#1769E0',  // Professional medical blue
          50: '#F0F6FE',
          100: '#E0EDFD',
          200: '#BFDCFA',
          500: '#257BF5',
          600: '#1769E0',
          700: '#1258BF',
          800: '#0E4496',
        },
        accent: {
          DEFAULT: '#13A8C7',  // Clean cyan/teal
          50: '#F0FAFC',
          100: '#DDF4F8',
          200: '#BAEAF1',
          500: '#13A8C7',
          600: '#0F8FA9',
          700: '#0C748A',
        },
        deepnavy: {
          DEFAULT: '#0F2A43',
          800: '#163A5C',
          900: '#0F2A43',
          950: '#0A1C2E',
        },
        medblue: {
          DEFAULT: '#1769E0',
          50: '#F0F6FE',
          100: '#E0EDFD',
          500: '#257BF5',
          600: '#1769E0',
          700: '#1258BF',
        },
        corporate: {
          navy: '#0F2A43',
          blue: '#1769E0',
          cyan: '#13A8C7',
          text: '#10233F',
          muted: '#64748B',
          bg: '#F8FAFC',
          border: '#E2E8F0',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Plus Jakarta Sans', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'xs': '0 1px 2px 0 rgba(16, 35, 63, 0.04)',
        'subtle': '0 1px 3px 0 rgba(16, 35, 63, 0.05), 0 1px 2px -1px rgba(16, 35, 63, 0.05)',
        'card': '0 2px 8px -2px rgba(16, 35, 63, 0.06), 0 1px 4px -1px rgba(16, 35, 63, 0.04)',
      },
    },
  },
  plugins: [],
};
