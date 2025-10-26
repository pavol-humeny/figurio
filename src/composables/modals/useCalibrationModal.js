import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { useSendEvent } from '@/composables/common/useSendEvent'
import { viewportConfig } from '@/config/viewportConfig'

/**
 * Whether the calibration modal is currently visible.
 */
const isVisible = ref(false)

/**
 * Calibration factor for physical size adjustment
 */
const calibrationFactor = ref(1.0)

export function useCalibrationModal(viewportStore) {
  /**
   * Open the calibration modal.
   */
  const openCalibrationModal = () => {
    if (isVisible.value) return

    calibrationFactor.value = viewportStore.calibrationFactor
    
    useSendEvent().sendEvent('modalEvent', null, null, { modal: 'calibration', event: 'open' })

    isVisible.value = true
  }

  /**
   * Close the calibration modal.
   */
  const closeCalibrationModal = () => {
    useSendEvent().sendEvent('modalEvent', null, null, { modal: 'calibration', event: 'close' })

    isVisible.value = false
  }

  /**
   * Handle keydown events for closing the modal with Escape key.
   */
  const handleKeydown = (event) => {
    if (event.key === 'Escape' && isVisible.value) {
      event.preventDefault()
      closeCalibrationModal()
    }
  }

  /**
   * Px per cm based on viewport config.
   */
  const PxPerCm = viewportConfig.defaultPxPerCm

  /**
   * Standard card dimensions in cm
   */
  const cardWidthCm = 8.56
  const cardHeightCm = 5.398

  /**
   * Original card width in px (without calibration factor)
   */
  const originalCardWidthPx = cardWidthCm * PxPerCm

  const minCalibrationFactor = 0.2
  const maxCalibrationFactor = 2
  const stepCalibrationFactor = 0.005

  /**
   * Card dimensions in px adjusted by calibration factor
   */
  const cardWidthPx = ref(originalCardWidthPx * calibrationFactor.value)
  const cardHeightPx = ref(cardHeightCm * PxPerCm * calibrationFactor.value)

  /**
   * Watch for changes in calibration factor to update card dimensions
   */
  watch(calibrationFactor, (newFactor) => {
    cardWidthPx.value = originalCardWidthPx * newFactor
    cardHeightPx.value = cardHeightCm * PxPerCm * newFactor
  })

  /**
   * Apply the calibration factor to the viewport store
   */
  const calibrate = () => {
    isVisible.value = false
    viewportStore.setCalibrationFactor(calibrationFactor.value)
  }

  /**
   * Reset calibration factor to default (1.0)
   */
  const resetCalibration = () => {
    calibrationFactor.value = 1.0
  }

  /**
   * Setup and cleanup of keydown event listener
   */
  onMounted(() => {
    window.addEventListener('keydown', handleKeydown)

    calibrationFactor.value = viewportStore.calibrationFactor
  })
  onBeforeUnmount(() => window.removeEventListener('keydown', handleKeydown))

  return {
    isVisible,
    openCalibrationModal,
    closeCalibrationModal,
    calibrate,
    calibrationFactor,
    cardWidthPx,
    cardHeightPx,
    PxPerCm,
    resetCalibration,
    minCalibrationFactor,
    maxCalibrationFactor,
    stepCalibrationFactor,
  }
}
