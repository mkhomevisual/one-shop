// nuxt.config.ts
export default defineNuxtConfig({
  ssr: true,
  devtools: false,
  modules: ['@nuxtjs/tailwindcss'],
  nitro: {
    prerender: {
      crawlLinks: true,
      routes: ['/'],     // /admin neprerenderujeme (je to soubor z /public)
      failOnError: false
    }
  }
})
