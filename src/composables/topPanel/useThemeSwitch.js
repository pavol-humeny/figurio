import { computed } from 'vue'
import { useSendEvent } from '@/composables/common/useSendEvent'

/**
 * Logic for toggling between light and dark theme
 *
 * @param {Object} uiStore - The UI store with theme state and toggleTheme method
 * @returns {{
 *   theme: import('vue').ComputedRef<string>,
 *   toggleTheme: () => void
 * }}
 */
export function useThemeSwitch(uiStore) {
  /**
   * Currently active theme
   */
  const theme = computed(() => uiStore.theme)

  /**
   * Toggle between light and dark themes
   */
  const toggleTheme = () => {
    useSendEvent().sendEvent('themeToggle', null, null, {
      newTheme: theme.value === 'dark' ? 'light' : 'dark',
    })

    uiStore.toggleTheme()
  }

  return {
    theme,
    toggleTheme,
  }
}
