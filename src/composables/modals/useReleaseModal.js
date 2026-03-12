/**
 * @file: useReleaseModal.js
 * @author: Pavol Humeny
 * @date: 15.5.2026
 */
import { ref } from 'vue'
import { useApi } from '@/composables/common/useApi'
const { addUserEvent } = useApi()

/**
 * Whether the patch notes modal is currently visible
 */
const isVisible = ref(false)

/**
 * Logic for the patch notes modal with scrolling and Escape key support
 */
export function useReleaseModal() {
  /**
   * Reference to the scrollable content container
   */
  const releaseContentRef = ref(null)

  /**
   * Open the patch notes modal
   */
  const openReleaseModal = () => {
    if (isVisible.value) {
      return
    }

    addUserEvent('openModal', { modal: 'releaseNotes' })

    isVisible.value = true
  }

  /**
   * Close the patch notes modal
   */
  const closeReleaseModal = () => {
    isVisible.value = false
  }

  return {
    releaseContentRef,
    isVisible,
    openReleaseModal,
    closeReleaseModal,
  }
}
