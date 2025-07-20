import { ref, watch } from 'vue'

/**
 * Logic for the <TextInput> component
 * @param {Object} props - Component props
 * @param {Function} emit - Emit function
 */
export function useTextInput(props, emit) {
  const inputValue = ref(props.modelValue)

  // Synchronize with external modelValue changes
  watch(
    () => props.modelValue,
    (newVal) => {
      inputValue.value = newVal
    },
  )

  const onBlurOrEnter = () => {
    emit('update:modelValue', inputValue.value)
  }

  const onInput = () => {
    if (props.updateOnChange) {
      emit('update:modelValue', inputValue.value)
    }
  }

  const setValue = (val) => {
    inputValue.value = val
  }

  return {
    inputValue,
    onBlurOrEnter,
    onInput,
    setValue,
  }
}
