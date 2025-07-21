import { computed, ref, onMounted, onBeforeUnmount } from 'vue'
import { usePrivacyAndDataModal } from '@/composables/modals/usePrivacyAndDataModal'

/**
 * Whether the settings panel is currently visible
 */
const isVisible = ref(false)

/**
 * Logic for the settings panel, including toggles and modal management
 *
 * @param {Object} uiStore - UI store instance
 * @returns {{
 *   isVisible: import('vue').Ref<boolean>,
 *   openSettingsPanel: () => void,
 *   closeSettingsPanel: () => void,
 *   enableShortcuts: import('vue').ComputedRef<boolean>,
 *   resetPanelWidthDisabled: import('vue').ComputedRef<boolean>,
 *   resetPanelWidth: () => void,
 *   openPrivacyModal: () => void,
 *   privacyModalVisible: import('vue').Ref<boolean>,
 *   enableRulers: import('vue').ComputedRef<boolean>,
 * }}
 */
export function useSettingsPanel(uiStore) {
  const { isVisible: privacyModalVisible, openPrivacyAndDataModal } = usePrivacyAndDataModal()

  /**
   * Enable or disable keyboard shortcuts
   */
  const enableShortcuts = computed({
    get: () => uiStore.keyShortcutsEnabled,
    set: (value) => uiStore.setKeyShortcuts(value),
  })

  /**
   * Enable or disable viewport rulers
   */
  const enableRulers = computed({
    get: () => uiStore.rulersEnabled,
    set: (value) => uiStore.setRulers(value),
  })

  /**
   * Disable reset button if panel is at default width or closed
   */
  const resetPanelWidthDisabled = computed(() => {
    return (
      uiStore.rightPanelWidth === uiStore.rightPanelDefaultWidth || uiStore.rightPanelOpen === false
    )
  })

  /**
   * Open the settings panel
   */
  const openSettingsPanel = () => {
    if (isVisible.value) {
      return
    }
    isVisible.value = true
  }

  /**
   * Close the settings panel
   */
  const closeSettingsPanel = () => {
    isVisible.value = false
  }

  /**
   * Reset panel width to default value
   */
  const resetPanelWidth = () => {
    if (resetPanelWidthDisabled.value) {
      return
    }
    if (uiStore.rightPanelWidth !== uiStore.rightPanelDefaultWidth) {
      uiStore.resetRightPanelWidth()
    }
  }

  /**
   * Open the privacy and data modal
   */
  const openPrivacyModal = () => {
    openPrivacyAndDataModal()
  }

  /**
   * Close panel on Escape key
   *
   * @param {KeyboardEvent} event - The keydown event
   */
  const handleKeydown = (event) => {
    if (event.key === 'Escape' && isVisible.value) {
      event.preventDefault()
      closeSettingsPanel()
    }
  }

  // Register global keydown listener to close settings panel
  onMounted(() => {
    window.addEventListener('keydown', handleKeydown)
  })

  // Cleanup listener on unmount
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
    enableRulers,
  }
}
