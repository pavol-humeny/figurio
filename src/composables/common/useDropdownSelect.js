import { ref, watch } from 'vue'

/**
 * Logic for the <DropdownSelect> component
 * @param {Object} props - Component props
 * @param {Function} emit - Emit function for model updates
 */
export function useDropdownSelect(props, emit) {
  const selectedValue = ref(props.modelValue)

  // Sync when modelValue changes externally
  watch(
    () => props.modelValue,
    (newVal) => {
      selectedValue.value = newVal
    },
  )

  /**
   * Emits when value is changed by user
   */
  const onChange = () => {
    emit('update:modelValue', selectedValue.value)
    emit('update', selectedValue.value)
  }

  /**
   * Emits when icon is double-clicked
   */
  const onIconDoubleClick = () => {
    if (typeof props.onReset === 'function') {
      props.onReset()
    }
  }

  const setValue = (value) => {
    selectedValue.value = value
  }

  const showIcon = props.icon !== ''

  return {
    selectedValue,
    onChange,
    onIconDoubleClick,
    setValue,
    showIcon,
  }
}
