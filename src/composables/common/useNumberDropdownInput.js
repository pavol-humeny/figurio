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
export function useNumberDropdownInput(props, emit, uiStore) {
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
   * Updates the internal value programmatically
   *
   * @param {Number} newValue - New value to set
   */
  const setValue = (newValue) => {
    inputValue.value = newValue
  }

  /**
   * Watch for dropdown visibility changes to update global state (for tooltips)
   */
  watch(showDropdown, (val) => {
    uiStore.isDropdownOpen = val
  })

  /**
   * Toggles the dropdown visibility
   */
  const toggleDropdown = () => {
    if (props.disabled) return
    showDropdown.value = !showDropdown.value
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

  // Hide the dropdown when clicking outside the component
  onMounted(() => {
    document.addEventListener('mousedown', onClickOutside)
  })
  onBeforeUnmount(() => {
    document.removeEventListener('mousedown', onClickOutside)
  })

  /**
   * Dropdown position for teleport
   */
  const dropdownPosition = ref(null)

  /**
   * Dropdown readiness state to control rendering timing
   */
  const dropdownReady = ref(false)

  /**
   * Updates the dropdown position based on the wrapper element
   */
  const updateDropdownPosition = () => {
    if (!wrapperRef.value || !dropdownRef.value) return

    const rect = wrapperRef.value.getBoundingClientRect()
    const dropdown = dropdownRef.value
    const viewportHeight = window.innerHeight
    const padding = 10

    const spaceBelow = viewportHeight - rect.bottom - padding
    const spaceAbove = rect.top - padding

    const openUp = spaceBelow < 150 && spaceAbove > spaceBelow

    dropdownPosition.value = {
      top: openUp ? rect.top - dropdown.offsetHeight - 4 : rect.bottom + 4,
      left: Math.round(rect.left),
      width: rect.width,
      maxHeight: Math.max(openUp ? spaceAbove : spaceBelow, 40),
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
      maxHeight: `${dropdownPosition.value.maxHeight}px`,
    }
  })

  /**
   * Watcher to set dropdown readiness
   */
  watch(showDropdown, async (val) => {
    if (!val) return

    dropdownReady.value = true
    await nextTick()

    requestAnimationFrame(() => {
      updateDropdownPosition()
    })
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
   * Emits reset action when icon is double-clicked
   */
  const onIconDoubleClick = () => {
    if (props.disabled) return
    if (typeof props.onReset === 'function') {
      props.onReset()
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
    onIconDoubleClick,
    showIcon,
    showUnit,
  }
}
