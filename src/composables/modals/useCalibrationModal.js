/**
 * @file: useCalibrationModal.js
 * @author: Pavol Humeny
 * @date: 15.5.2026
 * @description: Composable for managing the calibration modal in the editor.
 */
import { ref, onMounted, watch } from 'vue'
import { viewportConfig } from '@/config/viewportConfig'
import { useApi } from '@/composables/common/useApi'
const { addUserEvent } = useApi()

/**
 * Whether the calibration modal is currently visible.
 */
const isVisible = ref(false)

/**
 * Calibration factor for physical size adjustment
 */
const calibrationFactor = ref(1.0)

/**
 * Logic for managing the calibration modal in the editor
 *
 * @param {object} viewportStore - The viewport store instance for managing viewport state
 */
export function useCalibrationModal(viewportStore) {
  /**
   * Open the calibration modal.
   */
  const openCalibrationModal = () => {
    if (isVisible.value) return

    calibrationFactor.value = viewportStore.calibrationFactor

    addUserEvent('openModal', { modal: 'calibration' })

    isVisible.value = true
  }

  /**
   * Close the calibration modal.
   */
  const closeCalibrationModal = () => {
    isVisible.value = false
  }

  /**
   * Px per cm based on viewport config.
   */
  const PxPerCm = viewportConfig.defaultPxPerCm

  /**
   * Standard card dimensions in cm
   */
  const cardWidthCm = viewportConfig.cardWidthCm
  const cardHeightCm = viewportConfig.cardHeightCm

  /**
   * Original card width in px (without calibration factor)
   */
  const originalCardWidthPx = cardWidthCm * PxPerCm

  const minCalibrationFactor = viewportConfig.minCalibrationFactor
  const maxCalibrationFactor = viewportConfig.maxCalibrationFactor
  const stepCalibrationFactor = viewportConfig.stepCalibrationFactor

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

    // Save window size to local storage to persist calibration across sessions
    viewportStore.setWindowSize(window.screen.width, window.screen.height)
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
    calibrationFactor.value = viewportStore.calibrationFactor
  })

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
