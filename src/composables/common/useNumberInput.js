import { ref, watch, computed } from 'vue'
import { useMath } from './useMath'

/**
 * Logic for the <NumberInput> component
 *
 * @param {{
 *   modelValue: number,
 *   min: number,
 *   max: number,
 *   disabled?: boolean,
 *   icon?: string,
 *   unit?: string,
 *   onReset?: () => void
 * }} props - Component props
 * @param {(event: string, value: number) => void} emit - Emit function for model updates
 * @returns {{
 *   inputValue: import('vue').Ref<number>,
 *   onBlurOrEnter: () => void,
 *   onIconDoubleClick: () => void,
 *   setValue: (val: number) => void,
 *   showIcon: boolean,
 *   showUnit: boolean
 * }}
 */
export function useNumberInput(props, emit) {
  const { round } = useMath()
  /**
   * Internal reactive value bound to the number input
   */
  const inputValue = ref(props.modelValue)

  /**
   * Whether the icon should be shown
   */
  const showIcon = props.icon !== ''
  /**
   * Whether the unit label should be shown
   */
  const showUnit = props.unit !== ''

  /**
   * Number of decimal places for rounding
   */
  const decimals = computed(() => {
    if (props.step >= 1) return 0
    return props.step.toString().split('.')[1]?.length || 0
  })

  /**
   * Watch for external modelValue changes and update local value
   */
  watch(
    () => props.modelValue,
    (newVal) => {
      inputValue.value = newVal
    },
  )

  /**
   * Handles blur or enter event, clamps value between min and max, emits update
   */
  const onBlurOrEnter = () => {
    let value = inputValue.value

    value = round(value, decimals.value)

    if (value < props.min) {
      value = props.min
    } else if (value > props.max) {
      value = props.max
    }

    inputValue.value = value
    emit('update:modelValue', value)
    emit('update', value)
  }

  /**
   * Emits reset action when icon is double-clicked
   */
  const onIconDoubleClick = () => {
    if (props.disabled) return
    if (typeof props.onReset === 'function') {
      props.onReset()
    }
  }

  /**
   * Updates the internal input value programmatically
   *
   * @param {number} newValue - New value to assign
   */
  const setValue = (newValue) => {
    inputValue.value = round(newValue)
  }

  return {
    inputValue,
    onBlurOrEnter,
    onIconDoubleClick,
    setValue,
    showIcon,
    showUnit,
  }
}
