import { computed, ref } from 'vue'

const isVisible = ref(false)
// const enableShortcuts = ref(true)
const resetPanelWidthDisabled = computed(() => {
  // TODO : Implement logic to determine if the reset panel width button should be disabled
  return false
})

export function useSettingsPanel(uiStore) {

  const enableShortcuts = computed({
    get: () => uiStore.keyShortcutsEnabled,
    set: (val) => uiStore.setKeyShortcuts(val)
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
    console.warn('resetPanelWidth is not implemented yet')
    // TODO
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

