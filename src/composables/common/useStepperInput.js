import { ref, watch } from 'vue'

/**
 * Logic for the <StepperInput> component
 *
 * @param {{
 *   modelValue: number,
 *   step: number,
 *   min: number,
 *   max: number,
 *   disabled?: boolean,
 *   onReset?: () => void
 * }} props - Component props
 * @param {(event: string, value: number) => void} emit - Emit function for model updates
 * @returns {{
 *   value: import('vue').Ref<number>,
 *   increase: () => void,
 *   decrease: () => void,
 *   emitChange: () => void,
 *   handleReset: () => void,
 *   setValue: (val: number) => void,
 *   disableIncrease: () => boolean,
 *   disableDecrease: () => boolean,
 *   changeValue: (event: WheelEvent) => void
 * }}
 */
export function useStepperInput(props, emit) {
  /**
   * Internal reactive value of the input
   */
  const inputValue = ref(props.modelValue)

  /**
   * Watch for external changes to modelValue and update internal state
   */
  watch(
    () => props.modelValue,
    (newValue) => {
      inputValue.value = newValue
    },
  )

  /**
   * Emits the updated value to the parent component
   */
  const emitChange = () => {
    emit('update:modelValue', inputValue.value)
    emit('update', inputValue.value)
  }

  /**
   * Increases the value by step if within max bounds and not disabled
   */
  const increase = () => {
    if (!props.disabled && inputValue.value + props.step <= props.max) {
      inputValue.value += props.step
      emitChange()
    }
  }

  /**
   * Decreases the value by step if within min bounds and not disabled
   */
  const decrease = () => {
    if (!props.disabled && inputValue.value - props.step >= props.min) {
      inputValue.value -= props.step
      emitChange()
    }
  }

  /**
   * Calls the onReset prop function if defined
   */
  const handleReset = () => {
    if (typeof props.onReset === 'function') {
      props.onReset()
    }
  }

  /**
   * Programmatically sets the value and emits it
   *
   * @param {number} newValue - New value to set
   */
  const setValue = (newValue) => {
    inputValue.value = newValue
    emitChange()
  }

  /**
   * Returns true if the increase button should be disabled
   *
   * @returns {boolean}
   */
  const disableIncrease = () => {
    return props.disabled || inputValue.value + props.step > props.max
  }

  /**
   * Returns true if the decrease button should be disabled
   *
   * @returns {boolean}
   */
  const disableDecrease = () => {
    return props.disabled || inputValue.value - props.step < props.min
  }

  /**
   * Handles mouse wheel events to change value
   *
   * @param {WheelEvent} event - Mouse wheel event
   */
  const changeValue = (event) => {
    if (event.deltaY < 0) {
      increase()
    } else if (event.deltaY > 0) {
      decrease()
    }
    event.preventDefault()
  }

  return {
    inputValue,
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
