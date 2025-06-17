import { computed } from 'vue'
import { useConfirmModal } from '../modals/useConfirmModal'

export function useUploadFileButton(imageStore, t) {
  const disabled = computed(() => {
    return imageStore.isImageLoaded()
  })

  const { showConfirmModal } = useConfirmModal()

  const uploadFile = async () => {
    // TODO - show confirmation modal before uploading
    const confirmed = await showConfirmModal(
      t("topPanel.uploadFileButton.confirm.title"),
      t("topPanel.uploadFileButton.confirm.message"),
      t("topPanel.uploadFileButton.confirm.cancel"),
      t("topPanel.uploadFileButton.confirm.confirm")
    )
    if (confirmed) {
      imageStore.uploadFile()
    }
  }

  return {
    disabled,
    uploadFile,
  }
}
