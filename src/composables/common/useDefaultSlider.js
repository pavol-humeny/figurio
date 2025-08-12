import { ref, watch } from 'vue'

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

  return {
    currentValue,
    onInput,
    onDoubleClick,
    onPointerDown,
  }
}
