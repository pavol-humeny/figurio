import { ref, watch, onMounted, onBeforeUnmount, computed, nextTick } from 'vue'

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
    console.warn('DropdownSelect onSelect', value)
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
    if (
      wrapperRef.value &&
      !wrapperRef.value.contains(event.target) &&
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

  /**
   * Setup event listeners on mount and cleanup on unmount
   * Detects outside clicks and window resize
   */
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
   * Dropdown readiness state to control rendering timing
   */
  const dropdownReady = ref(false)

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
   * Computed style for the dropdown based on its position
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
   * Watch for dropdown visibility changes to update position
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
    selectedValue,
    onIconDoubleClick,
    setValue,
    showIcon,
    showDropdown,
    onSelect,
    toggleDropdown,
    wrapperRef,
    longestLabelWidth,
    dropdownRef,
    dropdownStyle,
    dropdownReady,
  }
}
