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
   * Reference to the native <input> element
   */
  const inputRef = ref(null)

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
   * Called on blur
   */
  const onBlur = () => {
    emit('update:modelValue', inputValue.value)
    emit('update', inputValue.value)
  }

  /**
   * Called on Enter key
   */
  const onEnter = () => {
    emit('update:modelValue', inputValue.value)
    emit('update', inputValue.value)

    // Call optional prop callback
    if (typeof props.onEnter === 'function') {
      props.onEnter(inputValue.value)
    }

    // Remove focus from input
    if (inputRef.value) {
      inputRef.value.blur()
    }
  }

  /**
   * Emits updated value immediately if `updateOnChange` is true
   */
  const onInput = () => {
    if (props.updateOnChange) {
      emit('update:modelValue', inputValue.value)
      emit('update', inputValue.value) // Emit update event for compatibility
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
    onBlur,
    onEnter,
    onInput,
    setValue,
    inputRef,
  }
}
