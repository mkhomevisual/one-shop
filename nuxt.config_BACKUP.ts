// nuxt.config.ts

import svgLoader from 'vite-svg-loader'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',

  modules: ['@nuxtjs/tailwindcss'],

  tailwindcss: {
    // ať Nuxt načítá tvůj Tailwind config
    configPath: 'tailwind.config.ts'
  },

  // SVG jako Vue komponenty (můžeš je barvit přes Tailwind text-*)
  vite: {
    plugins: [
      svgLoader({
        defaultImport: 'component'
        // svgo: true, // nech default (můžeš si zapnout/ladit podle potřeby)
      })
    ]
  },

  devtools: { enabled: true },

  ssr: false,
})
