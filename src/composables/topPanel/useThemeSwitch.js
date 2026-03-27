/**
 * @file: useThemeSwitch.js
 * @author: Pavol Humeny
 * @date: 15.5.2026
 * @description: Composable for managing the theme switcher in the top panel of the editor, including logic for toggling between light and dark themes and logging theme change events.
 */
import { computed } from 'vue'
import { useApi } from '@/composables/common/useApi'
const { addUserEvent } = useApi()

/**
 * Logic for toggling between light and dark theme
 * @param {Object} uiStore - The UI store with theme state and toggleTheme method
 */
export function useThemeSwitch(uiStore) {
  /**
   * Weather the light mode is active
   */
  const isLightMode = computed(() => uiStore.theme === 'light')

  /**
   * Toggle between light and dark modes
   */
  const toggleTheme = () => {
    const newMode = isLightMode.value ? 'dark' : 'light'

    addUserEvent('settingChanged', {
      setting: 'theme',
      value: newMode,
    })

    uiStore.toggleTheme()
  }

  return {
    isLightMode,
    toggleTheme,
  }
}
