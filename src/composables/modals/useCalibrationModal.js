import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { useSendEvent } from '@/composables/common/useSendEvent'
import { viewportConfig } from '@/config/viewportConfig'

/**
 * Whether the calibration modal is currently visible
 */
const isVisible = ref(false)

/**
 * Logic for the calibration modal
 * @param {Object} viewportStore - The viewport store
 * @return {Object} - The calibration modal logic
 */
export function useCalibrationModal(viewportStore) {
  /**
   * Open the modal
   */
  const openCalibrationModal = () => {
    if (isVisible.value) {
      return
    }

    useSendEvent().sendEvent('modalEvent', null, null, { modal: 'calibration', event: 'open' })

    isVisible.value = true
  }

  /**
   * Close the modal
   */
  const closeCalibrationModal = () => {
    useSendEvent().sendEvent('modalEvent', null, null, { modal: 'calibration', event: 'close' })

    isVisible.value = false
  }

  /**
   * Handle Escape key to close the modal
   *
   * @param {KeyboardEvent} event
   */
  const handleKeydown = (event) => {
    if (event.key === 'Escape' && isVisible.value) {
      event.preventDefault()
      closeCalibrationModal()
    }
  }

  /**
   * Pixels per centimeter based on default viewport config
   */
  const PxPerCm = viewportConfig.defaultPxPerCm

  /**
   * Min an max width in cm for the credit card representation
   */
  const minWidthCm = 2
  const maxWidthCm = 20

  /**
   * Standard credit card dimensions in cm
   */
  const cardWidthCm = 8.56
  const cardHeightCm = 5.398

  /**
   * Original card width in pixels
   */
  const originalCardWidthPx = cardWidthCm * PxPerCm

  /**
   * Reactive card width in pixels
   */
  const cardWidthPx = ref(originalCardWidthPx * viewportStore.calibrationFactor)

  /**
   * Reactive card height in pixels
   */
  const cardHeightPx = ref(cardHeightCm * PxPerCm)

  /**
   * Calibrate the viewport based on the current card width
   */
  const calibrate = () => {
    isVisible.value = false
    const calibrationFactor = cardWidthPx.value / originalCardWidthPx
    console.log('Calibration factor:', calibrationFactor)

    viewportStore.setCalibrationFactor(calibrationFactor)
  }

  /**
   * Reset calibration slider to original card width
   */
  const resetCalibration = () => {
    cardWidthPx.value = originalCardWidthPx
  }

  // recalculate card height when card width changes
  watch(cardWidthPx, (newWidthPx) => {
    const newCalibrationFactor = newWidthPx / originalCardWidthPx
    // adjust card height accordingly
    cardHeightPx.value = cardHeightCm * PxPerCm * newCalibrationFactor
    console.log('Adjusted card height to', cardHeightPx.value, 'px')
  })

  // Register Escape key handler
  onMounted(() => {
    window.addEventListener('keydown', handleKeydown)
  })

  // Cleanup key handler on unmount
  onBeforeUnmount(() => {
    window.removeEventListener('keydown', handleKeydown)
  })

  return {
    isVisible,
    openCalibrationModal,
    closeCalibrationModal,
    calibrate,
    cardWidthPx,
    cardHeightPx,
    minWidthCm,
    maxWidthCm,
    PxPerCm,
    resetCalibration,
    originalCardWidthPx,
  }
}
