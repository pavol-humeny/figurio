import { ref, watch } from 'vue'

/**
 * Logic for the <Slider> component
 * @param {Object} props - Component props
 * @param {Function} emit - Emit function
 */
export function useSlider(props, emit) {
  const currentValue = ref(props.modelValue)

  // Synchronize currentValue with modelValue prop
  watch(
    () => props.modelValue,
    (val) => {
      currentValue.value = val
    },
  )

  /**
   * Handles input change and emits updated value.
   * @param {Event} event - Input event from range element
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
