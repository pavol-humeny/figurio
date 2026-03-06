import { useI18n } from 'vue-i18n'
import { globalConfig } from '@/config/globalConfig'
import { useApi } from '@/composables/common/useApi'
const { addUserEvent } = useApi()
import { useToolsSettingsTabs } from '../toolsSettings/useToolsSettingsTabs'

/**
 * Logic for switching and persisting application language
 *
 * @returns {{
 *   locale: import('vue').Ref<string>,
 *   switchLanguage: (newLanguage: string) => void,
 * }}
 */
export function useLanguageSwitch(editorStore, uiStore) {
  const { locale } = useI18n()
  const { recalculateSizeOfRightPanelToFitContent } = useToolsSettingsTabs(editorStore, uiStore, '')

  /**
   * Switch the language and save to localStorage
   *
   * @param {string} newLanguage - Language code to switch to (e.g., 'en', 'sk')
   */
  const switchLanguage = (newLanguage) => {
    addUserEvent('settingChanged', { setting: 'language', value: newLanguage })

    locale.value = newLanguage
    localStorage.setItem(`${globalConfig.LOCAL_STORAGE_PREFIX}language`, newLanguage)

    recalculateSizeOfRightPanelToFitContent()
  }

  return {
    locale,
    switchLanguage,
  }
}
