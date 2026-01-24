import { ref, onMounted } from 'vue'
import { useWorkspaceStore } from '@/stores/workspaceStore'
import { storeToRefs } from 'pinia'
import { useConfirmModal } from '../modals/useConfirmModal'
import { useImagePipeline } from './useImagePipeline'

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
      const overlayCanvas = document.querySelector('.overlay-canvas')
      if (overlayCanvas) {
        // Set class display to none
        overlayCanvas.style.display = 'none'
      }

      workspaceStore.updateCurrentTabState(t)
      await workspaceStore.switchToTab(index)

      // Reset when switching tabs to reset rulers position
      // TODO - experimentaly commented, if everything works fine remove these lines
      // viewportStore.resetZoom()
      // viewportStore.resetPan()
      // viewportStore.shouldFitToScreen = true

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
   * Handle reorder from vuedraggable
   */
  const onTabsReorder = (evt) => {
    const { oldIndex, newIndex } = evt
    if (oldIndex === newIndex) return

    if (activeTabIndex.value === oldIndex) {
      activeTabIndex.value = newIndex
    } else if (activeTabIndex.value > oldIndex && activeTabIndex.value <= newIndex) {
      activeTabIndex.value--
    } else if (activeTabIndex.value < oldIndex && activeTabIndex.value >= newIndex) {
      activeTabIndex.value++
    }
  }

  return {
    wrapperRef,
    tabs,
    activeTabIndex,
    setActiveTab,
    closeTab,
    onTabsReorder,
    switchToNextTab,
    switchToPreviousTab,
  }
}
