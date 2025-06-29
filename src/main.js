import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { useUiStore } from '@/stores/uiStore'
import { usePresetsStore } from '@/stores/presetsStore'


import App from './App.vue'
import router from './router'
import i18n from './i18n'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(i18n)

useUiStore().initApp()
usePresetsStore().loadFromStorage()

app.mount('#app')
