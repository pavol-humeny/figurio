import { ref, watch } from 'vue'

/**
 * Logic for the <ColorPicker> component
 * @param {Object} props - Component props
 * @param {Function} emit - Emit function
 */
export function useColorPicker(props, emit) {
  const colorValue = ref(props.modelValue)

  // Sync colorValue with prop
  watch(
    () => props.modelValue,
    (newVal) => {
      colorValue.value = newVal
    },
  )

  const onChange = () => {
    emit('update:modelValue', colorValue.value)
    emit('update', colorValue.value)
  }

  const setValue = (value) => {
    colorValue.value = value
  }

  return {
    colorValue,
    onChange,
    setValue,
  }
}
