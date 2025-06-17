import { ref } from 'vue'

export function useDragAndDropArea(imageStore, t) {
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
      imageStore.saveToImageStore(files, t)
    }
  }

  const selectFile = () => {
    imageStore.loadFile(t)
  }

  return {
    isDragging,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    selectFile,
  }
}
