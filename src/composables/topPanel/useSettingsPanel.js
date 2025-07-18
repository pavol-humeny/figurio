import { computed, ref, onMounted, onBeforeUnmount } from 'vue'
import { usePrivacyAndDataModal } from '@/composables/modals/usePrivacyAndDataModal'

const isVisible = ref(false)

export function useSettingsPanel(uiStore) {
  const { isVisible: privacyModalVisible, openPrivacyAndDataModal } = usePrivacyAndDataModal()

  const enableShortcuts = computed({
    get: () => uiStore.keyShortcutsEnabled,
    set: (val) => uiStore.setKeyShortcuts(val),
  })

  const resetPanelWidthDisabled = computed(() => {
    return (
      uiStore.rightPanelWidth === uiStore.rightPanelDefaultWidth || uiStore.rightPanelOpen === false
    )
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
    openPrivacyAndDataModal()
  }

  const handleKeydown = (e) => {
    if (e.key === 'Escape' && isVisible.value) {
      e.preventDefault()
      closeSettingsPanel()
    }
  }

  onMounted(() => {
    window.addEventListener('keydown', handleKeydown)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('keydown', handleKeydown)
  })

  return {
    isVisible,
    openSettingsPanel,
    closeSettingsPanel,
    enableShortcuts,
    resetPanelWidthDisabled,
    resetPanelWidth,
    openPrivacyModal,
    privacyModalVisible,
  }
}
