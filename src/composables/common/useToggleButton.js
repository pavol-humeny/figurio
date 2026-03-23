/**
 * @file: useToggleButton.js
 * @author: Pavol Humeny
 * @date: 15.5.2026
 * @description: Logic for the <ToggleButton> component, managing the internal active state of the toggle button, handling user interactions to toggle the state, and emitting updates to the parent component. Also respects a disabled state to prevent toggling when necessary.
 */
import { ref, watch } from 'vue'

/**
 * Logic for the <ToggleButton> component
 *
 * @param {{
 *   modelValue: boolean,
 *   disabled?: boolean
 * }} props - Component props
 * @param {(event: string, value: boolean) => void} emit - Emit function for model updates
 */
export function useToggleButton(props, emit) {
  /**
   * Reactive state representing the toggle's current state
   */
  const isActive = ref(props.modelValue)

  /**
   * Watch for external changes to modelValue and update internal state
   */
  watch(
    () => props.modelValue,
    (value) => {
      isActive.value = value
    },
  )

  /**
   * Toggles the active state and emits the update, unless disabled
   */
  const toggleSwitch = () => {
    if (props.disabled) return
    isActive.value = !isActive.value
    emit('update:modelValue', isActive.value)
    emit('update', isActive.value)
  }

  return {
    isActive,
    toggleSwitch,
  }
}
