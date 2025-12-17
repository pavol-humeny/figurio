import { ref } from 'vue'
import { editorConfig } from '@/config/editorConfig'

/**
 * Timeout and interval references for hold action
 */
const holdTimeout = ref(null)
const holdInterval = ref(null)

export function useHoldButton() {
  /**
   * Starts the hold action to continuously call the provided action function
   *
   * @param {Function} action - Function to call repeatedly while holding
   */
  const startHold = (action) => {
    // Call immediately
    action()

    // Wait (longer pause before repeating)
    holdTimeout.value = setTimeout(() => {
      // Start interval with shorter period
      holdInterval.value = setInterval(() => {
        action()
      }, editorConfig.holdButtonInterval)
    }, editorConfig.holdButtonTimeout)
  }

  /**
   * Stops the hold action by clearing timeouts and intervals
   */
  const stopHold = () => {
    clearTimeout(holdTimeout.value)
    clearInterval(holdInterval.value)
    holdTimeout.value = null
    holdInterval.value = null
  }

  return {
    startHold,
    stopHold,
  }
}
