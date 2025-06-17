import { computed } from 'vue'

export function useUploadFileButton(imageStore, t) {
  const disabled = computed(() => {
    return imageStore.isImageLoaded()
  })

  const uploadFile = () => {
    // TODO - show confirmation modal before uploading
    imageStore.uploadFile()
  }

  return {
    disabled,
    uploadFile,
  }
}
