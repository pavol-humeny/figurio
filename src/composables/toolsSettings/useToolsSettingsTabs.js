import { ref, onMounted, computed, nextTick } from 'vue'

export function useToolsSettingsPanel(editorStore, tabsRef) {
  const wrapperRef = ref(null)

  const activeTab = computed(() => {
    return editorStore.selectedTabKey || tabsRef.value[0]
  })

  const setActiveTab = (tab) => {
    editorStore.selectTab(tab)
  }


  onMounted(async () => {
    await nextTick()
    const el = wrapperRef.value
    if (!el) return

    el.addEventListener(
      'wheel',
      (e) => {
        if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
          e.preventDefault()
          el.scrollBy({ left: e.deltaY / 4, behavior: 'auto' })
        }
      },
      { passive: false }
    )
  })

  return {
    wrapperRef,
    activeTab,
    setActiveTab
  }
}
