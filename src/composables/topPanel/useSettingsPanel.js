import { computed, ref } from 'vue'
import { usePrivacyAndDataModal } from '@/composables/modals/usePrivacyAndDataModal';


const isVisible = ref(false)


export function useSettingsPanel(uiStore) {
  const {
    isVisible: privacyModalVisible,
    showPrivacyAndDataModal
  } = usePrivacyAndDataModal()

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
    showPrivacyAndDataModal()
  }

  return {
    isVisible,
    openSettingsPanel,
    closeSettingsPanel,
    enableShortcuts,
    resetPanelWidthDisabled,
    resetPanelWidth,
    openPrivacyModal,
    privacyModalVisible
  }
}

