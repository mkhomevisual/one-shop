import type { Config } from 'tailwindcss'

export default {
  darkMode: 'class',
  content: [
    './components/**/*.{vue,js,ts}',
    './pages/**/*.{vue,js,ts}',
    './app.vue'
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          orange: '#F97316',     // Oranžová (hlavní)
          anthracite: '#1C1C1C', // Antracit
          gray: '#313131',       // Šedá
          white: '#FFFFFF'       // Bílá
        }
      }
    }
  },
  plugins: []
} satisfies Config
