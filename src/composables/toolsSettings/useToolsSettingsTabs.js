import { ref, onMounted, computed } from 'vue'

/**
 * Logic for managing tabs inside the tool settings panel
 *
 * @param {object} editorStore - Store managing selected tool and tab per tool
 * @param {string} defaultTab - Key of the default tab to select
 * @returns {{
 *   activeTab: import('vue').ComputedRef<string>,
 *   isDragging: import('vue').Ref<boolean>,
 *   wrapperRef: import('vue').Ref<HTMLElement | null>,
 *   setActiveTab: (tab: string) => void,
 *   startDragging: (e: MouseEvent) => void
 * }}
 */
export function useToolsSettingsTabs(editorStore, defaultTab) {
  /**
   * Currently active tab for the selected tool
   */
  const activeTab = computed(
    () => editorStore.selectedTabPerTool[editorStore.selectedToolKey] || defaultTab,
  )

  /**
   * Reference to the tab scroll wrapper
   */
  const wrapperRef = ref(null)

  /**
   * Whether the user is dragging the tab container
   */
  const isDragging = ref(false)

  /**
   * Horizontal mouse position at the start of drag
   */
  const startX = ref(0)

  /**
   * Set the active tab in the editor store
   *
   * @param {string} tab - Tab key to activate
   */
  const setActiveTab = (tab) => {
    editorStore.selectTab(tab)
  }

  /**
   * Handle mouse movement for dragging the tab container
   *
   * @param {MouseEvent} event
   */
  const onMouseMove = (event) => {
    const element = wrapperRef.value
    if (!element) return

    const deltaX = event.clientX - startX.value
    element.scrollBy({ left: -deltaX, behavior: 'auto' })
    startX.value = event.clientX
  }

  /**
   * Handle mouse release after drag
   */
  const onMouseUp = () => {
    document.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('mouseup', onMouseUp)
    isDragging.value = false
  }

  /**
   * Start dragging the tab container
   *
   * @param {MouseEvent} event
   */
  const startDragging = (event) => {
    event.preventDefault()
    isDragging.value = true
    startX.value = event.clientX
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }

  // Initialize the tab scroll wrapper on mount
  onMounted(() => {
    const element = wrapperRef.value
    if (!element) return

    // Set default tab
    if (!editorStore.selectedTabPerTool[editorStore.selectedToolKey]) {
      editorStore.selectTab(defaultTab)
    }

    // Enable horizontal scroll using vertical mouse wheel
    element.addEventListener(
      'wheel',
      (e) => {
        if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
          e.preventDefault()
          element.scrollBy({ left: e.deltaY / 4, behavior: 'auto' })
        }
      },
      { passive: false },
    )
  })

  return {
    activeTab,
    isDragging,
    wrapperRef,
    setActiveTab,
    startDragging,
  }
}
