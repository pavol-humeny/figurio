import { computed } from 'vue'

export function useMoveToolSettings(viewportStore) {
  const zoomSpeed = computed(() => viewportStore.zoomSpeed)
  const movementSpeed = computed(() => viewportStore.movementSpeed)

  const updateZoomSpeed = (newSpeed) => {
    if (typeof newSpeed === 'number' && newSpeed > 0) {
      viewportStore.zoomSpeed = newSpeed
    } else {
      console.warn('Invalid zoom speed. It must be a positive number.')
    }
  }

  const updateMovementSpeed = (newSpeed) => {
    if (typeof newSpeed === 'number' && newSpeed > 0) {
      viewportStore.movementSpeed = newSpeed
    } else {
      console.warn('Invalid movement speed. It must be a positive number.')
    }
  }

  const resetZoomSpeed = () => {
    viewportStore.resetZoomSpeed()
  }

  const resetMovementSpeed = () => {
    viewportStore.resetMovementSpeed()
  }

  return {
    zoomSpeed,
    updateZoomSpeed,
    resetZoomSpeed,
    movementSpeed,
    updateMovementSpeed,
    resetMovementSpeed,
  }
}
