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
   * Drag-to-change state
   */
  const isDragging = ref(false)
  let dragStartX = 0
  let dragStartY = 0
  let dragStartValue = 0

  /**
   * Determines drag direction based on icon name
   * - contains "width"  -> horizontal (X)
   * - contains "height" -> vertical (Y)
   * - fallback: width
   */
  const dragAxis = computed(() => {
    const icon = (props.icon || '').toLowerCase()

    if (icon.includes('height')) return 'height'
    if (icon.includes('width')) return 'width'

    return 'width'
  })

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
    { immediate: true },
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
    const value = normalizeValue(inputValue.value)
    inputValue.value = value
    emit('update:modelValue', value)
    emit('update', value)
  }

  /**
   * Handles input event, allows intermediate states like empty or '-'
   * Emits update only on valid numbers
   */
  const onInput = () => {
    // Allow empty or '-' input without emitting
    if (inputValue.value === '' || inputValue.value === '-') return

    const value = inputValue.value
    emit('update:modelValue', value)
    // emit('update', value)
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

  /**
   * Handles mouse wheel events to increment/decrement value
   * @param {WheelEvent} event - The wheel event
   */
  const onWheel = (event) => {
    if (props.disabled) return
    event.preventDefault()

    const direction = event.deltaY < 0 ? 1 : -1
    const newValue = normalizeValue(inputValue.value + props.step * direction)

    inputValue.value = newValue
    emit('update:modelValue', newValue)
    emit('update', newValue)
  }

  /**
   * Start dragging on icon
   * @param {PointerEvent} e
   */
  const onIconPointerDown = (e) => {
    if (props.disabled) return

    isDragging.value = true
    dragStartX = e.clientX
    dragStartY = e.clientY
    dragStartValue = Number(inputValue.value)

    // Capture pointer so we still receive move events
    e.target.setPointerCapture(e.pointerId)

    window.addEventListener('pointermove', onIconPointerMove)
    window.addEventListener('pointerup', onIconPointerUp)
  }

  /**
   * Update value while dragging
   * @param {PointerEvent} e
   */
  const onIconPointerMove = (e) => {
    if (!isDragging.value) return

    const deltaX = e.clientX - dragStartX
    const deltaY = dragStartY - e.clientY // inverted Y (up = positive)

    // sensitivity: how many pixels = one step
    const pixelsPerStep = e.shiftKey ? 1 : 5

    let delta

    if (dragAxis.value === 'height') {
      delta = deltaY
    } else {
      // width (default)
      delta = deltaX
    }

    const stepsDelta = Math.floor(delta / pixelsPerStep)

    const newValue = normalizeValue(dragStartValue + stepsDelta * props.step)

    inputValue.value = newValue
    emit('update:modelValue', newValue)
    emit('update', newValue)
  }

  /**
   * End dragging
   */
  const onIconPointerUp = () => {
    isDragging.value = false
    window.removeEventListener('pointermove', onIconPointerMove)
    window.removeEventListener('pointerup', onIconPointerUp)
  }

  return {
    inputValue,
    onBlurOrEnter,
    onInput,
    onIconDoubleClick,
    setValue,
    showIcon,
    showUnit,
    onWheel,
    onIconPointerDown,
    dragAxis,
  }
}
