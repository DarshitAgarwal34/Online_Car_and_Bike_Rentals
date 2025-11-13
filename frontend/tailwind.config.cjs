/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  safelist: [
    'bg-rr-orange', 'bg-rr-orange-light', 'bg-rr-orange-dark',
    'text-rr-orange', 'ring-rr-orange',
    'bg-rr-gray', 'text-rr-black'
  ],
  theme: {
    extend: {
      colors: {
        // RentRoam color palette
        rr: {
          orange: {
            DEFAULT: '#FF6A00', // main orange
            light: '#FFA04D',   // hover or highlight
            dark: '#CC5500',    // pressed or contrast
          },
          black: {
            DEFAULT: '#0B0B0D', // text / header bg
            light: '#1A1A1D',   // subtle dark sections
          },
          gray: {
            DEFAULT: '#F5F6F7', // background
            dark: '#3B3B3B',    // muted text or icons
          },
          white: '#FFFFFF',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 2px 10px rgba(0,0,0,0.06)',
      },
      borderRadius: {
        xl: '12px',
      },
    },
  },
  plugins: [],
};