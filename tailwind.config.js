/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: '#050816',
          surface: '#0a1128',
          card: '#0d1b3e',
          border: '#1a3a6b',
          cyan: '#00f0ff',
          teal: '#14e8c8',
          purple: '#a855f7',
          green: '#22c55e',
          red: '#ef4444',
          amber: '#f59e0b',
          muted: '#6b7fb3',
        },
      },
      fontFamily: {
        display: ['"Orbitron"', 'system-ui', 'sans-serif'],
        body: ['"Rajdhani"', 'system-ui', 'sans-serif'],
        mono: ['"Share Tech Mono"', 'monospace'],
      },
      boxShadow: {
        'neon-cyan': '0 0 20px rgba(0, 240, 255, 0.4), 0 0 40px rgba(0, 240, 255, 0.15)',
        'neon-teal': '0 0 20px rgba(20, 232, 200, 0.4), 0 0 40px rgba(20, 232, 200, 0.15)',
        'neon-purple': '0 0 20px rgba(168, 85, 247, 0.4), 0 0 40px rgba(168, 85, 247, 0.15)',
        'neon-green': '0 0 20px rgba(34, 197, 94, 0.4)',
        'neon-red': '0 0 20px rgba(239, 68, 68, 0.4)',
        'card': '0 4px 30px rgba(0, 0, 0, 0.5)',
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'scan': 'scan 3s linear infinite',
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'blink': 'blink 1s step-start infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(0, 240, 255, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(0, 240, 255, 0.6)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(400%)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.3' },
        },
      },
    },
  },
  plugins: [],
};
