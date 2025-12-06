import { ref } from 'vue'
import { useConfirmModal } from './useConfirmModal'
import { useApi } from '@/composables/common/useApi'
const { addUserEvent } = useApi()

/**
 * Whether the privacy and data modal is currently visible
 */
const isVisible = ref(false)

/**
 * Logic for the privacy and data modal with reset and Escape key support
 *
 * @param {Function} t - Translation function
 * @returns {{
 *   isVisible: import('vue').Ref<boolean>,
 *   openPrivacyAndDataModal: () => void,
 *   clearLocalStorage: () => Promise<void>,
 *   closePrivacyAndDataModal: () => void
 * }}
 */
export function usePrivacyAndDataModal(t) {
  const { showConfirmModal } = useConfirmModal()

  /**
   * Open the modal
   */
  const openPrivacyAndDataModal = () => {
    if (isVisible.value) {
      return
    }

    addUserEvent('openModal', { modal: 'privacyAndData' })

    isVisible.value = true
  }

  /**
   * Close the modal
   */
  const closePrivacyAndDataModal = () => {
    isVisible.value = false
  }

  /**
   * Clear localStorage and reload after confirmation
   */
  const clearLocalStorage = async () => {
    addUserEvent('buttonClicked', { button: 'clearLocalStorage' })

    localStorage.clear()

    const confirmed = await showConfirmModal(
      t('privacy.confirmResetLocalPreferences.title'),
      t('privacy.confirmResetLocalPreferences.text'),
      t('privacy.confirmResetLocalPreferences.cancel'),
      t('privacy.confirmResetLocalPreferences.confirm'),
    )
    if (confirmed) {
      closePrivacyAndDataModal()
      location.reload()
    }
  }

  return {
    isVisible,
    openPrivacyAndDataModal,
    clearLocalStorage,
    closePrivacyAndDataModal,
  }
}
