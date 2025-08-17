import { useI18n } from 'vue-i18n'
import { useSendEvent } from '@/composables/common/useSendEvent'
import { globalConfig } from '@/config/globalConfig'

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
   * Switch the language and save to localStorage
   *
   * @param {string} newLanguage - Language code to switch to (e.g., 'en', 'sk')
   */
  const switchLanguage = (newLanguage) => {
    useSendEvent().sendEvent('languageSwitch', null, null, { newLanguage: newLanguage })

    locale.value = newLanguage
    localStorage.setItem(`${globalConfig.LOCAL_STORAGE_PREFIX}language`, newLanguage)
  }

  return {
    locale,
    switchLanguage,
  }
}
