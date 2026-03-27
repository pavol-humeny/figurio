/**
 * @file: useImportModal.js
 * @author: Pavol Humeny
 * @date: 15.5.2026
 * @description: Composable for managing the import modal in the editor, including logic for opening and closing the modal and logging user events related to the import process.
 */
import { ref } from 'vue'
import { useConsole } from '@/composables/common/useConsole.js'
import { useApi } from '@/composables/common/useApi'
const { addUserEvent } = useApi()

const { log } = useConsole()

/**
 * Whether the import modal is currently visible
 */
const isVisible = ref(false)

/**
 * Logic for managing the import modal in the editor
 */
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

  return {
    isVisible,
    openImportModal,
    closeImportModal,
  }
}
