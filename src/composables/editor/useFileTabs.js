import { ref, onMounted } from 'vue'
import { useWorkspaceStore } from '@/stores/workspaceStore'
import { storeToRefs } from 'pinia'
import { useConfirmModal } from '../modals/useConfirmModal'

/**
 * Logic for handling file tab behavior, including switching, closing, dragging and scrolling
 *
 * @param {ReturnType<typeof import('@/stores/uiStore').useUiStore>} uiStore - UI store with loading state
 * @param {(key: string) => string} t - Translation function
 * @returns {Object}
 */
export function useFileTabs(uiStore, t) {
  const { showConfirmModal } = useConfirmModal()

  /**
   * Ref to wrapper element for scroll manipulation
   */
  const wrapperRef = ref(null)

  /**
   * Index of the tab being dragged
   */
  const dragIndex = ref(null)

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
      await new Promise((resolve) => setTimeout(resolve, 1))

      workspaceStore.updateCurrentTabState(t)
      workspaceStore.switchToTab(index)

      await new Promise((resolve) => setTimeout(resolve, 1))
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
      await new Promise((resolve) => setTimeout(resolve, 1))

      workspaceStore.updateCurrentTabState(t)
      workspaceStore.closeTab(index)

      await new Promise((resolve) => setTimeout(resolve, 1))
      uiStore.isLoading = false
    }
  }

  /**
   * Set the index of the dragged tab
   *
   * @param {number} index - Index of the tab being dragged
   */
  const onTabDragStart = (index) => {
    dragIndex.value = index
  }

  /**
   * Reorder tabs based on drop index and updates active index accordingly
   *
   * @param {number} index - Index where the tab is dropped
   */
  const onTabDrop = (index) => {
    if (dragIndex.value === null || dragIndex.value === index) return
    const movedTab = tabs.value.splice(dragIndex.value, 1)[0]
    tabs.value.splice(index, 0, movedTab)

    if (activeTabIndex.value === dragIndex.value) {
      activeTabIndex.value = index
    } else if (activeTabIndex.value > dragIndex.value && activeTabIndex.value <= index) {
      activeTabIndex.value--
    } else if (activeTabIndex.value < dragIndex.value && activeTabIndex.value >= index) {
      activeTabIndex.value++
    }

    dragIndex.value = null
  }

  /**
   * Switch to the next tab in the list
   */
  const switchToNextTab = async () => {
    uiStore.isLoading = true
    await new Promise((resolve) => setTimeout(resolve, 1))

    workspaceStore.switchToNextTab(t)

    await new Promise((resolve) => setTimeout(resolve, 1))
    uiStore.isLoading = false
  }

  /**
   * Switch to the previous tab in the list
   */
  const switchToPreviousTab = async () => {
    uiStore.isLoading = true
    await new Promise((resolve) => setTimeout(resolve, 1))

    workspaceStore.switchToPreviousTab(t)

    await new Promise((resolve) => setTimeout(resolve, 1))
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

  return {
    wrapperRef,
    tabs,
    activeTabIndex,
    setActiveTab,
    closeTab,
    onTabDragStart,
    onTabDrop,
    switchToNextTab,
    switchToPreviousTab,
  }
}
