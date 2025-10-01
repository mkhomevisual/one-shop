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
      failOnError: false,
    },
  },
  // Admin je čisté SPA z /public, nechceme ho prerenderovat
  routeRules: {
    '/admin/**': { prerender: false },
  },
  // nastavení favicon a PWA
  app: {
    head: {
      link: [
        { rel: 'icon', href: '/favicon.ico' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
        { rel: 'manifest', href: '/site.webmanifest' },
      ],
      meta: [
        { name: 'theme-color', content: '#000000' },
      ],
    },
  },
});
