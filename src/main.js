/**
 * @file: main.js
 * @author: Pavol Humeny
 * @date: 15.5.2026
 */
import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { useUiStore } from '@/stores/uiStore'
import { usePresetsStore } from '@/stores/presetsStore'
import { setupGlobalErrorHandling } from '@/composables/editor/globalErrorHandler.js'
import { registerSW } from 'virtual:pwa-register'

import App from './App.vue'
import router from './router'
import i18n from './i18n'

const updateSW = registerSW({
  onNeedRefresh() {
    console.log('New version available')

    // Activate new SW
    updateSW(true)

    // Force reload
    window.location.reload()
  },
  onOfflineReady() {
    console.log('App ready for offline use')
  },
})

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(i18n)

useUiStore().initApp()
usePresetsStore().loadFromStorage()
setupGlobalErrorHandling(app)

app.mount('#app')
