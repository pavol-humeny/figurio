import { useUiStore } from "@/stores/uiStore";
import { storeToRefs } from "pinia";

export function useThemeSwitch() {
  const uiStore = useUiStore();
  const { theme } = storeToRefs(uiStore);

  const toggleTheme = () => {
    uiStore.toggleTheme()
  };

  return {
    theme,
    toggleTheme,
  };
}
