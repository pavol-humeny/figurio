/**
 * @file: useNumberSpinner.js
 * @author: Pavol Humeny
 * @date: 15.5.2026
 * @description: Composable for managing the logic of a number spinner component, which includes an input field with up/down arrows and mouse wheel support for incrementing/decrementing values. Handles input validation, clamping, rounding, and synchronization between the input field and the component's model value. Also manages hover state for enabling/disabling mouse wheel control.
 */
import { ref, watch, computed } from 'vue'
import { useMath } from '@/composables/common/useMath'

/**
 * Logic for number spinner input (up/down arrows + mouse wheel)
 * @param {{
 *   modelValue: number,
 *   step: number,
 *   min: number,
 *   max: number,
 *   disabled?: boolean
 * }} props - Component props
 * @param {(event: string, value: number) => void} emit - Emit function for model updates
 */
export function useNumberSpinner(props, emit) {
  const { clamp, round } = useMath()

  /**
   * Internal input value (string)
   */
  const inputValue = ref(props.modelValue.toString())

  /**
   * Input element ref
   */
  const inputRef = ref(null)

  /**
   * Hover state (required for wheel control)
   */
  const isHovered = ref(false)

  /**
   * Decimal precision based on step
   */
  const decimals = computed(() => {
    if (props.step >= 1) return 0
    return props.step.toString().split('.')[1]?.length || 0
  })

  /**
   * Sync external modelValue -> input
   */
  watch(
    () => props.modelValue,
    (val) => {
      inputValue.value = val.toString()
    },
  )

  /**
   * Validate numeric string
   */
  const isValidNumberString = (str) => {
    str = str.trim()
    if (str === '') return false
    return /^-?\d*(\.\d+)?$/.test(str)
  }

  /**
   * Normalize value (clamp + round)
   */
  const normalizeValue = (val) => {
    if (!isValidNumberString(val)) {
      return props.modelValue
    }
    let num = Number(val)
    num = clamp(num, props.min, props.max)
    return round(num, decimals.value)
  }

  /**
   * Input handler (no emit)
   */
  const onInput = (event) => {
    inputValue.value = event.target.value
  }

  /**
   * Commit value on blur / enter
   */
  const onCommit = (event) => {
    // Stop Enter propagation
    if (event?.type === 'keydown' && event.key === 'Enter') {
      event.preventDefault()
      event.stopPropagation()

      // Remove focus from the input
      event.target.blur()
    }

    const num = normalizeValue(inputValue.value)
    inputValue.value = num.toString()
    emit('update:modelValue', num)
    emit('update', num)
  }

  /**
   * Increase value by step
   */
  const increment = () => {
    if (props.disabled) return
    const current = normalizeValue(inputValue.value)
    const next = clamp(current + props.step, props.min, props.max)
    const rounded = round(next, decimals.value)
    inputValue.value = rounded.toString()
    emit('update:modelValue', rounded)
    emit('update', rounded)
  }

  /**
   * Decrease value by step
   */
  const decrement = () => {
    if (props.disabled) return
    const current = normalizeValue(inputValue.value)
    const next = clamp(current - props.step, props.min, props.max)
    const rounded = round(next, decimals.value)
    inputValue.value = rounded.toString()
    emit('update:modelValue', rounded)
    emit('update', rounded)
  }

  /**
   * Mouse wheel handler (only when hovered)
   * Increments/decrements value based on wheel direction and step, with clamping and rounding
   * @param {WheelEvent} event - Wheel event
   */
  const onWheel = (event) => {
    if (props.disabled || !isHovered.value) return
    event.preventDefault()

    const direction = event.deltaY < 0 ? 1 : -1
    const current = normalizeValue(inputValue.value)
    const next = clamp(current + props.step * direction, props.min, props.max)
    const rounded = round(next, decimals.value)

    inputValue.value = rounded.toString()
    emit('update:modelValue', rounded)
    emit('update', rounded)
  }

  /**
   * Programmatic setter
   * @param {number} val - New value to set
   */
  const setValue = (val) => {
    inputValue.value = val.toString()
  }

  return {
    inputValue,
    inputRef,
    onInput,
    onCommit,
    increment,
    decrement,
    onWheel,
    setValue,
    isHovered,
  }
}
