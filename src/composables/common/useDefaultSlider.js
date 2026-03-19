/**
 * @file: useDefaultSlider.js
 * @author: Pavol Humeny
 * @date: 15.5.2026
 * @description: Logic for a <DefaultSlider> component, handling user input, synchronization with external model value, and emitting events for updates and commits. Supports pointer and wheel interactions for intuitive adjustments.
 */
import { ref, watch } from 'vue'
import { useMath } from './useMath'

/**
 * Logic for the <Slider> component
 *
 * @param {{ modelValue: number }} props - Component props with a numeric modelValue
 * @param {(event: string, value: number) => void} emit - Emit function for model updates
 * @returns {{
 *   currentValue: import('vue').Ref<number>,
 *   onInput: (event: Event) => void
 * }}
 */
export function useDefaultSlider(props, emit) {
  const { clamp } = useMath()

  /**
   * Internal reactive value representing the slider position
   */
  const currentValue = ref(props.modelValue)

  /**
   * Whether the slider is currently being adjusted
   */
  const isAdjusting = ref(false)

  /**
   * Synchronize currentValue with the external modelValue prop
   */
  watch(
    () => props.modelValue,
    (val) => {
      currentValue.value = val
    },
  )

  /**
   * Handles input event and emits updated value to the parent
   *
   * @param {Event} event - Input event from the slider
   */
  const onInput = (event) => {
    const value = Number(event.target.value)
    emit('update:modelValue', value)
    emit('update', value)
  }

  /**
   * Handles pointer down event to start adjusting the slider
   */
  const onPointerDown = () => {
    if (isAdjusting.value) return
    isAdjusting.value = true
    window.addEventListener('pointerup', onUp, true)
  }

  /**
   * Handles slider release and emits commit
   */
  const onUp = () => {
    if (!isAdjusting.value) return
    isAdjusting.value = false
    emit('commit', currentValue.value)
    window.removeEventListener('pointerup', onUp, true)
  }

  /**
   * Emits reset action when double-clicked
   */
  const onDoubleClick = () => {
    if (props.disabled) return
    if (typeof props.onReset === 'function') {
      props.onReset()
    }
  }

  /**
   * Handles mouse wheel to change slider value while hovering
   *
   * @param {WheelEvent} event
   */
  const onWheel = (event) => {
    if (props.disabled) return

    event.preventDefault()

    const direction = event.deltaY > 0 ? -1 : 1
    const step = props.step || 1

    let newValue = currentValue.value + direction * step

    // Clamp first
    newValue = clamp(newValue, props.min, props.max)

    // Snap to step precision (not integer rounding)
    const decimals = (step.toString().split('.')[1] || '').length
    newValue = Number(newValue.toFixed(decimals))

    currentValue.value = newValue
    emit('update:modelValue', newValue)
    emit('update', newValue)
  }

  return {
    currentValue,
    onInput,
    onDoubleClick,
    onPointerDown,
    isAdjusting,
    onUp,
    onWheel,
  }
}
