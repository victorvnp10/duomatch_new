module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        sans: ['"Manrope"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
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
        // Nova identidade visual — evita o "dark mode genérico" (cinza +
        // amarelo) em favor de um clima mais íntimo/noturno, com um
        // acento quente que não é nem o terracota nem o neon padrão.
        //
        // Em vez de editar cor por cor em ~40 componentes, remapeamos as
        // escalas `gray` (fundo/superfície/texto neutro) e `yellow`
        // (destaque/CTA principal) do próprio Tailwind — todo o app já
        // usa essas duas de forma consistente, então o reskin se aplica
        // sozinho a cada tela.
        gray: {
          50: '#FBF7F5',
          100: '#F4EAE4',
          200: '#E4D4CE',
          300: '#C9B8C0',
          400: '#9C8B96',
          500: '#766578',
          600: '#55475B',
          700: '#3D2F43',
          800: '#2A1F2E',
          900: '#1A1420',
        },
        yellow: {
          200: '#F0DFA8',
          300: '#E4C36F',
          400: '#C9A24B',
          500: '#B98D3A',
          600: '#A8823A',
          900: '#5C4620',
        },
        ink: {
          DEFAULT: '#1A1420',
          light: '#241A2C',
          lighter: '#2E2135',
        },
        plum: {
          DEFAULT: '#2A1F2E',
          light: '#392A3F',
        },
        accent: {
          DEFAULT: '#E0577D',
          light: '#EB84A0',
          dark: '#C43F63',
        },
        gold: {
          DEFAULT: '#C9A24B',
          light: '#DDBE73',
          dark: '#A8823A',
        },
        cream: '#F4EAE4',
        sage: {
          DEFAULT: '#7C9885',
          light: '#9BB3A2',
        },
      },
      boxShadow: {
        'glow-accent': '0 0 40px -8px rgba(224, 87, 125, 0.35)',
        'glow-gold': '0 0 40px -8px rgba(201, 162, 75, 0.35)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}