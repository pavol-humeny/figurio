/**
 * @file: useLanguageSwitch.js
 * @author: Pavol Humeny
 * @date: 15.5.2026
 * @description: Composable for managing the language switcher in the top panel of the editor, including logic for switching languages, persisting the selected language in localStorage.
 */
import { useI18n } from 'vue-i18n'
import { globalConfig } from '@/config/globalConfig'
import { useApi } from '@/composables/common/useApi'
const { addUserEvent } = useApi()
import { useToolsSettingsTabs } from '../toolsSettings/useToolsSettingsTabs'

/**
 * Logic for switching and persisting application language
 * @param {object} editorStore - Store managing editor state
 * @param {object} uiStore - Store managing UI state
 */
export function useLanguageSwitch(editorStore, uiStore) {
  const { locale } = useI18n()
  const { recalculateSizeOfRightPanelToFitContent } = useToolsSettingsTabs(editorStore, uiStore, '')

  /**
   * Switch the language and save to localStorage
   *
   * @param {string} newLanguage - Language code to switch to ('en', 'sk', 'cz')
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
