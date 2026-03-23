/**
 * @file: useCollapsiblePanel.js
 * @author: Pavol Humeny
 * @date: 15.5.2026
 * @description: Composable for managing the state and behavior of a collapsible right-side panel in the UI.
 */
import { computed, ref } from 'vue'

/**
 * Logic for the collapsible right-side panel component
 *
 * @param {UiStore} uiStore - Pinia store managing panel UI state
 */
export function useCollapsiblePanel(uiStore) {
  /**
   * Width of the collapse toggle button
   */
  const collapseButtonWidth = uiStore.collapseButtonWidth

  /**
   * Temporarily stores the width of the panel when collapsed
   */
  const tmpWidth = ref(0)

  /**
   * Whether resize is currently active
   */
  const isResizing = ref(false)
  /**
   * Initial mouse X position when resizing starts
   */
  const startX = ref(0)
  /**
   * Initial panel width before resizing
   */
  const startWidth = ref(0)

  /**
   * Total width of the right panel including the collapse button
   */
  const rightSidePanelWidth = computed(() => {
    return uiStore.rightPanelWidth + uiStore.collapseButtonWidth
  })

  /**
   * Computed state to track panel visibility
   */
  const isVisible = computed(() => uiStore.rightPanelOpen)

  /**
   * Toggles the visibility of the panel.
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
   * If panel is not visible, show it
   */
  const showPanel = () => {
    if (!isVisible.value) {
      uiStore.toggleRightPanel()
      uiStore.setRightPanelWidth(tmpWidth.value || uiStore.rightPanelDefaultWidth)
    }
  }

  /**
   * If panel is visible, hide it
   */
  const hidePanel = () => {
    if (isVisible.value) {
      tmpWidth.value = uiStore.rightPanelWidth
      uiStore.toggleRightPanel()
      uiStore.setRightPanelWidth(0)
    }
  }

  /**
   * Initiates the panel resizing operation.
   *
   * @param {MouseEvent} event - Mouse down event on resize handle
   */
  const startResize = (event) => {
    isResizing.value = true
    startX.value = event.clientX
    startWidth.value = uiStore.rightPanelWidth
    document.addEventListener('mousemove', handleResize)
    document.addEventListener('mouseup', stopResize)
  }

  /**
   * Dynamically updates the panel width during mouse movement.
   *
   * @param {MouseEvent} event - Mouse move event during resize
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
   * Ends the resize operation and removes mouse event listeners.
   */
  const stopResize = () => {
    isResizing.value = false
    document.removeEventListener('mousemove', handleResize)
    document.removeEventListener('mouseup', stopResize)
  }

  /**
   * Reset panel width to default value
   */
  const resetPanelWidth = () => {
    uiStore.resetRightPanelWidth()
    uiStore.resetSvgObjectsListHeight()
  }

  return {
    isVisible,
    toggleVisibility,
    rightSidePanelWidth,
    collapseButtonWidth,
    startResize,
    stopResize,
    showPanel,
    hidePanel,
    isResizing,
    startX,
    startWidth,
    handleResize,
    resetPanelWidth,
  }
}
