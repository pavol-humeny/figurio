/**
 * @file: useCloseFileButton.js
 * @author: Pavol Humeny
 * @date: 15.5.2026
 * @description: Composable for managing the Close File button in the top panel of the editor, including logic for enabling/disabling the button based on whether an image is loaded and handling the file closing process with user confirmation when necessary.
 */
import { computed } from 'vue'
import { useConfirmModal } from '@/composables/modals/useConfirmModal'
import { useGeneralModal } from '@/composables/modals/useGeneralModal'
import { useApi } from '@/composables/common/useApi'
const { addUserEvent } = useApi()

/**
 * Logic for the Close File button in the top panel
 *
 * @param {object} imageStore - Store managing the currently active image
 * @param {object} workspaceStore - Store managing open files and tabs
 * @param {Function} t - Translation function from vue-i18n
 */
export function useCloseFileButton(imageStore, workspaceStore, t) {
  const { showConfirmModal } = useConfirmModal()
  const { showGeneralModal } = useGeneralModal()

  /**
   * Disable the close button if no image is loaded
   */
  const disabled = computed(() => !imageStore.isImageLoaded)

  /**
   * Ask for confirmation and close the current file tab
   */
  const closeFile = async () => {
    if (disabled.value) return

    // Send event
    addUserEvent('buttonClicked', { button: 'closeFile' })

    if (workspaceStore.numberOfTabs <= 1) {
      const confirmed = await showConfirmModal(
        t('topPanel.closeFileButton.confirm.title'),
        t('topPanel.closeFileButton.confirm.message'),
        t('topPanel.closeFileButton.confirm.cancel'),
        t('topPanel.closeFileButton.confirm.confirm'),
      )

      if (confirmed) {
        await workspaceStore.closeTab()
      }
    } else {
      const confirmed = await showGeneralModal(
        t('topPanel.closeFileButton.confirmMultiple.cancel'),
        t('topPanel.closeFileButton.confirmMultiple.confirm'),
        { closeAllFiles: false }, // payload
        'closeAllFiles', // modal type
        true, // If it can be closed by clicking outside (true)
      )

      if (confirmed) {
        if (confirmed.closeAllFiles) {
          await workspaceStore.closeAllTabs()
        } else {
          await workspaceStore.closeTab()
        }
      }
    }
  }

  return {
    disabled,
    closeFile,
  }
}
