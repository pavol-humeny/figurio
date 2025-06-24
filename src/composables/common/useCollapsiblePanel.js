import { computed, ref } from 'vue'

export function useCollapsiblePanel(uiStore) {
  const collapseButtonWidth = uiStore.collapseButtonWidth

  const rightSidePanelWidth = computed(() => {
    return uiStore.rightPanelWidth + uiStore.collapseButtonWidth
  })

  const tmpWidth = ref(0)

  const isVisible = computed(() => uiStore.rightPanelOpen)

  const isResizing = ref(false)
  const startX = ref(0)
  const startWidth = ref(0)

  const toggleVisibility = () => {
    if (isVisible.value){
      tmpWidth.value = uiStore.rightPanelWidth
      uiStore.toggleRightPanel()
      uiStore.setRightPanelWidth(0)
    }else{
      uiStore.toggleRightPanel()
      uiStore.setRightPanelWidth(tmpWidth.value || uiStore.rightPanelDefaultWidth)
    }
  }

  const startResize = (event) => {
    isResizing.value = true
    startX.value = event.clientX
    startWidth.value = uiStore.rightPanelWidth
    document.addEventListener('mousemove', handleResize)
    document.addEventListener('mouseup', stopResize)
  }

  const handleResize = (event) => {
    if (!isResizing.value) return
    const newWidth = startWidth.value - (event.clientX - startX.value)
    const clampedWidth = Math.max(
      uiStore.rightPanelMinWidth,
      Math.min(newWidth, uiStore.rightPanelMaxWidth)
    )
    uiStore.setRightPanelWidth(clampedWidth)
  }

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
