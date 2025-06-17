export function useThemeSwitch(uiStore) {
  const theme = uiStore.theme;

  const toggleTheme = () => {
    uiStore.toggleTheme()
  };

  return {
    theme,
    toggleTheme,
  };
}
