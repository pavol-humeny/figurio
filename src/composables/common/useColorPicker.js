import { ref, watch } from 'vue'

/**
 * Logic for the <ColorPicker> component
 *
 * @param {{ modelValue: string }} props - Component props
 * @param {(event: string, value: any) => void} emit - Emit function
 * @returns {{
 *   colorValue: import('vue').Ref<string>,
 *   onChange: () => void,
 *   setValue: (value: string) => void
 * }}
 */
export function useColorPicker(props, emit) {
  /**
   * Reactive color value bound to the input
   */
  const colorValue = ref(props.modelValue)

  /**
   * Watch for external modelValue changes and update local value
   */
  watch(
    () => props.modelValue,
    (newVal) => {
      colorValue.value = newVal
    },
  )

  /**
   * Emits updated color value to parent component
   */
  const onChange = () => {
    emit('update:modelValue', colorValue.value)
    emit('update', colorValue.value)
  }

  /**
   * Updates the internal color value programmatically
   *
   * @param {string} value - New color value
   */
  const setValue = (value) => {
    colorValue.value = value
  }

  return {
    colorValue,
    onChange,
    setValue,
  }
}
