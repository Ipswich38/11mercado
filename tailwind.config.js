/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Google Sans', 'Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Arial', 'sans-serif'],
      },
      colors: {
        // Material Design 3 Color System inspired by NotebookLM
        primary: {
          50: '#e8f0fe',
          100: '#d2e3fc',
          200: '#aecbfa',
          300: '#8ab4f8',
          400: '#669df6',
          500: '#4285f4',
          600: '#1a73e8',
          700: '#1557b0',
          800: '#103f78',
          900: '#0b2a52',
        },
        surface: {
          50: '#fafbff',
          100: '#f1f3f4',
          200: '#e8eaed',
          300: '#dadce0',
          400: '#bdc1c6',
          500: '#9aa0a6',
          600: '#80868b',
          700: '#5f6368',
          800: '#3c4043',
          900: '#202124',
        },
        // Semantic colors
        success: {
          50: '#e6f7ed',
          500: '#34a853',
          600: '#2d8f47',
        },
        warning: {
          50: '#fef7e0',
          500: '#fbbc04',
          600: '#ea8600',
        },
        error: {
          50: '#fce8e6',
          500: '#ea4335',
          600: '#d93025',
        },
      },
      borderRadius: {
        'material': '12px',
        'material-lg': '16px',
        'material-xl': '20px',
        'material-2xl': '24px',
      },
      boxShadow: {
        'material': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'material-md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'material-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'material-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      typography: {
        'display-large': {
          fontSize: '57px',
          lineHeight: '64px',
          fontWeight: '400',
        },
        'display-medium': {
          fontSize: '45px',
          lineHeight: '52px',
          fontWeight: '400',
        },
        'display-small': {
          fontSize: '36px',
          lineHeight: '44px',
          fontWeight: '400',
        },
        'headline-large': {
          fontSize: '32px',
          lineHeight: '40px',
          fontWeight: '400',
        },
        'headline-medium': {
          fontSize: '28px',
          lineHeight: '36px',
          fontWeight: '400',
        },
        'headline-small': {
          fontSize: '24px',
          lineHeight: '32px',
          fontWeight: '400',
        },
        'title-large': {
          fontSize: '22px',
          lineHeight: '28px',
          fontWeight: '400',
        },
        'title-medium': {
          fontSize: '16px',
          lineHeight: '24px',
          fontWeight: '500',
        },
        'title-small': {
          fontSize: '14px',
          lineHeight: '20px',
          fontWeight: '500',
        },
        'body-large': {
          fontSize: '16px',
          lineHeight: '24px',
          fontWeight: '400',
        },
        'body-medium': {
          fontSize: '14px',
          lineHeight: '20px',
          fontWeight: '400',
        },
        'body-small': {
          fontSize: '12px',
          lineHeight: '16px',
          fontWeight: '400',
        },
      },
    },
  },
  plugins: [],
}