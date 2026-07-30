module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
        'spin-slow': 'spin 3s linear infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'spin-slow': 'spin-slow 4s linear infinite',
        'bounce-gentle': 'bounce-gentle 2s ease-in-out infinite',
        'float-0': 'float-0 3s ease-in-out infinite',
        'float-1': 'float-1 3.5s ease-in-out infinite',
        'float-2': 'float-2 4s ease-in-out infinite',
      },
      colors: {
        'hot-pink': '#ff1493',
        'neon-purple': '#8a2be2',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}