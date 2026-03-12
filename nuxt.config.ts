// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false,
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss'],
  app: {
    baseURL: '/Game_agent/',
    buildAssetsDir: 'assets'
  },
  vite: {
    server: {
      watch: {
        usePolling: true
      }
    }
  }
})
