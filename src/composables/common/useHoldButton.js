/**
 * @file: useHoldButton.js
 * @author: Pavol Humeny
 * @date: 15.5.2026
 * @description: Composable for implementing a hold button functionality, allowing continuous action execution while the button is held down. Provides startHold and stopHold methods to manage the hold state and timing.
 */
import { ref } from 'vue'
import { editorConfig } from '@/config/editorConfig'

/**
 * Timeout and interval references for hold action
 */
const holdTimeout = ref(null)
const holdInterval = ref(null)

/**
 * Logic for implementing hold button functionality
 */
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
