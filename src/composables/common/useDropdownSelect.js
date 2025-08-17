import { ref, watch, onMounted, onBeforeUnmount, computed } from 'vue'

/**
 * Logic for the <DropdownSelect> component
 *
 * @param {{ modelValue: string, icon?: string, onReset?: () => void }} props - Component props
 * @param {(event: string, value: any) => void} emit - Emit function for model updates
 * @returns {{
 *   selectedValue: import('vue').Ref<string>,
 *   onChange: () => void,
 *   onIconDoubleClick: () => void,
 *   setValue: (value: string) => void,
 *   showIcon: boolean
 * }}
 */
export function useDropdownSelect(props, emit) {
  /**
   * Reference to the wrapper element for click outside detection
   */
  const wrapperRef = ref(null)

  /**
   * Currently selected value of the dropdown
   */
  const selectedValue = ref(props.modelValue)

  /**
   * Dropdown visibility state
   */
  const showDropdown = ref(false)

  /**
   * Whether the reset icon should be shown
   */
  const showIcon = props.icon !== ''

  /**
   * Watch for external changes and synchronize internal value
   */
  watch(
    () => props.modelValue,
    (newVal) => {
      selectedValue.value = newVal
    },
  )

  const longestLabelWidth = computed(() => {
    if (!props.options?.length) return 0

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    let fontSize = '15px'
    let fontFamily = 'sans-serif'
    if (wrapperRef.value) {
      const style = getComputedStyle(wrapperRef.value)
      fontSize = style.fontSize
      fontFamily = style.fontFamily
    }

    ctx.font = `${fontSize} ${fontFamily}`

    let max = 0
    for (const opt of props.options) {
      const width = ctx.measureText(opt.label).width
      if (width > max) max = width
    }

    // + padding (for icon)
    return max + 50
  })

  /**
   * Emits reset action when icon is double-clicked
   */
  const onIconDoubleClick = () => {
    if (typeof props.onReset === 'function') {
      props.onReset()
    }
  }

  /**
   * Handles selection from the dropdown
   * @param {Number} value - Selected value
   */
  const onSelect = (value) => {
    selectedValue.value = value
    emit('update:modelValue', value)
    emit('update', value)
    showDropdown.value = false
  }

  /**
   * Sets selected value programmatically
   *
   * @param {string} newValue - New selected value
   */
  const setValue = (newValue) => {
    selectedValue.value = newValue
  }

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
    if (wrapperRef.value && !wrapperRef.value.contains(event.target)) {
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
    selectedValue,
    onIconDoubleClick,
    setValue,
    showIcon,
    showDropdown,
    onSelect,
    toggleDropdown,
    wrapperRef,
    longestLabelWidth,
  }
}
