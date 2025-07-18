import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useConfirmModal } from './useConfirmModal'

const isVisible = ref(false)

export function usePrivacyAndDataModal(t) {
  const { showConfirmModal } = useConfirmModal()

  const openPrivacyAndDataModal = () => {
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

  const handleKeydown = (e) => {
    if (e.key === 'Escape' && isVisible.value) {
      e.preventDefault()
      closePrivacyAndDataModal()
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
    openPrivacyAndDataModal,
    clearLocalStorage,
    closePrivacyAndDataModal,
  }
}
