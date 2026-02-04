import { ref, onMounted } from 'vue'
import { useWorkspaceStore } from '@/stores/workspaceStore'
import { storeToRefs } from 'pinia'
import { useConfirmModal } from '../modals/useConfirmModal'
import { useImagePipeline } from './useImagePipeline'
import { uiConfig } from '@/config/uiConfig'

/**
 * Logic for handling file tab behavior, including switching, closing, dragging and scrolling
 *
 * @param {ReturnType<typeof import('@/stores/uiStore').useUiStore>} uiStore - UI store with loading state
 * @param {(key: string) => string} t - Translation function
 * @returns {Object}
 */
export function useFileTabs(uiStore, viewportStore, imageStore, editorStore, t) {
  const { showConfirmModal } = useConfirmModal()
  const { renderUpTo } = useImagePipeline(imageStore, uiStore)

  /**
   * Ref to wrapper element for scroll manipulation
   */
  const wrapperRef = ref(null)

  /**
   * Workspace store with tab state and actions
   */
  const workspaceStore = useWorkspaceStore()

  /**
   * Reactive references to tabs and the active tab index from the workspace store
   */
  const { tabs, activeTabIndex } = storeToRefs(workspaceStore)

  /**
   * Switch to the tab at the given index
   *
   * @param {number} index - Index of the tab to activate
   */
  const setActiveTab = async (index) => {
    if (index !== activeTabIndex.value) {
      uiStore.isLoading = true

      // Artifact overlay canvas
      const overlayCanvas = document.querySelector('.overlay-canvas-artifacts')
      if (overlayCanvas) {
        // Set class display to none
        overlayCanvas.style.display = 'none'
      }

      workspaceStore.updateCurrentTabState(t)
      await workspaceStore.switchToTab(index)

      await renderUpTo(imageStore.renderPipeline.currentOpIndex, { t, imageStore })

      uiStore.isLoading = false
    }
  }

  /**
   * Close the tab at the given index after user confirmation
   *
   * @param {number} index - Index of the tab to close
   */
  const closeTab = async (index) => {
    const confirmed = await showConfirmModal(
      t('topPanel.closeFileButton.confirm.title'),
      t('topPanel.closeFileButton.confirm.message'),
      t('topPanel.closeFileButton.confirm.cancel'),
      t('topPanel.closeFileButton.confirm.confirm'),
    )
    if (confirmed) {
      uiStore.isLoading = true

      workspaceStore.updateCurrentTabState(t)
      await workspaceStore.closeTab(index)

      if (workspaceStore.activeTabIndex !== -1) {
        await renderUpTo(imageStore.renderPipeline.currentOpIndex, { t, imageStore })
      }

      uiStore.isLoading = false
    }
  }

  /**
   * Switch to the next tab in the list
   */
  const switchToNextTab = async () => {
    uiStore.isLoading = true
    // await new Promise((resolve) => setTimeout(resolve, 1))

    workspaceStore.switchToNextTab(t)

    // await new Promise((resolve) => setTimeout(resolve, 1))
    uiStore.isLoading = false
  }

  /**
   * Switch to the previous tab in the list
   */
  const switchToPreviousTab = async () => {
    uiStore.isLoading = true
    // await new Promise((resolve) => setTimeout(resolve, 1))

    workspaceStore.switchToPreviousTab(t)

    // await new Promise((resolve) => setTimeout(resolve, 1))
    uiStore.isLoading = false
  }

  // Add scroll handler to enable horizontal scroll
  onMounted(() => {
    const element = wrapperRef.value
    if (!element) return
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

  /**
   * Whether a tab is currently being dragged
   */
  const isDraggingTab = ref(false)

  /**
   * Auto-scroll animation frame reference
   */
  let autoScrollRaf = null

  /**
   * Start auto-scrolling when dragging a tab near the edges
   *
   * @param {number} clientX - Current mouse X position
   */
  const startAutoScroll = (clientX) => {
    const el = wrapperRef.value
    if (!el) return

    const rect = el.getBoundingClientRect()

    // Determine scroll speed based on distance to edge
    const getSpeed = (distance) =>
      Math.min(12, Math.max(2, (uiConfig.autoScrollEdgeThreshold - distance) / 4))

    // Recursive scroll function
    const scroll = () => {
      if (!isDraggingTab.value) return

      const distanceLeft = clientX - rect.left
      const distanceRight = rect.right - clientX

      if (distanceLeft < uiConfig.autoScrollEdgeThreshold) {
        el.scrollLeft -= getSpeed(distanceLeft)
      } else if (distanceRight < uiConfig.autoScrollEdgeThreshold) {
        el.scrollLeft += getSpeed(distanceRight)
      }

      autoScrollRaf = requestAnimationFrame(scroll)
    }

    cancelAnimationFrame(autoScrollRaf)
    autoScrollRaf = requestAnimationFrame(scroll)
  }

  /**
   * Stop auto-scrolling
   */
  const stopAutoScroll = () => {
    cancelAnimationFrame(autoScrollRaf)
    autoScrollRaf = null
  }

  /**
   * Handle drag move event to trigger auto-scrolling
   *
   * @param {Object} evt - Drag event
   */
  const onDragMove = (evt) => {
    if (!isDraggingTab.value) return

    const clientX = evt.originalEvent?.clientX
    if (clientX == null) return

    startAutoScroll(clientX)
  }

  return {
    wrapperRef,
    tabs,
    activeTabIndex,
    setActiveTab,
    closeTab,
    switchToNextTab,
    switchToPreviousTab,
    onDragMove,
    isDraggingTab,
    startAutoScroll,
    stopAutoScroll,
  }
}
