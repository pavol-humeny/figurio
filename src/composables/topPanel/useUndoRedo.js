import { computed } from 'vue'

export function useUndoRedo(historyStore, imageStore) {
  const canUndo = computed(() => historyStore.currentIndex > 0)
  const canRedo = computed(() => historyStore.currentIndex < historyStore.history.length - 1)

  const undo = () => {
    if (!canUndo.value || !imageStore.isImageLoaded) return

    const snapshot = historyStore.undo()
    if (snapshot) {
      imageStore.applySnapshot(snapshot)
    }
  }
  const redo = () => {
    if (!canRedo.value || !imageStore.isImageLoaded) return

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
