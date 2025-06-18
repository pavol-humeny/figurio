import { computed } from 'vue';

export function useThemeSwitch(uiStore) {
  const theme = computed(() => uiStore.theme)

  const toggleTheme = () => {
    uiStore.toggleTheme()
  };

  return {
    theme,
    toggleTheme,
  };
}
