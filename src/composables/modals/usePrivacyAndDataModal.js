import { ref } from 'vue'
import { useConfirmModal } from './useConfirmModal'

const isVisible = ref(false)

export function usePrivacyAndDataModal(t) {
  const { showConfirmModal } = useConfirmModal()

  const showPrivacyAndDataModal = () => {
    if (isVisible.value) {
      return
    }
    isVisible.value = true
  }

  const closePrivacyAndDataModal = () => {
    isVisible.value = false
  }

  const clearLocalStorage = async () => {
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
    showPrivacyAndDataModal,
    clearLocalStorage,
    closePrivacyAndDataModal,
  }
}
