import { ref } from 'vue'


export function useDragAndDropArea(imageStore, t, router) {
  const isDragging = ref(false)

  const handleDragOver = (event) => {
    event.preventDefault()
    isDragging.value = true
  }
  const handleDragLeave = (event) => {
    event.preventDefault()
    isDragging.value = false
  }
  const handleDrop = (event) => {
    event.preventDefault()
    isDragging.value = false

    const files = event.dataTransfer?.files
    if (files && files.length > 0) {
      imageStore.saveToImageStore(files, t, router)
    }
  }

  const selectFile = () => {
    imageStore.loadFile(t, router)
  }

  return {
    isDragging,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    selectFile,
  }
}
