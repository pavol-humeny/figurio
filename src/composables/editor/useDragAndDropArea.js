/**
 * @file: useDragAndDropArea.js
 * @author: Pavol Humeny
 * @date: 15.5.2026
 * @description: Logic for handling drag & drop and paste interactions for file input. This composable provides functionality to manage the state of dragging files over a designated area, handle file drops, trigger file selection dialogs, and process pasted content from the clipboard.
 */
import { ref } from 'vue'
import { useToastModal } from '../modals/useToastModal'
import { useConsole } from '../common/useConsole'
import { importFileService } from '@/services/importFileService'
const { log } = useConsole()

/**
 * Logic for handling drag & drop and paste interactions for file input
 *
 * @param {object} imageStore - The image store instance for managing image state
 * @param {object} editorStore - The editor store instance for managing editor state
 * @param {function} t - The translation function for internationalization
 * @param {object} router - The Vue Router instance for navigation
 * @param {object} userModeStore - The user mode store instance for managing user modes
 * @param {object} workspaceStore - The workspace store instance for managing workspaces
 * @param {object} uiStore - The UI store instance for managing UI state
 * @param {object} viewportStore - The viewport store instance for managing viewport state
 * @param {object} historyStore - The history store instance for managing operation history
 *
 * @returns {object} An object containing reactive properties and methods for handling drag & drop and paste interactions.
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
  const { openFileInput, loadFile } = importFileService(
    userModeStore,
    workspaceStore,
    uiStore,
    imageStore,
    viewportStore,
    historyStore,
    editorStore,
    t,
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
  const handleDrop = async (event) => {
    event.preventDefault()
    isDragging.value = false

    const files = event.dataTransfer?.files

    if (files && files.length > 0) {
      for (const file of files) {
        await loadFile(file, router)
        await new Promise((resolve) => setTimeout(resolve, 200)) // Small delay to ensure UI updates
      }
    }
  }

  /**
   * Triggers file selection dialog for manual upload
   */
  const selectFile = () => {
    openFileInput(router)
  }

  /**
   * Handles paste event and extracts image file from clipboard if available
   *
   * @param {ClipboardEvent} event - Paste event
   */
  const handlePaste = (event) => {
    if (!editorStore.imageCanBePasted) return
    if (editorStore.isModalOpenFlag) return

    log('Paste event: ', event)

    const items = event.clipboardData?.items
    if (!items || items.length === 0) return

    const firstItem = items[0]
    const file = firstItem.getAsFile()

    if (file) {
      loadFile(file, router)
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
            loadFile(file, router)
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
