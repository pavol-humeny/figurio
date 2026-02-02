import { ref } from 'vue'
import { globalConfig } from '@/config/globalConfig'

/**
 * Whether the error modal is visible
 */
const isVisible = ref(false)

/**
 * Composable for error modal
 */
export function useErrorModal(userModeStore) {
  /**
   * Show the error modal
   * @param {string} modalTitle - Title of the modal
   * @param {string} modalMessage - Message of the modal
   */
  const showErrorModal = () => {
    if (isVisible.value || isLocalhost() || !globalConfig.modalSettings.enableUnexpectedErrorModal)
      return

    if (userModeStore.hasUserAccessToFeature('notShowUnexpectedErrorModal')) return

    isVisible.value = true
  }

  /**
   * Checks if the app is running on localhost
   */
  const isLocalhost = () => {
    return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  }

  /**
   * Refresh the page
   */
  const refresh = () => {
    window.location.reload()
  }

  return {
    isVisible,
    showErrorModal,
    refresh,
  }
}
