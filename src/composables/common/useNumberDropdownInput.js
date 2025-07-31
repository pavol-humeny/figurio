import { useMath } from '@/composables/common/useMath'
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'

/**
 * Logic for a number input with dropdown selection
 * @param {{
 *   modelValue: number,
 *   min?: number,
 *   max?: number,
 *   disabled?: boolean
 * }} props - Component props
 * @param {(event: string, value: number) => void} emit - Emit function for model updates
 * @returns {{
 *   inputValue: import('vue').Ref<string>,
 *   showDropdown: import('vue').Ref<boolean>,
 *   inputRef: import('vue').Ref<HTMLInputElement | null>,
 *   onInput: () => void,
 *   onSelect: (value: number) => void,
 *   toggleDropdown: () => void,
 *   setValue: (val: number) => void
 * }}
 */
export function useNumberDropdownInput(props, emit) {
  const { clamp } = useMath()

  /**
   * Internal reactive value bound to the input
   */
  const inputValue = ref(props.modelValue.toString())

  /**
   * Dropdown visibility state
   */
  const showDropdown = ref(false)

  /**
   * Reference to the input element
   */
  const inputRef = ref(null)

  /**
   * Watch for external changes to modelValue and update internal state
   */
  watch(
    () => props.modelValue,
    (value) => {
      inputValue.value = value.toString()
    },
  )

  /**
   * Called on every input – updates internal value only
   */
  const onInput = (event) => {
    inputValue.value = event.target.value
  }

  /**
   * Called on blur or Enter – parses and clamps value
   */
  const onCommit = () => {
    const num = Number(inputValue.value)

    if (!isNaN(num)) {
      const clamped = clamp(num, props.min, props.max)
      inputValue.value = clamped.toString()
      emit('update:modelValue', clamped)
      emit('update', clamped)
    } else {
      // fallback: reset to last valid value
      inputValue.value = props.modelValue.toString()
    }
  }

  /**
   * Handles selection from the dropdown
   * @param {Number} value - Selected value
   */
  const onSelect = (value) => {
    inputValue.value = value.toString()
    emit('update:modelValue', Number(value))
    emit('update', Number(value))
    showDropdown.value = false
  }

  /**
   * Toggles the dropdown visibility
   */
  const toggleDropdown = () => {
    if (props.disabled) return
    showDropdown.value = !showDropdown.value
  }

  /**
   * Updates the internal value programmatically
   *
   * @param {Number} newValue - New value to set
   */
  const setValue = (newValue) => {
    inputValue.value = newValue
  }

  const onClickOutside = (event) => {
    const el = inputRef.value
    if (el && !el.contains(event.target)) {
      showDropdown.value = false
    }
  }

  onMounted(() => {
    document.addEventListener('mousedown', onClickOutside)
  })

  onBeforeUnmount(() => {
    document.removeEventListener('mousedown', onClickOutside)
  })

  return {
    inputValue,
    showDropdown,
    inputRef,
    onInput,
    onSelect,
    toggleDropdown,
    setValue,
    onCommit,
  }
}
