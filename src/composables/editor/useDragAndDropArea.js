import { ref } from 'vue'
// import { useToastModal } from '../modals/useToastModal'

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
export function useDragAndDropArea(imageStore, t, router) {
  // const { showToastModal } = useToastModal()

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
   * Handles drop event and passes dropped files to imageStore
   *
   * @param {DragEvent} event - Drop event
   */
  const handleDrop = (event) => {
    event.preventDefault()
    isDragging.value = false

    const files = event.dataTransfer?.files
    if (files && files.length > 0) {
      imageStore.saveToImageStore(files, t, router)
    }
  }

  /**
   * Triggers file selection dialog for manual upload
   */
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
