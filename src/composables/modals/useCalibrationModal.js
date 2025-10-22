import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useConfirmModal } from './useConfirmModal'
import { useSendEvent } from '@/composables/common/useSendEvent'

/**
 * Whether the calibration modal is currently visible
 */
const isVisible = ref(false)

export function useCalibrationModal() {
  const { showConfirmModal } = useConfirmModal()

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

  const calibrate = () => {
    isVisible.value = false
  }

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
  }
}
