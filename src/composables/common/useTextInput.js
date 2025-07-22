import { ref, watch } from 'vue'

/**
 * Logic for the <TextInput> component
 *
 * @param {{
 *   modelValue: string,
 *   updateOnChange?: boolean
 * }} props - Component props
 * @param {(event: string, value: string) => void} emit - Emit function for model updates
 * @returns {{
 *   inputValue: import('vue').Ref<string>,
 *   onBlurOrEnter: () => void,
 *   onInput: () => void,
 *   setValue: (val: string) => void
 * }}
 */
export function useTextInput(props, emit) {
  /**
   * Internal reactive value bound to the input
   */
  const inputValue = ref(props.modelValue)

  /**
   * Watch for external changes to modelValue and update internal state
   */
  watch(
    () => props.modelValue,
    (newVal) => {
      inputValue.value = newVal
    },
  )

  /**
   * Emits updated value when the input is blurred or Enter is pressed
   */
  const onBlurOrEnter = () => {
    emit('update:modelValue', inputValue.value)
  }

  /**
   * Emits updated value immediately if `updateOnChange` is true
   */
  const onInput = () => {
    if (props.updateOnChange) {
      emit('update:modelValue', inputValue.value)
    }
  }

  /**
   * Updates the internal value programmatically
   *
   * @param {string} newValue - New value to set
   */
  const setValue = (newValue) => {
    inputValue.value = newValue
  }

  return {
    inputValue,
    onBlurOrEnter,
    onInput,
    setValue,
  }
}
