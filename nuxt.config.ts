// nuxt.config.ts
export default defineNuxtConfig({
  ssr: true,
  devtools: false,

  modules: ['@nuxtjs/tailwindcss'],
  tailwindcss: { cssPath: '~/assets/css/tailwind.css' },

  nitro: {
    preset: 'static',
    prerender: {
      crawlLinks: true,
      failOnError: false, // ať prerender kvůli drobnosti nespadne
    },
  },

  // Admin je čisté SPA z /public, nechceme ho prerenderovat
  routeRules: {
    '/admin/**': { prerender: false },
  },
})
