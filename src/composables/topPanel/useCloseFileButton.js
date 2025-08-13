import { computed } from 'vue'
import { useConfirmModal } from '@/composables/modals/useConfirmModal'
import { useSendEvent } from '@/composables/common/useSendEvent'

/**
 * Logic for the Close File button in the top panel
 *
 * @param {object} imageStore - Store managing the currently active image
 * @param {object} workspaceStore - Store managing open files and tabs
 * @param {Function} t - Translation function from vue-i18n
 * @returns {{
 *   disabled: import('vue').ComputedRef<boolean>,
 *   closeFile: () => Promise<void>
 * }}
 */
export function useCloseFileButton(imageStore, workspaceStore, t) {
  const { showConfirmModal } = useConfirmModal()

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
    useSendEvent().sendEvent('buttonClicked', null, 'closeFile', {})

    const confirmed = await showConfirmModal(
      t('topPanel.closeFileButton.confirm.title'),
      t('topPanel.closeFileButton.confirm.message'),
      t('topPanel.closeFileButton.confirm.cancel'),
      t('topPanel.closeFileButton.confirm.confirm'),
    )
    if (confirmed) {
      workspaceStore.closeTab()
    }
  }

  return {
    disabled,
    closeFile,
  }
}
