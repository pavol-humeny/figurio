/**
 * @file: useToggleHoldButton.js
 * @author: Pavol Humeny
 * @date: 15.5.2026
 * @description: Logic for a hold-type button, managing the active state based on hold interactions and emitting start and end events to the parent component. The button toggles its state when held down and released, while respecting a disabled state to prevent interactions when necessary.
 */
import { ref, watch } from 'vue'

/**
 * Logic for a pure hold-type button
 * @param {{
 *   defaultValue?: boolean,
 *   disabled?: boolean,
 *   startFunction?: () => void,
 *   endFunction?: () => void
 * }} props - Component props
 */
export function useToggleHoldButton(props) {
  const isActive = ref(props.defaultValue || false)

  /**
   * Watch for changes to defaultValue and update isActive accordingly
   */
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
