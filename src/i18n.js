/**
 * @file: i18n.js
 * @author: Pavol Humeny
 * @date: 15.5.2026
 */
import { createI18n } from 'vue-i18n'
import messages from '@/locales'
import { globalConfig } from '@/config/globalConfig'

// Get saved language or fallback to default
const rawSavedLanguage = localStorage.getItem(`${globalConfig.LOCAL_STORAGE_PREFIX}language`) || globalConfig.defaultLanguage

// Validate against supported languages
const isSupported = globalConfig.supportedLanguages.includes(rawSavedLanguage)
const savedLanguage = isSupported ? rawSavedLanguage : globalConfig.defaultLanguage

// Create i18n instance with the saved or default language
const i18n = createI18n({
  legacy: false,
  locale: savedLanguage,
  fallbackLocale: 'en',
  messages,
  globalInjection: true,
})

export default i18n
