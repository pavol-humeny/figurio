import { ref } from 'vue'
import { useToastModal } from '../modals/useToastModal'
import { useConsole } from '../common/useConsole'
import { importFile } from '@/services/importFile'
const { log } = useConsole()

/**
 * Logic for handling drag & drop and paste interactions for file input
 *
 * @param {ReturnType<typeof import('@/stores/imageStore').useImageStore>} imageStore - Image store for handling files
 * @param {(key: string) => string} t - Translation function
 * @param {import('vue-router').Router} router - Vue router instance
 * @returns {{
 *   isDragging: import('vue').Ref<boolean>,
 *   handleDragOver: (event: DragEvent) => void,
 *   handleDragLeave: (event: DragEvent) => void,
 *   handleDrop: (event: DragEvent) => void,
 *   selectFile: () => void
 * }}
 */
export function useDragAndDropArea(
  imageStore,
  editorStore,
  t,
  router,
  userModeStore,
  workspaceStore,
  uiStore,
  viewportStore,
  historyStore,
) {
  const { showToastModal } = useToastModal()
  const { openFileInput, loadFile } = importFile(
    userModeStore,
    workspaceStore,
    uiStore,
    imageStore,
    viewportStore,
    historyStore,
  )

  /**
   * Whether a file is currently being dragged over the drop area
   */
  const isDragging = ref(false)

  /**
   * Handles dragover event and marks drag state active
   *
   * @param {DragEvent} event - Drag event
   */
  const handleDragOver = (event) => {
    event.preventDefault()
    isDragging.value = true
  }

  /**
   * Handles dragleave event and resets drag state
   *
   * @param {DragEvent} event - Drag event
   */
  const handleDragLeave = (event) => {
    event.preventDefault()
    isDragging.value = false
  }

  /**
   * Handles drop event and loads the dropped file
   *
   * @param {DragEvent} event - Drop event
   */
  const handleDrop = (event) => {
    event.preventDefault()
    isDragging.value = false

    const files = event.dataTransfer?.files

    if (files && files.length > 0) {
      // Support only single file upload via drag and drop
      loadFile(files[0], t, router)
    }
  }

  /**
   * Triggers file selection dialog for manual upload
   */
  const selectFile = () => {
    openFileInput(t, router)
  }

  /**
   * Handles paste event and extracts image file from clipboard if available
   *
   * @param {ClipboardEvent} event - Paste event
   */
  const handlePaste = (event) => {
    if (!editorStore.imageCanBePasted) return

    log('Paste event: ', event)

    const items = event.clipboardData?.items
    if (!items || items.length === 0) return

    const firstItem = items[0]
    const file = firstItem.getAsFile()

    if (file) {
      loadFile(file, t, router)
    } else if (firstItem.kind === 'string' && firstItem.type === 'image/svg+xml') {
      firstItem.getAsString((svgString) => {
        // Convert string to Blob
        const svgBlob = new Blob([svgString], { type: 'image/svg+xml' })
        const url = URL.createObjectURL(svgBlob)

        // Load SVG into Image
        const img = new Image()
        img.onload = () => {
          // Draw into canvas
          const canvas = document.createElement('canvas')
          canvas.width = img.width
          canvas.height = img.height
          const ctx = canvas.getContext('2d')
          ctx.drawImage(img, 0, 0)

          // Export as PNG
          canvas.toBlob((pngBlob) => {
            const file = new File([pngBlob], 'pasted.png', { type: 'image/png' })
            loadFile(file, t, router)
            URL.revokeObjectURL(url)
          }, 'image/png')
        }
        img.src = url
      })
    } else {
      log('Pasted: ', firstItem)
      showToastModal(
        'warning',
        t('dragAndDropArea.toast.warningPasteNotImage.title'),
        t('dragAndDropArea.toast.warningPasteNotImage.message'),
      )
    }
  }

  return {
    isDragging,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    selectFile,
    handlePaste,
  }
}
