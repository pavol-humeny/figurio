import { ref, onMounted, nextTick, computed } from 'vue'

export function useToolsPanel(editorStore) {
  const toolsRef = ref(null)
  const atTop = ref(true)
  const atBottom = ref(false)

  const activeTool = computed(() => editorStore.selectedToolKey)

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

  return {
    activeTool,
    toolsRef,
    atTop,
    atBottom,
    scrollUp,
    scrollDown,
    checkScroll,
    toggleTool,
  }
}
