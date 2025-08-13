import { computed } from 'vue'
import { useSendEvent } from '@/composables/common/useSendEvent'

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
export function useUndoRedo(historyStore, imageStore) {
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
  const undo = () => {
    if (!canUndo.value || !imageStore.isImageLoaded) return

    // Send event
    useSendEvent().sendEvent('buttonClicked', null, 'undo', {
      historyIndex: historyStore.currentIndex,
    })

    const snapshot = historyStore.undo()
    if (snapshot) {
      imageStore.applySnapshot(snapshot)
    }
  }

  /**
   * Reapply a previously undone snapshot
   */
  const redo = () => {
    if (!canRedo.value || !imageStore.isImageLoaded) return

    // Send event
    useSendEvent().sendEvent('buttonClicked', null, 'redo', {
      historyIndex: historyStore.currentIndex,
    })

    const snapshot = historyStore.redo()
    if (snapshot) {
      imageStore.applySnapshot(snapshot)
    }
  }
  return {
    undo,
    redo,
    canUndo,
    canRedo,
  }
}
