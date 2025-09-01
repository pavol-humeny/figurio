import { useMath } from '@/composables/common/useMath'
import { ref, watch, onMounted, onBeforeUnmount, computed } from 'vue'

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
  const { clamp, round } = useMath()

  /**
   * Reference to the wrapper element for click outside detection
   */
  const wrapperRef = ref(null)

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
   * Number of decimal places for rounding
   */
  const decimals = computed(() => {
    if (props.step >= 1) return 0
    return props.step.toString().split('.')[1]?.length || 0
  })

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
   * Validates if a string is a valid number representation
   * @param {string} str - String to validate
   * @returns {boolean} True if valid, false otherwise
   */
  const isValidNumberString = (str) => {
    str = str.trim()

    if (str === '') return false

    return /^-?\d*(\.\d+)?$/.test(str)
  }

  /**
   * Normalize numeric value with clamping and rounding
   */
  const normalizeValue = (val) => {
    if (!isValidNumberString(val)) {
      // fallback
      return props.modelValue
    }
    let num = Number(val)
    num = clamp(num, props.min, props.max)
    return round(num, decimals.value)
  }

  /**
   * Called on blur or Enter – parses and clamps value
   */
  const onCommit = () => {
    const num = normalizeValue(inputValue.value)
    inputValue.value = num.toString()
    emit('update:modelValue', num)
    emit('update', num)
    showDropdown.value = false
  }

  /**
   * Handles selection from the dropdown
   * @param {Number} value - Selected value
   */
  const onSelect = (value) => {
    inputValue.value = value.toString()

    // Replace comma with period
    const normalized = parseFloat(String(value).replace(',', '.'))

    emit('update:modelValue', normalized)
    emit('update', normalized)
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

  /**
   * Hide the dropdown when clicking outside the component
   * @param {MouseEvent} event - Click event
   */
  const onClickOutside = (event) => {
    const wrapper = wrapperRef.value
    if (wrapper && !wrapper.contains(event.target)) {
      showDropdown.value = false
    }
  }

  // Hide the dropdown when clicking outside the component
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
    wrapperRef,
  }
}
