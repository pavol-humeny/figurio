import { ref, onMounted, onUnmounted } from 'vue'

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

  const handlePaste = (event) => {
    console.log('Paste event detected')
    const items = event.clipboardData?.items
    if (!items || items.length === 0) return

    const firstItem = items[0]
    const file = firstItem.getAsFile()

    if (file) {
      console.log('Pasted file:', file)
      imageStore.saveToImageStore([file], t, router)
    } else {
      console.log('First clipboard item is not a file:', firstItem)
    }
  }

  const selectFile = () => {
    imageStore.loadFile(t, router)
  }

  onMounted(() => {
    window.addEventListener('paste', handlePaste)
  })

  onUnmounted(() => {
    window.removeEventListener('paste', handlePaste)
  })

  return {
    isDragging,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    selectFile,
  }
}
