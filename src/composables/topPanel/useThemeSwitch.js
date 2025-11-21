import { computed } from 'vue'
import { useApi } from '@/composables/common/useApi'
const { addUserEvent } = useApi()

/**
 * Logic for toggling between light and dark theme
 *
 * @param {Object} uiStore - The UI store with theme state and toggleTheme method
 * @returns {{
 *   isLightMode: import('vue').ComputedRef<boolean>,
 *   toggleTheme: () => void
 * }}
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
    // theme,
    // toggleTheme,
    isLightMode,
    toggleTheme,
  }
}
