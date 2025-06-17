import { computed, ref } from 'vue'

const isVisible = ref(false)
// const enableShortcuts = ref(true)


export function useSettingsPanel(uiStore) {

  const enableShortcuts = computed({
    get: () => uiStore.keyShortcutsEnabled,
    set: (val) => uiStore.setKeyShortcuts(val)
  })

  const resetPanelWidthDisabled = computed(() => {
    return uiStore.rightPanelWidth === uiStore.rightPanelDefaultWidth
  })

  const openSettingsPanel = () => {
    if (isVisible.value) {
      return
    }
    isVisible.value = true
  }

  const closeSettingsPanel = () => {
    isVisible.value = false
  }

  const resetPanelWidth = () => {
    if (resetPanelWidthDisabled.value) {
      return
    }
    if (uiStore.rightPanelWidth !== uiStore.rightPanelDefaultWidth) {
      uiStore.resetRightPanelWidth()
    }
  }

  const openPrivacyModal = () => {
    console.warn('openPrivacyModal is not implemented yet')
    // TODO
  }

  return {
    isVisible,
    openSettingsPanel,
    closeSettingsPanel,
    enableShortcuts,
    resetPanelWidthDisabled,
    resetPanelWidth,
    openPrivacyModal,
  }
}

