/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          dark: '#0A192F',
          black: '#121212',
          white: '#F5F5F5',
          gray: '#4A4A4A',
          orange: '#FF4F00',
        },
        robotic: {
          blue: '#00D4FF',
          purple: '#8B5CF6',
          green: '#10B981',
        }
      },
      fontFamily: {
        'robotic': ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'scan': 'scan 2s linear infinite',
      },
      keyframes: {
        glow: {
          from: { boxShadow: '0 0 5px #FF4F00, 0 0 10px #FF4F00, 0 0 15px #FF4F00' },
          to: { boxShadow: '0 0 10px #FF4F00, 0 0 20px #FF4F00, 0 0 30px #FF4F00' }
        },
        scan: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' }
        }
      }
    },
  },
  plugins: [],
};