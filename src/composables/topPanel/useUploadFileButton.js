import { computed } from 'vue'

export function useUploadFileButton(imageStore, t, router) {
  const disabled = computed(() => {
    return imageStore.isImageLoaded()
  })

  const uploadFile = async () => {
    imageStore.loadFile(t, router)
  }

  return {
    disabled,
    uploadFile,
  }
}
