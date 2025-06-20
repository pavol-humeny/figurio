import { ref, onMounted, nextTick, computed } from 'vue'
import { useExportToolSettings } from '../toolsSettings/useExportToolSettings'
import { useImageStore } from '@/stores/imageStore'
import { useI18n } from 'vue-i18n'

export function useToolsPanel(editorStore, imageStore) {
  const toolsRef = ref(null)
  const atTop = ref(true)
  const atBottom = ref(false)

  const isExportDisabled = computed(() => !imageStore.isImageLoaded())

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

  const toggleTool = (toolKey) => {
    if (editorStore.selectedToolKey === toolKey) {
      editorStore.selectTool('')
      return
    }
    editorStore.selectTool(toolKey)
  }

  const exportTool = () => {
    console.log('Export tool clicked')
    openExportToolSettings()
  }

  const clickFunction = (toolKey) => {
    if (toolKey === 'export') {
      if (!isExportDisabled.value) {
        exportTool()
      }
    } else {
      toggleTool(toolKey)
    }
  }

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
    clickFunction,
    isExportDisabled,
  }
}
