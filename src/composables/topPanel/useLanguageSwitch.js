import { useI18n } from 'vue-i18n'

/**
 * Logic for switching and persisting application language
 *
 * @returns {{
 *   locale: import('vue').Ref<string>,
 *   switchLanguage: (newLanguage: string) => void,
 * }}
 */
export function useLanguageSwitch() {
  const { locale } = useI18n()

  /**
   * Load previously saved language preference
   */
  const savedLanguage = localStorage.getItem('language') || 'en'
  if (savedLanguage && savedLanguage !== locale.value) {
    locale.value = savedLanguage
  }

  /**
   * Switch the language and save to localStorage
   *
   * @param {string} newLanguage - Language code to switch to (e.g., 'en', 'sk')
   */
  const switchLanguage = (newLanguage) => {
    locale.value = newLanguage
    localStorage.setItem('language', newLanguage)
  }

  return {
    locale,
    switchLanguage,
  }
}
