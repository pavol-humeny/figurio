import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { editorConfig } from '@/config/editorConfig'

/**
 * Logic for <itemTip> component
 *
 * @param {{
 *   position?: 'top' | 'top-right' | 'top-left' | 'bottom' | 'bottom-right' | 'bottom-left' | 'left' | 'right',
 *   delay?: number,
 *   offset?: number
 * }} [options={}] - Optional configuration for position, delay and offset
 * @returns {{
 *   isVisible: import('vue').Ref<boolean>,
 *   wrapperRef: import('vue').Ref<HTMLElement | null>,
 *   itemTipStyle: import('vue').ComputedRef<Record<string, string>>,
 *   handleMouseEnter: () => void,
 *   handleMouseLeave: () => void,
 *   updatePosition: () => void
 * }}
 */
export function useItemTip(options = {}) {
  /**
   * Tooltip position (defaults to 'top')
   */
  const { position = 'top', delay = editorConfig.tipDelay, offset = 8, text = '' } = options

  /**
   * Whether the tooltip is currently visible
   */
  const isVisible = ref(false)

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
    const textWidth = ctx.measureText(text).width + 20
    const minWidth = Math.min(Math.min(textWidth, 200), 300)

    return {
      ...baseStyle,
      minWidth: `${minWidth}px`,
      maxWidth: '300px',
      whiteSpace: 'normal',
    }
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

    switch (position) {
      case 'top':
        coords.value = {
          top: rect.top - offset,
          left: rect.left + rect.width / 2,
        }
        break
      case 'top-right':
        coords.value = {
          top: rect.top - offset,
          left: rect.left,
        }
        break
      case 'top-left':
        coords.value = {
          top: rect.top - offset,
          left: rect.right,
        }
        break
      case 'bottom':
        coords.value = {
          top: rect.bottom + offset,
          left: rect.left + rect.width / 2,
        }
        break
      case 'bottom-right':
        coords.value = {
          top: rect.bottom + offset,
          left: rect.left,
        }
        break
      case 'bottom-left':
        coords.value = {
          top: rect.bottom + offset,
          left: rect.right,
        }
        break
      case 'left':
        coords.value = {
          top: rect.top + rect.height / 2,
          left: rect.left - offset,
        }
        break
      case 'right':
      default:
        coords.value = {
          top: rect.top + rect.height / 2,
          left: rect.right + offset,
        }
        break
    }
  }

  /**
   * Handles mouseenter event and starts delayed tooltip show
   */
  const handleMouseEnter = () => {
    hoverTimeout.value = setTimeout(() => {
      isVisible.value = true
    }, delay)
  }

  /**
   * Handles mouseleave event and hides the tooltip
   */
  const handleMouseLeave = () => {
    clearTimeout(hoverTimeout.value)
    isVisible.value = false
  }

  /**
   * Hide the tip when mouse moves outside trigger element
   */
  const onMouseMove = (e) => {
    if (!wrapperRef.value) return

    // ak myš nie je nad trigger elementom → skryť
    if (!wrapperRef.value.contains(e.target)) {
      isVisible.value = false
    }
  }
  // Update position after mount
  onMounted(() => nextTick(updatePosition))

  // Clear tooltip timeout before component unmounts
  onBeforeUnmount(() => clearTimeout(hoverTimeout.value))

  // Hide the tip when clicking
  onMounted(() => {
    document.addEventListener('mousemove', onMouseMove)
  })
  onBeforeUnmount(() => {
    document.removeEventListener('mousemove', onMouseMove)
  })

  return {
    isVisible,
    wrapperRef,
    itemTipStyle,
    handleMouseEnter,
    handleMouseLeave,
    updatePosition,
  }
}
