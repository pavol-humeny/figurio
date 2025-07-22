import { computed } from 'vue'
import { useMath } from '@/composables/common/useMath'

/**
 * Logic for movement and zoom speed settings of the Move tool
 *
 * @param {object} viewportStore - Store managing viewport state and settings
 * @returns {object} Move tool speed control logic
 */
export function useMoveTool(viewportStore) {
  const { round } = useMath()

  // --------------------------
  // Zoom speed logic
  // --------------------------

  /**
   * Reactive zoom speed value shown in UI
   */
  const zoomSpeed = computed({
    get: () => round(viewportStore.zoomSpeed * zoomSpeedCorrectionFactor, 5),
    set: () => {},
  })

  /**
   * Correction factor to normalize zoom speed to 100 as default
   */
  const zoomSpeedCorrectionFactor = round(100 / viewportStore.defaultZoomSpeed, 5)

  /**
   * Zoom speed difference range around the default
   */
  const zoomSpeedDiff = round(
    viewportStore.defaultZoomSpeed - viewportStore.defaultZoomSpeed / 5,
    5,
  )

  /**
   * Minimum and maximum allowed zoom speed (in UI scale)
   */
  const zoomSpeedMin = round(
    (viewportStore.defaultZoomSpeed - zoomSpeedDiff) * zoomSpeedCorrectionFactor,
    5,
  )
  const zoomSpeedMax = round(
    (viewportStore.defaultZoomSpeed + zoomSpeedDiff) * zoomSpeedCorrectionFactor,
    5,
  )

  /**
   * Update zoom speed based on user input in UI scale
   *
   * @param {number} newSpeed - Zoom speed value (UI scale)
   */
  const updateZoomSpeed = (newSpeed) => {
    if (typeof newSpeed === 'number' && newSpeed > 0) {
      viewportStore.zoomSpeed = round(newSpeed / zoomSpeedCorrectionFactor, 5)
    } else {
      console.warn('Invalid zoom speed. It must be a positive number.')
    }
  }

  // --------------------------
  // Movement speed logic
  // --------------------------

  /**
   * Reactive movement speed value shown in UI
   */
  const movementSpeed = computed({
    get: () => round(viewportStore.movementSpeed * movementSpeedCorrectionFactor, 5),
    set: () => {},
  })

  /**
   * Correction factor to normalize movement speed to 100 as default
   */
  const movementSpeedCorrectionFactor = round(100 / viewportStore.defaultMovementSpeed, 5)

  /**
   * Movement speed difference range around the default
   */
  const movementSpeedDiff = round(
    viewportStore.defaultMovementSpeed - viewportStore.defaultMovementSpeed / 5,
    5,
  )

  /**
   * Minimum and maximum allowed movement speed (in UI scale)
   */
  const movementSpeedMin = round(
    (viewportStore.defaultMovementSpeed - movementSpeedDiff) * movementSpeedCorrectionFactor,
    5,
  )
  const movementSpeedMax = round(
    (viewportStore.defaultMovementSpeed + movementSpeedDiff) * movementSpeedCorrectionFactor,
    5,
  )

  /**
   * Update movement speed based on user input in UI scale
   *
   * @param {number} newSpeed - Movement speed value (UI scale)
   */
  const updateMovementSpeed = (newSpeed) => {
    if (typeof newSpeed === 'number' && newSpeed > 0) {
      viewportStore.movementSpeed = round(newSpeed / movementSpeedCorrectionFactor, 5)
    } else {
      console.warn('Invalid movement speed. It must be a positive number.')
    }
  }

  /**
   * Reset zoom speed to default
   */
  const resetZoomSpeed = () => {
    viewportStore.resetZoomSpeed()
  }

  /**
   * Reset movement speed to default
   */
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
