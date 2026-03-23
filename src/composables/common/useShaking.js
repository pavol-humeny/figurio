/**
 * @file: useShaking.js
 * @author: Pavol Humeny
 * @date: 15.5.2026
 * @description: Composable for triggering a temporary "shake" animation effect, typically used to indicate an error or invalid action. Provides a reactive `isShaking` state and a `triggerShake` function to activate the effect for a short duration.
 */
import { ref } from 'vue'

/**
 * Whether the shake effect is currently active
 */
const isShaking = ref(false)

/**
 * Logic for triggering a temporary "shake" animation effect
 */
export function useShaking() {
  /**
   * Triggers the shake effect by setting `isShaking` to true for 500ms
   */
  const triggerShake = () => {
    if (isShaking.value) return
    isShaking.value = true
    setTimeout(() => {
      isShaking.value = false
    }, 500)
  }

  return {
    isShaking,
    triggerShake,
  }
}
