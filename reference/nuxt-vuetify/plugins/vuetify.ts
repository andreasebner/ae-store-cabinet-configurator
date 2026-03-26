import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';

export default defineNuxtPlugin((app) => {
  const vuetify = createVuetify({
    components,
    directives,
    theme: {
      defaultTheme: 'light',
      themes: {
        light: {
          dark: false,
          colors: {
            primary: '#1565C0',
            secondary: '#546E7A',
            accent: '#00ACC1',
            error: '#D32F2F',
            warning: '#F9A825',
            info: '#0288D1',
            success: '#2E7D32',
            background: '#F5F7FA',
            surface: '#FFFFFF',
            'surface-variant': '#E8EDF2',
            'on-surface-variant': '#44474E',
          },
        },
      },
    },
    defaults: {
      VBtn: { rounded: 'lg', variant: 'flat' },
      VCard: { rounded: 'lg', elevation: 1 },
      VTextField: { variant: 'outlined', density: 'compact' },
      VSelect: { variant: 'outlined', density: 'compact' },
      VChip: { rounded: 'lg' },
    },
  });
  app.vueApp.use(vuetify);
});
