import { ref, watch } from 'vue'

/**
 * Logic for a pure hold-type button
 *
 * @param {Object} props
 * @param {boolean} props.defaultValue - Initial active state
 * @param {Function} props.startFunction - Function to call when hold starts
 * @param {Function} props.endFunction - Function to call when hold ends
 * @param {boolean} [props.disabled=false] - Whether button is disabled
 */
export function useToggleHoldButton(props) {
  const isActive = ref(props.defaultValue || false)

  // Watch for external changes to defaultValue and update internal state
  watch(
    () => props.defaultValue,
    (value) => {
      isActive.value = value
    },
  )

  /**
   * Handle the start of a hold action
   */
  const holdStart = () => {
    if (props.disabled) return
    isActive.value = !isActive.value
    if (props.startFunction) props.startFunction()
  }

  /**
   * Handle the end of a hold action
   */
  const holdEnd = () => {
    if (props.disabled) return
    isActive.value = !isActive.value
    if (props.endFunction) props.endFunction()
  }

  return {
    isActive,
    holdStart,
    holdEnd,
  }
}
