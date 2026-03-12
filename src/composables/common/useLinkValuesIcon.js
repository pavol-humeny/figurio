/**
 * @file: useLinkValuesIcon.js
 * @author: Pavol Humeny
 * @date: 15.5.2026
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
