import { useI18n } from 'vue-i18n'
import { globalConfig } from '@/config/globalConfig'
import { useApi } from '@/composables/common/useApi'
const { addUserEvent } = useApi()

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
    addUserEvent('settingChanged', { setting: 'language', value: newLanguage })

    locale.value = newLanguage
    localStorage.setItem(`${globalConfig.LOCAL_STORAGE_PREFIX}language`, newLanguage)
  }

  return {
    locale,
    switchLanguage,
  }
}
