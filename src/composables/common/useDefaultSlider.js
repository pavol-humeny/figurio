import { ref, watch } from 'vue'

/**
 * Logic for the <Slider> component
 *
 * @param {{ modelValue: number }} props - Component props with a numeric modelValue
 * @param {(event: string, value: number) => void} emit - Emit function for model updates
 * @returns {{
 *   currentValue: import('vue').Ref<number>,
 *   onInput: (event: Event) => void
 * }}
 */
export function useSlider(props, emit) {
  /**
   * Internal reactive value representing the slider position
   */
  const currentValue = ref(props.modelValue)

  /**
   * Synchronize currentValue with the external modelValue prop
   */
  watch(
    () => props.modelValue,
    (val) => {
      currentValue.value = val
    },
  )

  /**
   * Handles input event and emits updated value to the parent
   *
   * @param {Event} event - Input event from the slider
   */
  const onInput = (event) => {
    const value = Number(event.target.value)
    emit('update:modelValue', value)
    emit('update', value)
  }

  return {
    currentValue,
    onInput,
  }
}
