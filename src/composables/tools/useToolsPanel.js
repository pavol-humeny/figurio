import { ref, onMounted, nextTick, computed, watch } from 'vue'
import { useExportToolSettings } from '@/composables/toolsSettings/useExportToolSettings'
import { useImageStore } from '@/stores/imageStore'
import { useEditorStore } from '@/stores/editorStore'
import { useHistoryStore } from '@/stores/historyStore'
import { useCollapsiblePanel } from '../common/useCollapsiblePanel'
import { globalConfig } from '@/config/globalConfig'

/**
 * Logic for managing the left tools panel
 *
 * @param {ReturnType<typeof useEditorStore>} editorStore - Editor store instance
 * @param {ReturnType<typeof useImageStore>} imageStore - Image store instance
 * @param {Function} t - Translation function from vue-i18n
 * @returns {{
 *   activeTool: import('vue').ComputedRef<string>,
 *   toolsRef: import('vue').Ref<HTMLElement | null>,
 *   atTop: import('vue').Ref<boolean>,
 *   atBottom: import('vue').Ref<boolean>,
 *   scrollUp: () => void,
 *   scrollDown: () => void,
 *   checkScroll: () => void,
 *   toggleTool: (toolKey: string, tabKey?: string | null) => void,
 *   exportTool: () => void,
 *   selectTool: (toolKey: string, tabKey?: string | null) => void,
 *   isToolDisabled: import('vue').ComputedRef<boolean>,
 * }}
 */
export function useToolsPanel(editorStore, imageStore, uiStore, t) {
  /**
   * Method to open the export tool settings modal
   */
  const { openExportToolSettings } = useExportToolSettings(
    useImageStore(),
    useEditorStore(),
    useHistoryStore(),
    t,
  )

  /**
   * Reference to the scrollable tools panel element
   */
  const toolsRef = ref(null)

  /**
   * Whether scroll is at top of panel
   */
  const atTop = ref(true)
  /**
   * Whether scroll is at bottom of panel
   */
  const atBottom = ref(false)

  /**
   * Whether any tool should be disabled (based on image load state)
   */
  const isToolDisabled = computed(() => !imageStore.isImageLoaded)

  /**
   * Currently active tool key
   */
  const activeTool = computed(() => editorStore.selectedToolKey)

  // Reset subtool if switching to a global-level tool
  watch(
    () => ({
      tool: editorStore.selectedToolKey,
      tab: editorStore.selectedTabPerTool[editorStore.selectedToolKey],
    }),
    (newVal) => {
      if (
        // UPDATE new tool
        newVal.tool === 'move' ||
        newVal.tool === 'select' ||
        newVal.tool === 'transform' ||
        newVal.tool === 'grayscale' ||
        newVal.tool === 'frame' ||
        newVal.tool === 'export' ||
        newVal.tool === 'blur' ||
        newVal.tool === 'text' ||
        newVal.tool === 'shape' ||
        newVal.tool === 'magnifyArea'
      ) {
        editorStore.selectSubTool('')
      }

      imageStore.selectedSvgObjectIds = [] // Reset multi-selection on tool change
      
      if (newVal.tool !== 'shape') {
        imageStore.selectedSvgObjectId = null // Reset just created object ID
      }
    },
    { immediate: true, deep: false },
  )

  /**
   * Scroll panel upward by 100px
   */
  const scrollUp = () => {
    toolsRef.value?.scrollBy({ top: -100, behavior: 'smooth' })
  }

  /**
   * Scroll panel downward by 100px
   */
  const scrollDown = () => {
    toolsRef.value?.scrollBy({ top: 100, behavior: 'smooth' })
  }

  /**
   * Check scroll position and set atTop/atBottom flags
   */
  const checkScroll = () => {
    const element = toolsRef.value
    if (!element) return
    atTop.value = element.scrollTop === 0
    atBottom.value = element.scrollTop + element.clientHeight >= element.scrollHeight - 1
  }

  /**
   * Toggle selected tool and optionally activate a tab
   *
   * @param {string} toolKey - Tool key to toggle
   * @param {string | null} [tabKey] - Optional tab key to activate
   */
  const toggleTool = (toolKey, tabKey) => {
    if (!imageStore.isImageLoaded) return
    if (globalConfig.featureFlags.enableTools[toolKey] === false) {
      console.log('Tool is disabled:', toolKey)
      return
    }

    console.log('Toggle tool:', toolKey, 'Tab:', tabKey)

    if (editorStore.selectedToolKey === toolKey && tabKey === null) {
      editorStore.selectTool('')
      // If the panel is open, hide it
      useCollapsiblePanel(uiStore).hidePanel()
      return
    }
    editorStore.selectTool(toolKey)

    // If the panel is closed, show it
    useCollapsiblePanel(uiStore).showPanel()

    if (tabKey) {
      editorStore.selectTab(tabKey)
    }
  }

  /**
   * Open export modal via export tool
   */
  const exportTool = () => {
    console.log('Export tool')
    openExportToolSettings()
  }

  /**
   * Select tool or open export tool
   *
   * @param {string} toolKey - Tool key to select
   * @param {string | null} [tabKey] - Optional tab key
   */
  const selectTool = (toolKey, tabKey) => {
    if (isToolDisabled.value) return

    // Export tool
    if (toolKey === 'export') {
      exportTool()
      return
    }

    toggleTool(toolKey, tabKey)
  }

  // Check scroll position on mount
  onMounted(() => {
    nextTick(() => checkScroll())
  })

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
