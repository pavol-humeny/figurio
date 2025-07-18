import { computed } from 'vue'
import { useConfirmModal } from '@/composables/modals/useConfirmModal'

export function useCloseFileButton(imageStore, t) {
  const disabled = computed(() => !imageStore.isImageLoaded)

  const { showConfirmModal } = useConfirmModal()

  const closeFile = async () => {
    if (disabled.value) return

    console.log('[Close File] Attempting to close file')

    const confirmed = await showConfirmModal(
      t('topPanel.closeFileButton.confirm.title'),
      t('topPanel.closeFileButton.confirm.message'),
      t('topPanel.closeFileButton.confirm.cancel'),
      t('topPanel.closeFileButton.confirm.confirm'),
    )
    if (confirmed) {
      imageStore.closeFile()
    }
  }

  return {
    disabled,
    closeFile,
  }
}
