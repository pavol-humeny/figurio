import { useMath } from '@/composables/common/useMath'
import { ref, watch, onMounted, onBeforeUnmount, computed, nextTick } from 'vue'

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
    if (
      wrapper &&
      !wrapper.contains(event.target) &&
      dropdownRef.value &&
      !dropdownRef.value.contains(event.target)
    ) {
      showDropdown.value = false
    }
  }

  /**
   * Reference to the dropdown element
   */
  const dropdownRef = ref(null)

  /**
   * Adjusts the dropdown height and position based on viewport space
   */
  const adjustDropdownHeight = () => {
    const dropdown = dropdownRef.value
    const wrapper = wrapperRef.value
    if (!dropdown || !wrapper) return

    const rect = wrapper.getBoundingClientRect()
    const viewportHeight = window.innerHeight
    const padding = 10 // padding from viewport edges

    // Space above and below the dropdown
    const spaceBelow = viewportHeight - rect.bottom - padding
    const spaceAbove = rect.top - padding

    // Determine maximum height
    let maxHeight

    if (spaceBelow < 150 && spaceAbove > spaceBelow) {
      // More space above - open upwards
      maxHeight = spaceAbove
      dropdown.style.bottom = `100%`
      dropdown.style.top = 'auto'
      dropdown.style.marginBottom = '4px'
      dropdown.style.marginTop = '0'
    } else {
      // Open downwards
      maxHeight = spaceBelow
      dropdown.style.top = `100%`
      dropdown.style.bottom = 'auto'
      dropdown.style.marginTop = '4px'
      dropdown.style.marginBottom = '0'
    }

    dropdown.style.maxHeight = `${Math.max(maxHeight, 40)}px`
  }

  /**
   * Watch for dropdown visibility changes to adjust height
   */
  watch(showDropdown, async (val) => {
    if (val) {
      await nextTick()
      adjustDropdownHeight()
    }
  })

  // Hide the dropdown when clicking outside the component
  onMounted(() => {
    document.addEventListener('mousedown', onClickOutside)
    window.addEventListener('resize', adjustDropdownHeight)
  })
  onBeforeUnmount(() => {
    document.removeEventListener('mousedown', onClickOutside)
    window.removeEventListener('resize', adjustDropdownHeight)
  })

  /**
   * Dropdown position for teleport
   */
  const dropdownPosition = ref(null)

  /**
   * Updates the dropdown position based on the wrapper element
   */
  const updateDropdownPosition = () => {
    if (!wrapperRef.value) return

    const rect = wrapperRef.value.getBoundingClientRect()

    dropdownPosition.value = {
      top: rect.bottom + 4,
      left: rect.left,
      width: rect.width,
    }
  }

  /**
   * Computed style for positioning the dropdown
   */
  const dropdownStyle = computed(() => {
    if (!dropdownPosition.value) return {}

    return {
      position: 'fixed',
      top: `${dropdownPosition.value.top}px`,
      left: `${dropdownPosition.value.left}px`,
      width: `${dropdownPosition.value.width}px`,
    }
  })

  /**
   * Dropdown readiness state to control rendering timing
   */
  const dropdownReady = ref(false)

  /**
   * Watcher to set dropdown readiness
   */
  watch(showDropdown, async (val) => {
    if (val) {
      dropdownReady.value = false
      await nextTick()
      updateDropdownPosition()
      dropdownReady.value = true
    }
  })

  /**
   * Update dropdown position on scroll and resize
   */
  const onScroll = () => {
    if (showDropdown.value) {
      updateDropdownPosition()
    }
  }

  /**
   * Attach scroll and resize listeners
   */
  onMounted(() => {
    window.addEventListener('scroll', onScroll, true)
    window.addEventListener('resize', onScroll)
  })

  /**
   * Cleanup listeners on unmount
   */
  onBeforeUnmount(() => {
    window.removeEventListener('scroll', onScroll, true)
    window.removeEventListener('resize', onScroll)
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
    dropdownRef,
    dropdownStyle,
    dropdownReady,
  }
}
