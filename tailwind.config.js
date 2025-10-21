/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        tron: {
          bg: '#0a0e27',
          'bg-light': '#0f1729',
          'bg-lighter': '#151d3b',
          cyan: '#00d9ff',
          'cyan-dim': '#0099cc',
          orange: '#ff6c00',
          pink: '#ff00ff',
          'text-primary': '#e0f7ff',
          'text-secondary': '#8bb8d9',
          'text-dim': '#5a7a94',
          border: '#1a3a52',
        },
      },
      boxShadow: {
        'tron-glow': '0 0 20px rgba(0, 217, 255, 0.3)',
        'tron-glow-lg': '0 0 40px rgba(0, 217, 255, 0.4)',
      },
    },
  },
  plugins: [],
};
