import { computed } from 'vue'

export function useCloseFileButton(imageStore){
  const disabled = computed(() => {
    return !imageStore.isImageLoaded()
  })

  const closeFile = () => {
    imageStore.closeFile()
  }

  return{
    disabled,
    closeFile,
  }
}
