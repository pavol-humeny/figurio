import { ref, onMounted, onUnmounted } from 'vue'
import { useToastModal } from '../modals/useToastModal'

export function useDragAndDropArea(imageStore, t, router) {
  const { showToastModal } = useToastModal()
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
      showToastModal(
        'warning',
        t('dragAndDropArea.toast.warningPasteNotImage.title'),
        t('dragAndDropArea.toast.warningPasteNotImage.message'),
      )
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
