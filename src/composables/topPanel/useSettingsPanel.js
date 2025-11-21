import { computed, ref, onMounted, onBeforeUnmount } from 'vue'
import { usePrivacyAndDataModal } from '@/composables/modals/usePrivacyAndDataModal'
import { useReleaseModal } from '@/composables/modals/useReleaseModal'
import { useApi } from '@/composables/common/useApi'
const { addUserEvent } = useApi()

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
 *   enableRulers: import('vue').ComputedRef<boolean>,
 * }}
 */
export function useSettingsPanel(uiStore) {
  const { openPrivacyAndDataModal } = usePrivacyAndDataModal()
  const { openReleaseModal } = useReleaseModal()

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
      (uiStore.rightPanelWidth === uiStore.rightPanelDefaultWidth &&
        uiStore.svgObjectsListHeight === uiStore.svgObjectsListDefaultHeight) ||
      uiStore.rightPanelOpen === false
    )
  })

  /**
   * Open the settings panel
   */
  const openSettingsPanel = () => {
    if (isVisible.value) {
      return
    }

    addUserEvent('openModal', { modal: 'settingsPanel' })

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

    uiStore.resetRightPanelWidth()
    uiStore.resetSvgObjectsListHeight()
  }

  /**
   * Open the privacy and data modal
   */
  const openPrivacyModalSettingsPanel = () => {
    closeSettingsPanel()
    openPrivacyAndDataModal()
  }

  const openReleaseModalSettingsPanel = () => {
    closeSettingsPanel()
    openReleaseModal()
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

  /**
   * Close panel when clicking outside of it
   *
   * @param {MouseEvent} event - The mouse event
   */
  const handleClickOutside = (event) => {
    const target = event.target
    const settingsPanel = document.getElementById('settings-panel')

    if (settingsPanel && !settingsPanel.contains(target)) {
      setTimeout(() => {
        closeSettingsPanel()
      }, 150)
    }
  }

  // Register global keydown listener to close settings panel
  onMounted(() => {
    window.addEventListener('keydown', handleKeydown)
    window.addEventListener('mousedown', handleClickOutside)
  })

  // Cleanup listener on unmount
  onBeforeUnmount(() => {
    window.removeEventListener('keydown', handleKeydown)
    window.removeEventListener('mousedown', handleClickOutside)
  })

  return {
    isVisible,
    openSettingsPanel,
    closeSettingsPanel,
    enableShortcuts,
    resetPanelWidthDisabled,
    resetPanelWidth,
    openPrivacyModalSettingsPanel,
    enableRulers,
    openReleaseModalSettingsPanel,
  }
}
