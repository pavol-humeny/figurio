import { ref, watch } from 'vue'

/**
 * Logic for the <StepperInput> component
 * @param {Object} props - Component props
 * @param {Function} emit - Emit function
 */
export function useStepperInput(props, emit) {
  const value = ref(props.modelValue)

  // Sync internal value with prop
  watch(
    () => props.modelValue,
    (val) => {
      value.value = val
    },
  )

  const emitChange = () => {
    emit('update:modelValue', value.value)
    emit('update', value.value)
  }

  const increase = () => {
    if (!props.disabled && value.value + props.step <= props.max) {
      value.value += props.step
      emitChange()
    }
  }

  const decrease = () => {
    if (!props.disabled && value.value - props.step >= props.min) {
      value.value -= props.step
      emitChange()
    }
  }

  const handleReset = () => {
    if (typeof props.onReset === 'function') {
      props.onReset()
    }
  }

  const setValue = (val) => {
    value.value = val
    emitChange()
  }

  const disableIncrease = () => {
    return props.disabled || value.value + props.step > props.max
  }

  const disableDecrease = () => {
    return props.disabled || value.value - props.step < props.min
  }

  const changeValue = (event) => {
    if (event.deltaY < 0) {
      increase()
    } else if (event.deltaY > 0) {
      decrease()
    }
  }

  return {
    value,
    increase,
    decrease,
    emitChange,
    handleReset,
    setValue,
    disableIncrease,
    disableDecrease,
    changeValue,
  }
}
