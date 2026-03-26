import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify';

export default defineNuxtConfig({
  css: ['vuetify/styles', '@mdi/font/css/materialdesignicons.min.css', '~/assets/css/main.css'],
  build: { transpile: ['vuetify'] },
  modules: ['@pinia/nuxt',
    (_options, nuxt) => {
      nuxt.hooks.hook('vite:extendConfig', (config) => {
        config.plugins!.push(vuetify({ autoImport: true }));
      });
    },
  ],
  vite: { vue: { template: { transformAssetUrls } } },
  runtimeConfig: { public: { medusaUrl: process.env.MEDUSA_URL || 'http://localhost:9000' } },
});
