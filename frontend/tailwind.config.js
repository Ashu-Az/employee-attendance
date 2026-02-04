export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      animation: {
        'slide-in': 'slideIn 0.25s ease-out forwards',
        'fade-in': 'fadeIn 0.2s ease-out forwards',
        'slide-up': 'slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) both',
        'scale-in': 'scaleIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) both',
        'stagger-1': 'fadeUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) 0.05s both',
        'stagger-2': 'fadeUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both',
        'stagger-3': 'fadeUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) 0.15s both',
        'stagger-4': 'fadeUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both',
      },
      keyframes: {
        slideIn: {
          from: { opacity: '0', transform: 'translateX(80px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(-8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
