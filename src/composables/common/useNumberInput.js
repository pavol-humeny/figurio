import { ref, watch } from 'vue'

/**
 * Logic for the <NumberInput> component
 * @param {Object} props - Component props
 * @param {Function} emit - emit function
 */
export function useNumberInput(props, emit) {
  const inputValue = ref(props.modelValue)

  watch(
    () => props.modelValue,
    (newVal) => {
      inputValue.value = newVal
    },
  )

  const onBlurOrEnter = () => {
    let value = inputValue.value

    if (value < props.min) {
      value = props.min
    } else if (value > props.max) {
      value = props.max
    }

    inputValue.value = value
    emit('update:modelValue', value)
    emit('update', value)
  }

  const onIconDoubleClick = () => {
    if (props.disabled) return
    if (typeof props.onReset === 'function') {
      props.onReset()
    }
  }

  const setValue = (val) => {
    inputValue.value = val
  }

  const showIcon = props.icon !== ''
  const showUnit = props.unit !== ''

  return {
    inputValue,
    onBlurOrEnter,
    onIconDoubleClick,
    setValue,
    showIcon,
    showUnit,
  }
}
