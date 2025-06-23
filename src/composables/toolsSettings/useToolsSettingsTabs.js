import { ref, onMounted, computed } from 'vue'

export function useToolsSettingsTabs(editorStore, defaultTab) {
  const activeTab = computed(
    () => editorStore.selectedTabPerTool[editorStore.selectedToolKey] || defaultTab,
  )
  const wrapperRef = ref(null)

  const isDragging = ref(false)
  const startX = ref(0)

  const setActiveTab = (tab) => {
    editorStore.selectTab(tab)
  }

  onMounted(() => {
    const element = wrapperRef.value
    if (!element) return

    // Set default tab
    if (!editorStore.selectedTabPerTool[editorStore.selectedToolKey]) {
      editorStore.selectTab(defaultTab)
    }

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

  const onMouseMove = (e) => {
    const element = wrapperRef.value
    if (!element) return

    const deltaX = e.clientX - startX.value
    element.scrollBy({ left: -deltaX, behavior: 'auto' })
    startX.value = e.clientX
  }

  const onMouseUp = () => {
    document.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('mouseup', onMouseUp)
    isDragging.value = false
  }

  const startDragging = (e) => {
    e.preventDefault()
    isDragging.value = true
    startX.value = e.clientX
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }

  return {
    activeTab,
    isDragging,
    wrapperRef,
    setActiveTab,
    startDragging,
  }
}
