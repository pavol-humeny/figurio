import { computed, ref } from 'vue'

/**
 * Composable for managing collapsible right-side panel UI logic.
 *
 * @param {UiStore} uiStore - Pinia store
 * @returns {{
 *   isVisible: import('vue').ComputedRef<boolean>,
 *   toggleVisibility: () => void,
 *   rightSidePanelWidth: import('vue').ComputedRef<number>,
 *   collapseButtonWidth: number,
 *   startResize: (event: MouseEvent) => void
 * }}
 */
export function useCollapsiblePanel(uiStore) {
  // Width of the collapse toggle button
  const collapseButtonWidth = uiStore.collapseButtonWidth

  // Total width of the right panel including collapse button
  const rightSidePanelWidth = computed(() => {
    return uiStore.rightPanelWidth + uiStore.collapseButtonWidth
  })

  // Temporarily stores width when panel is collapsed
  const tmpWidth = ref(0)

  // Computed visibility state of the panel
  const isVisible = computed(() => uiStore.rightPanelOpen)

  // Resize-related state
  const isResizing = ref(false)
  const startX = ref(0)
  const startWidth = ref(0)

  /**
   * Toggles the panel open/closed (storing/restoring width).
   */
  const toggleVisibility = () => {
    if (isVisible.value) {
      tmpWidth.value = uiStore.rightPanelWidth
      uiStore.toggleRightPanel()
      uiStore.setRightPanelWidth(0)
    } else {
      uiStore.toggleRightPanel()
      uiStore.setRightPanelWidth(tmpWidth.value || uiStore.rightPanelDefaultWidth)
    }
  }

  /**
   * Starts a resize operation based on current mouse position.
   * @param {MouseEvent} event
   */
  const startResize = (event) => {
    isResizing.value = true
    startX.value = event.clientX
    startWidth.value = uiStore.rightPanelWidth
    document.addEventListener('mousemove', handleResize)
    document.addEventListener('mouseup', stopResize)
  }

  /**
   * Handles mousemove events to resize the panel.
   * @param {MouseEvent} event
   */
  const handleResize = (event) => {
    if (!isResizing.value) return
    const newWidth = startWidth.value - (event.clientX - startX.value)
    const clampedWidth = Math.max(
      uiStore.rightPanelMinWidth,
      Math.min(newWidth, uiStore.rightPanelMaxWidth),
    )
    uiStore.setRightPanelWidth(clampedWidth)
  }

  /**
   * Stops the resize operation and removes event listeners.
   */
  const stopResize = () => {
    isResizing.value = false
    document.removeEventListener('mousemove', handleResize)
    document.removeEventListener('mouseup', stopResize)
  }

  return {
    isVisible,
    toggleVisibility,
    rightSidePanelWidth,
    collapseButtonWidth,
    startResize,
  }
}
