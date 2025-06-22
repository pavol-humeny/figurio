import { computed } from 'vue'
import { useMath } from '@/composables/common/useMath'

export function useMoveToolSettings(viewportStore) {
  const { round } = useMath()

  // Zoom speed settings
  const zoomSpeed = computed({
    get: () => round(viewportStore.zoomSpeed * zoomSpeedCorrectionFactor, 5),
    set: () => {
    },
  })

  const zoomSpeedCorrectionFactor = round(100 / viewportStore.defaultZoomSpeed, 5)
  const zoomSpeedDiff = round(
    viewportStore.defaultZoomSpeed - viewportStore.defaultZoomSpeed / 5,
    5,
  )
  const zoomSpeedMin = round(
    (viewportStore.defaultZoomSpeed - zoomSpeedDiff) * zoomSpeedCorrectionFactor,
    5,
  )
  const zoomSpeedMax = round(
    (viewportStore.defaultZoomSpeed + zoomSpeedDiff) * zoomSpeedCorrectionFactor,
    5,
  )

  // Movement speed settings
  const movementSpeed = computed({
    get: () => round(viewportStore.movementSpeed * movementSpeedCorrectionFactor, 5),
    set: () => {
    },
  })

  const movementSpeedCorrectionFactor = round(100 / viewportStore.defaultMovementSpeed, 5)
  const movementSpeedDiff = round(
    viewportStore.defaultMovementSpeed - viewportStore.defaultMovementSpeed / 5,
    5,
  )
  const movementSpeedMin = round(
    (viewportStore.defaultMovementSpeed - movementSpeedDiff) * movementSpeedCorrectionFactor,
    5,
  )
  const movementSpeedMax = round(
    (viewportStore.defaultMovementSpeed + movementSpeedDiff) * movementSpeedCorrectionFactor,
    5,
  )

  const updateZoomSpeed = (newSpeed) => {
    if (typeof newSpeed === 'number' && newSpeed > 0) {
      viewportStore.zoomSpeed = round(newSpeed / zoomSpeedCorrectionFactor, 5)
    } else {
      console.warn('Invalid zoom speed. It must be a positive number.')
    }
  }

  const updateMovementSpeed = (newSpeed) => {
    if (typeof newSpeed === 'number' && newSpeed > 0) {
      viewportStore.movementSpeed = round(newSpeed / movementSpeedCorrectionFactor, 5)
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
    zoomSpeedMin,
    zoomSpeedMax,
    updateZoomSpeed,
    resetZoomSpeed,
    movementSpeed,
    movementSpeedMin,
    movementSpeedMax,
    updateMovementSpeed,
    resetMovementSpeed,
  }
}
