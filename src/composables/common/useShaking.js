import { ref } from 'vue'

/**
 * Whether the shake effect is currently active
 */
const isShaking = ref(false)

/**
 * Logic for triggering a temporary "shake" animation effect
 *
 * @returns {{
 *   isShaking: import('vue').Ref<boolean>,
 *   triggerShake: () => void
 * }}
 */
export function useShaking() {
  /**
   * Triggers the shake effect by setting `isShaking` to true for 500ms
   */
  const triggerShake = () => {
    if (isShaking.value) return
    console.log('Triggering shake effect')
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
