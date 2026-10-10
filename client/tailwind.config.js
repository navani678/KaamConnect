/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fff8f1',
          100: '#feeedb',
          200: '#fddab7',
          300: '#fbbe88',
          400: '#f89953',
          500: '#f57c20', // Warm vibrant saffron/construction orange
          600: '#e56214',
          700: '#be4912',
          800: '#973a17',
          900: '#7a3116',
          950: '#421609',
        },
        worker: {
          blue: '#1e3a8a',
          navy: '#0f172a',
          amber: '#d97706',
          emerald: '#059669',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        'glow': '0 0 25px -5px rgba(245, 124, 32, 0.3)',
      }
    },
  },
  plugins: [],
}
