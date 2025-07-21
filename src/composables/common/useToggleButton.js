import { ref, watch } from 'vue'

/**
 * Logic for the <ToggleButton> component
 *
 * @param {{
 *   modelValue: boolean,
 *   disabled?: boolean
 * }} props - Component props
 * @param {(event: string, value: boolean) => void} emit - Emit function for model updates
 * @returns {{
 *   isActive: import('vue').Ref<boolean>,
 *   toggleSwitch: () => void
 * }}
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
