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
      inputValue.value = round(newVal, decimals.value)
    },
  )

  /**
   * Validate and normalize input value
   */
  const normalizeValue = (val) => {
    let num = Number(val)

    if (isNaN(num)) {
      // fallback
      return props.modelValue
    }

    num = round(num, decimals.value)

    if (num < props.min) {
      num = props.min
    } else if (num > props.max) {
      num = props.max
    }

    return num
  }

  /**
   * Handles blur or enter event, clamps value between min and max, emits update
   */
  const onBlurOrEnter = () => {
    console.log('NumberInput - onBlurOrEnter: ', inputValue.value)
    const value = normalizeValue(inputValue.value)
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
    inputValue.value = normalizeValue(newValue)
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
