/**
 * @file: main.js
 * @author: Pavol Humeny
 * @date: 15.5.2026
 * @description: This is the main entry point of the application. It sets up the Vue app, registers global components and plugins, and mounts the app to the DOM. It also initializes the application state by loading presets from local storage and setting up global error handling. Additionally, it registers a service worker for offline support and handles updates when a new version of the app is available.
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
import { useConsole } from './composables/common/useConsole'
const { log } = useConsole()

/** Register service worker for offline support */
const updateSW = registerSW({
  onNeedRefresh() {
    log('New version available')

    // Activate new SW
    updateSW(true)

    // Force reload
    window.location.reload()
  },
  onOfflineReady() {
    log('App ready for offline use')
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
