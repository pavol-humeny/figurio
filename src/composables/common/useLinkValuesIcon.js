/**
 * @file: useLinkValuesIcon.js
 * @author: Pavol Humeny
 * @date: 15.5.2026
 * @description: Logic for the <LinkValuesIcon> component, managing the linked state of values and emitting updates to the parent component. Provides a toggle function to switch between linked and unlinked states, while respecting the disabled state of the component.
 */
import { ref, watch } from 'vue'

/**
 * Logic for the <LinkValuesIcon> component
 * @param {{ modelValue: boolean, disabled?: boolean }} props - Component props
 * @param {(event: string, value: boolean) => void} emit - Emit function for model updates
 * @return {{
 *   isLinked: import('vue').Ref<boolean>,
 *   toggleLinkedValue: () => void
 * }}
 */
export function useLinkValuesIcon(props, emit) {
  /**
   * Reactive state to track if values are linked
   */
  const isLinked = ref(props.modelValue)

  /**
   * Watch for external changes to modelValue and update internal state
   */
  watch(
    () => props.modelValue,
    (value) => {
      isLinked.value = value
    },
  )

  /**
   * Toggles the linked state and emits the updated value
   */
  const toggleLinkedValue = () => {
    if (props.disabled) return
    isLinked.value = !isLinked.value
    emit('update:modelValue', isLinked.value)
  }

  return {
    isLinked,
    toggleLinkedValue,
  }
}
