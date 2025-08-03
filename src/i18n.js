import { createI18n } from 'vue-i18n'
import messages from '@/locales'
import { globalConfig } from '@/config/globalConfig'

const savedLanguage = localStorage.getItem('language') || globalConfig.defaultLanguage

const i18n = createI18n({
  legacy: false,
  locale: savedLanguage,
  fallbackLocale: 'en',
  messages,
  globalInjection: true,
})

export default i18n
