import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useConsole } from '@/composables/common/useConsole.js'
import { useApi } from '@/composables/common/useApi'
const { addUserEvent } = useApi()

const { log } = useConsole()

/**
 * Whether the import modal is currently visible
 */
const isVisible = ref(false)

export function useImportModal() {
  /**
   * Open the import modal
   */
  const openImportModal = () => {
    if (isVisible.value) {
      return
    }

    log('Opening import modal')

    addUserEvent('openModal', { modal: 'import' })

    isVisible.value = true
  }

  /**
   * Close the import modal
   */
  const closeImportModal = () => {
    isVisible.value = false
  }

  /**
   * Handle Escape key to close the modal
   *
   * @param {KeyboardEvent} event
   */
  const handleKeydown = (event) => {
    if (event.key === 'Escape' && isVisible.value) {
      event.preventDefault()
      closeImportModal()
    }
  }

  // Register Escape key handler
  onMounted(() => {
    window.addEventListener('keydown', handleKeydown)
  })

  // Cleanup key handler on unmount
  onBeforeUnmount(() => {
    window.removeEventListener('keydown', handleKeydown)
  })

  return {
    isVisible,
    openImportModal,
    closeImportModal,
  }
}
