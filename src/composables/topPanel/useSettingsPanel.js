/**
 * @file: useSettingsPanel.js
 * @author: Pavol Humeny
 * @date: 15.5.2026
 * @description: Composable for managing the settings panel in the editor, including logic for toggling keyboard shortcuts, resetting panel width, and opening related modals for privacy and release notes.
 */
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
 * @param {Object} userModeStore - Store managing user permissions and modes
 */
export function useSettingsPanel(uiStore, userModeStore) {
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
   * Determine if the release notes modal can be opened based on user permissions
   */
  const releaseModalCanBeOpened = computed(() => {
    return userModeStore.hasUserAccessToFeature('releaseNotes')
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

  /**
   * Open the release notes modal if the user has access to it
   */
  const openReleaseModalSettingsPanel = () => {
    if (!userModeStore.hasUserAccessToFeature('releaseNotes')) {
      return
    }

    closeSettingsPanel()
    openReleaseModal()
  }

  /**
   * Close panel when clicking outside of it
   *
   * @param {MouseEvent} event - The mouse event
   */
  const handleClickOutside = (event) => {
    const target = event.target
    const settingsPanel = document.getElementById('settings-panel')

    if (target.closest('.item-tip-bubble')) {
      return
    }

    if (settingsPanel && !settingsPanel.contains(target)) {
      setTimeout(() => {
        closeSettingsPanel()
      }, 150)
    }
  }

  // Register global keydown listener to close settings panel
  onMounted(() => {
    window.addEventListener('mousedown', handleClickOutside)
  })

  // Cleanup listener on unmount
  onBeforeUnmount(() => {
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
    releaseModalCanBeOpened,
  }
}
