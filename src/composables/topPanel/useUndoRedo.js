import { computed } from 'vue'
import { useApi } from '@/composables/common/useApi'
import { useImagePipeline } from '../editor/useImagePipeline'
const { addUserEvent } = useApi()

/**
 * Logic for handling undo and redo operations
 *
 * @param {Object} historyStore - The history store containing snapshots and current index
 * @param {Object} imageStore - The image store with applySnapshot and imageLoaded state
 * @returns {{
 *   undo: () => void,
 *   redo: () => void,
 *   canUndo: import('vue').ComputedRef<boolean>,
 *   canRedo: import('vue').ComputedRef<boolean>
 * }}
 */
export function useUndoRedo(historyStore, imageStore, uiStore) {
  const { renderUpTo } = useImagePipeline(imageStore, uiStore)
  /**
   * Whether undo operation is available
   */
  const canUndo = computed(() => historyStore.currentIndex > 0)
  /**
   * Whether redo operation is available
   */
  const canRedo = computed(() => historyStore.currentIndex < historyStore.history.length - 1)

  /**
   * Revert to the previous snapshot in history
   */
  const undo = async () => {
    if (!canUndo.value || !imageStore.isImageLoaded) return

    addUserEvent('buttonClicked', { button: 'undo' })

    const snapshot = historyStore.undo()
    if (!snapshot) return

    await imageStore.applySnapshot(snapshot)
    await renderUpTo(snapshot.opIndex)
  }

  /**
   * Reapply a previously undone snapshot
   */
  const redo = async () => {
    if (!canRedo.value || !imageStore.isImageLoaded) return

    // Send event
    addUserEvent('buttonClicked', { button: 'redo' })

    const snapshot = historyStore.redo()
    if (!snapshot) return

    await imageStore.applySnapshot(snapshot)
    await renderUpTo(snapshot.opIndex)
  }
  return {
    undo,
    redo,
    canUndo,
    canRedo,
  }
}
