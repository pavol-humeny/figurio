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
      'Upload image?',
      'Are you sure you want to upload this image?',
      'No!!!',
      'Yes, upload it!'
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
