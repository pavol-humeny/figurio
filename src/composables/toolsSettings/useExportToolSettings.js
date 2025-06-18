import { ref } from 'vue'

const isVisible = ref(false)

export function useExportToolSettings(imageStore) {
  const openExportToolSettings = () => {
    isVisible.value = true
  }

  const closeExportToolSettings = () => {
    isVisible.value = false
  }

  return {
    isVisible,
    openExportToolSettings,
    closeExportToolSettings
  }
}
