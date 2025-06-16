import { useI18n } from 'vue-i18n'

export function useLanguageSwitch() {
  const { locale } = useI18n()

  const switchLanguage = (newLanguage) => {
    locale.value = newLanguage
    localStorage.setItem('language', newLanguage)
  }

  const savedLanguage = localStorage.getItem('language') || 'en'

  if (savedLanguage && savedLanguage !== locale.value){
    locale.value = savedLanguage
  }

  return {
    locale,
    switchLanguage
  }
}
