/**
 * @file: useContextMenu.js
 * @author: Pavol Humeny
 * @date: 15.5.2026
 * @description: Logic for a custom context menu component, including positioning, visibility management, and event handling to prevent accidental closure when interacting with the menu.
 */
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { editorConfig } from '@/config/editorConfig'
import { useConsole } from '@/composables/common/useConsole.js'
const { log } = useConsole()

/**
 * Logic for context menu component
 *
 * @returns {{
 *   wrapperRef: import('vue').Ref<HTMLElement | null>,
 *   isVisible: import('vue').Ref<boolean>,
 *   menuCoords: import('vue').Ref<{ x: number, y: number }>,
 *   contextMenuStyle: import('vue').ComputedRef<Record<string, string>>,
 *   showMenu: (event: MouseEvent) => void,
 *   closeMenu: () => void,
 *   handleMenuEnter: () => void,
 *   handleMenuLeave: () => void
 * }}
 */
export function useContextMenu() {
  /**
   * Reference to the wrapper element
   */
  const wrapperRef = ref(null)

  /**
   * Visibility state of the context menu
   */
  const isVisible = ref(false)

  /**
   * Coordinates for the context menu position
   */
  const menuCoords = ref({ x: 100, y: 100 })

  /**
   * Track if the mouse is hovering over the menu to prevent it from closing
   */
  const isHoveringMenu = ref(false)

  /**
   * Timeout to delay closing the menu
   */
  let hideTimeout = null

  /**
   * Style for the context menu based on coordinates
   */
  const contextMenuStyle = computed(() => ({
    position: 'absolute',
    top: `${menuCoords.value.y}px`,
    left: `${menuCoords.value.x}px`,
    zIndex: 'var(--z-index-context-menu)',
  }))

  /**
   * Close the context menu
   */
  const closeMenu = () => {
    isVisible.value = false
  }

  /**
   * Set position of menu and prevent overflow
   * @param {MouseEvent} event - The context menu event
   */
  const showMenu = (event) => {
    event.preventDefault()
    const x = event.clientX
    const y = event.clientY
    menuCoords.value = { x: x - 5, y: y - 5 } // Slight offset to always activate onMouseLeave
    isVisible.value = true

    nextTick(() => {
      const menu = document.querySelector('.context-menu-wrapper')
      if (menu) {
        const { innerWidth, innerHeight } = window
        const rect = menu.getBoundingClientRect()
        if (rect.right > innerWidth) {
          menuCoords.value.x -= rect.right - innerWidth + 8
        }
        if (rect.bottom > innerHeight) {
          menuCoords.value.y -= rect.bottom - innerHeight + 8
        }
      }
    })
  }

  /**
   * Hide menu on outside click
   * @param {MouseEvent} event - The click event
   */
  const onClickOutside = (event) => {
    if (!isVisible.value) return
    log('click outside')
    if (!document.querySelector('.context-menu-wrapper')?.contains(event.target)) {
      closeMenu()
    }
  }

  /**
   * Handle mouse enter on the menu to prevent it from closing
   */
  const handleMenuEnter = () => {
    isHoveringMenu.value = true
    clearTimeout(hideTimeout)
  }

  /**
   * Close menu after a delay if not hovering
   */
  const handleMenuLeave = () => {
    isHoveringMenu.value = false
    hideTimeout = setTimeout(() => {
      if (!isHoveringMenu.value) {
        closeMenu()
      }
    }, editorConfig.contextMenuDelay) // Delay before closing the menu
  }

  /**
   * Lifecycle hooks to manage event listeners
   */
  onMounted(() => {
    document.addEventListener('click', onClickOutside)
  })

  /**
   * Cleanup event listeners on unmount
   */
  onBeforeUnmount(() => {
    document.removeEventListener('click', onClickOutside)
  })

  return {
    wrapperRef,
    isVisible,
    menuCoords,
    contextMenuStyle,
    showMenu,
    closeMenu,
    handleMenuEnter,
    handleMenuLeave,
  }
}
