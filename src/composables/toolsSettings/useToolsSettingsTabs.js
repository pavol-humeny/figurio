import { ref, onMounted, computed } from 'vue'

export function useToolsSettingsTabs(editorStore, defaultTab) {
  const activeTab = computed(() => editorStore.selectedTabKey || defaultTab)
  const wrapperRef = ref(null)

  const setActiveTab = (tab) => {
    editorStore.selectTab(tab)
  }

  onMounted(() => {
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
    activeTab,
    wrapperRef,
    setActiveTab
  }
}
