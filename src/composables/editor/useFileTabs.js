import { ref, onMounted } from 'vue'
import { useWorkspaceStore } from '@/stores/workspaceStore'
import { storeToRefs } from 'pinia'
import { useConfirmModal } from '../modals/useConfirmModal'

export function useFileTabs(wrapperRef, uiStore, t) {
  const { showConfirmModal } = useConfirmModal()

  const dragIndex = ref(null)
  const workspaceStore = useWorkspaceStore()
  const { tabs, activeTabIndex } = storeToRefs(workspaceStore)

  const setActiveTab = async (index) => {
    if (index !== activeTabIndex.value) {
      uiStore.isLoading = true

      await new Promise((resolve) => setTimeout(resolve, 10))

      workspaceStore.updateCurrentTabState()
      workspaceStore.switchToTab(index)

      await new Promise((resolve) => setTimeout(resolve, 50))

      uiStore.isLoading = false
    }
  }

  const closeTab = async (index) => {
    const confirmed = await showConfirmModal(
      t('topPanel.closeFileButton.confirm.title'),
      t('topPanel.closeFileButton.confirm.message'),
      t('topPanel.closeFileButton.confirm.cancel'),
      t('topPanel.closeFileButton.confirm.confirm'),
    )
    if (confirmed) {
      uiStore.isLoading = true

      await new Promise((resolve) => setTimeout(resolve, 10))

      workspaceStore.updateCurrentTabState()
      workspaceStore.closeTab(index)

      await new Promise((resolve) => setTimeout(resolve, 10))

      uiStore.isLoading = false
    }
  }

  const onTabDragStart = (index) => {
    dragIndex.value = index
  }

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
    tabs,
    activeTabIndex,
    setActiveTab,
    closeTab,
    onTabDragStart,
    onTabDrop,
  }
}
