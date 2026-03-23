/**
 * @file: useItemTip.js
 * @author: Pavol Humeny
 * @date: 15.5.2026
 * @description: Logic for <itemTip> component, managing tooltip visibility, positioning, and interactions. Supports delayed show/hide, dynamic positioning based on the target element, and integration with global UI state to ensure consistent behavior across the application.
 */
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { editorConfig } from '@/config/editorConfig'
import { useFeatureTourModal } from '@/composables/modals/useFeatureTourModal.js'

const { openSingleFeatureTourModal } = useFeatureTourModal()

/**
 * Logic for <itemTip> component
 *
 * @param {{
 *   position?: 'top' | 'top-right' | 'top-left' | 'bottom' | 'bottom-right' | 'bottom-left' | 'left' | 'right',
 *   delay?: number,
 *   offset?: number
 * }} [options={}] - Optional configuration for position, delay and offset
 * @param {UiStore} uiStore - Pinia store for managing global UI state
 * @param {EditorStore} editorStore - Pinia store for managing editor state
 */
export function useItemTip(options = {}, uiStore, editorStore) {
  /**
   * Tooltip position (defaults to 'top')
   */
  const { position = 'top', delay = editorConfig.tipDelay, offset = 8, text = '' } = options

  /**
   * Whether the tooltip is currently visible
   */
  const isVisible = ref(false)

  /**
   * Watch for global item tip visibility changes to hide this tooltip
   */
  watch(
    () => uiStore.isItemTipVisible,
    (newVal) => {
      if (!newVal) {
        isVisible.value = false
      }
    },
  )

  /**
   * Reference to the DOM element the tooltip is attached to
   */
  const wrapperRef = ref(null)

  /**
   * Timeout used to delay the tooltip appearance
   */
  const hoverTimeout = ref(null)

  /**
   * Coordinates where the tooltip should appear
   */
  const coords = ref({ top: 0, left: 0 })

  /**
   * Computed CSS style for positioning the tooltip
   */
  const itemTipStyle = computed(() => {
    const baseStyle = {
      position: 'absolute',
      top: `${coords.value.top}px`,
      left: `${coords.value.left}px`,
      zIndex: 'var(--z-index-tip)',
    }

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    const fontSize = '13px'
    const fontFamily = 'sans-serif'

    ctx.font = `${fontSize} ${fontFamily}`

    // Calculate width of text
    const textWidth = ctx.measureText(text).width + 40
    const minWidth = Math.min(Math.min(textWidth, 200), 300)
    let maxWidth = 300
    if (textWidth < 450) {
      maxWidth = 450
    }

    return {
      ...baseStyle,
      minWidth: `${minWidth}px`,
      maxWidth: `${maxWidth}px`,
      whiteSpace: 'normal',
    }
  })

  const tipRef = ref(null)

  /**
   * Last known mouse coordinates for hover state management
   */
  let lastMouseX = 0
  let lastMouseY = 0

  /**
   * Track mouse movement to update last known coordinates
   */
  document.addEventListener('mousemove', (e) => {
    lastMouseX = e.clientX
    lastMouseY = e.clientY
  })

  /**
   * Watches the visibility state and updates position when it changes
   */
  watch(isVisible, (visible) => {
    if (visible) nextTick(updatePosition)
  })

  /**
   * Updates tooltip coordinates based on wrapperRef element and position
   */
  const updatePosition = () => {
    if (!wrapperRef.value) return

    const rect = wrapperRef.value.getBoundingClientRect()

    let top = 0
    let left = 0

    // Maximum height of the tooltip to prevent overflow under screen
    const tipMaxHeight = 160

    switch (position) {
      case 'top':
        top = rect.top - offset
        left = rect.left + rect.width / 2
        break

      case 'top-right':
        top = rect.top - offset
        left = rect.left + rect.width / 2 - 20
        break

      case 'top-left':
        top = rect.top - offset
        left = rect.right + 20 - rect.width / 2
        break

      case 'bottom':
        top = rect.bottom + offset
        left = rect.left + rect.width / 2
        break

      case 'bottom-right':
        top = rect.bottom + offset
        left = rect.left + rect.width / 2 - 20
        break

      case 'bottom-left':
        top = rect.bottom + offset
        left = rect.right + 20 - rect.width / 2
        break

      case 'left':
        top = rect.top + rect.height / 2
        left = rect.left - offset
        break

      case 'right':
      default:
        top = rect.top + rect.height / 2
        left = rect.right + offset

        if (rect.bottom > window.innerHeight) {
          top = window.innerHeight - tipMaxHeight - 10 // 10px margin from bottom
        }

        if (top < tipMaxHeight) {
          top = tipMaxHeight + 10 // 10px margin from top
        }

        break
    }

    coords.value = { top, left }
  }

  /**
   * Watch for global dropdown open state to hide tooltip when any dropdown opens
   */
  watch(
    () => uiStore.isDropdownOpen,
    (active) => {
      if (active) {
        clearTimeout(hoverTimeout.value)
        isVisible.value = false
        uiStore.isItemTipVisible = false
      }
    },
  )

  /**
   * Handles mouseenter event and starts delayed tooltip show
   */
  const handleMouseEnter = () => {
    if (uiStore.isDropdownOpen) return

    clearTimeout(hoverTimeout.value)

    hoverTimeout.value = setTimeout(() => {
      if (uiStore.isDropdownOpen) return

      isVisible.value = true
      uiStore.isItemTipVisible = true
    }, delay)
  }

  /**
   * Mouse leave: use grace period so tooltip stays visible while moving over the gap
   */
  const handleMouseLeave = () => {
    clearTimeout(hoverTimeout.value)

    setTimeout(() => {
      if (!wrapperRef.value || !tipRef.value) return

      // Determine what element is currently under cursor
      const el = document.elementFromPoint(lastMouseX, lastMouseY)

      const isOverWrapper = wrapperRef.value.contains(el)
      const isOverTip = tipRef.value.contains(el)
      const subToolPopup = document.querySelector('.subTools-popup')
      const isOverSubToolPopup = subToolPopup ? subToolPopup.contains(el) : false

      // Hide only when cursor is outside both
      if (!isOverWrapper && !isOverTip) {
        isVisible.value = false

        if (!isOverSubToolPopup) {
          editorStore.setToolWithOpenSubTools('')
        }
        uiStore.isItemTipVisible = false
      }
    }, editorConfig.tipDelayHide)
  }

  /**
   * Handles mouse click event to hide the tooltip if clicked outside
   */
  const handleMouseClick = () => {
    if (!wrapperRef.value || !tipRef.value) return

    const el = document.elementFromPoint(lastMouseX, lastMouseY)

    const isOverTip = tipRef.value.contains(el)
    const isOverWrapper = wrapperRef.value.contains(el)

    if (isOverTip || isOverWrapper) return

    // Hide the tooltip
    isVisible.value = false
    uiStore.isItemTipVisible = false
  }

  /**
   * Opens the video tutorial for the given tool key
   *
   * @param {string} toolKey - The key of the tool to open the video for
   */
  const openToolVideo = (toolKey) => {
    // Hide the tooltip
    isVisible.value = false
    uiStore.isItemTipVisible = false

    // Open the feature tour modal with the specific tool video
    openSingleFeatureTourModal(toolKey)
  }

  /**
   * Hides the tooltip immediately without delay (used when window loses focus or visibility changes)
   */
  const hideTipImmediately = () => {
    clearTimeout(hoverTimeout.value)
    isVisible.value = false
    uiStore.isItemTipVisible = false
  }

  /**
   * Handles scroll events to hide the tooltip when the user scrolls the page
   */
  const handleScroll = () => {
    if (!isVisible.value) return

    isVisible.value = false
    uiStore.isItemTipVisible = false
  }

  // Update position after mount
  onMounted(() => {
    nextTick(updatePosition)

    document.addEventListener('click', handleMouseClick)

    window.addEventListener('blur', hideTipImmediately)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        hideTipImmediately()
      }
    })

    // Hide tooltip on scroll
    window.addEventListener('scroll', handleScroll, true)
  })

  // Clear tooltip timeout before component unmounts
  onBeforeUnmount(() => {
    clearTimeout(hoverTimeout.value)
    document.removeEventListener('click', handleMouseClick)

    window.removeEventListener('blur', hideTipImmediately)
    document.removeEventListener('visibilitychange', hideTipImmediately)

    window.removeEventListener('scroll', handleScroll, true)
  })

  return {
    isVisible,
    wrapperRef,
    itemTipStyle,
    handleMouseEnter,
    handleMouseLeave,
    updatePosition,
    tipRef,
    openToolVideo,
    handleMouseClick,
  }
}
