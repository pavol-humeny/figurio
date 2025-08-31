import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { version } from './package.json'

// https://vite.dev/config/
export default defineConfig({
  base: '/BP_Image_editor/',
  plugins: [vue(), vueDevTools()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      reportsDirectory: './coverage',
      exclude: ['**/tests/**', '**/__mocks__/**'],
    },
  },
  define: {
    'process.env': {},
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(version),
  },
})
