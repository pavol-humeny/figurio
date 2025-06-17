import { computed } from 'vue'

export function useUploadFileButton(imageStore, t) {
  const disabled = computed(() => {
    return imageStore.isImageLoaded()
  })

  const uploadFile = async () => {
    imageStore.loadFile(t)
  }

  return {
    disabled,
    uploadFile,
  }
}
