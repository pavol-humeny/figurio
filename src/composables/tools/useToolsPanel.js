import { ref, onMounted, nextTick, computed, watch } from 'vue'
import { useExportToolSettings } from '@/composables/toolsSettings/useExportToolSettings'
import { useImageStore } from '@/stores/imageStore'
import { useI18n } from 'vue-i18n'

export function useToolsPanel(editorStore, imageStore) {
  const toolsRef = ref(null)
  const atTop = ref(true)
  const atBottom = ref(false)

  const isToolDisabled = computed(() => !imageStore.isImageLoaded)

  const activeTool = computed(() => editorStore.selectedToolKey)

  const { t } = useI18n()

  const { openExportToolSettings } = useExportToolSettings(useImageStore(), t)

  const scrollUp = () => {
    toolsRef.value?.scrollBy({ top: -100, behavior: 'smooth' })
  }

  const scrollDown = () => {
    toolsRef.value?.scrollBy({ top: 100, behavior: 'smooth' })
  }

  const checkScroll = () => {
    const element = toolsRef.value
    if (!element) return
    atTop.value = element.scrollTop === 0
    atBottom.value = element.scrollTop + element.clientHeight >= element.scrollHeight - 1
  }

  onMounted(() => {
    nextTick(() => checkScroll())
  })

  const toggleTool = (toolKey, tabKey) => {
    console.log('Toggle tool:', toolKey)

    if (editorStore.selectedToolKey === toolKey && tabKey === null) {
      editorStore.selectTool('')
      return
    }
    editorStore.selectTool(toolKey)

    if (tabKey) {
      console.log('Sub tool:', tabKey)
      editorStore.selectTab(tabKey)
    }
  }

  const exportTool = () => {
    console.log('Export tool')
    openExportToolSettings()
  }

  const selectTool = (toolKey, tabKey) => {
    if (isToolDisabled.value) return

    // Export tool
    if (toolKey === 'export') {
      exportTool()
      return
    }

    toggleTool(toolKey, tabKey)
  }

  watch(
    () => ({
      tool: editorStore.selectedToolKey,
      tab: editorStore.selectedTabPerTool[editorStore.selectedToolKey],
    }),
    (newVal) => {
      if (
        newVal.tool === 'move' ||
        newVal.tool === 'transform' ||
        newVal.tool === 'grayscale' ||
        newVal.tool === 'frame' ||
        newVal.tool === 'export'
      ) {
        editorStore.selectSubTool('')
      }
    },
    { immediate: true, deep: false },
  )

  return {
    activeTool,
    toolsRef,
    atTop,
    atBottom,
    scrollUp,
    scrollDown,
    checkScroll,
    toggleTool,
    exportTool,
    selectTool,
    isToolDisabled,
  }
}
