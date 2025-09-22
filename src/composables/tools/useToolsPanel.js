import { ref, onMounted, nextTick, computed, watch } from 'vue'
import { useCollapsiblePanel } from '../common/useCollapsiblePanel'
import { useSendEvent } from '../common/useSendEvent'
import { useToastModal } from '../modals/useToastModal'

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
 *   selectTool: (toolKey: string, tabKey?: string | null) => void,
 *   isToolDisabled: import('vue').ComputedRef<boolean>,
 * }}
 */
export function useToolsPanel(editorStore, imageStore, uiStore, t) {
  const { showToastModal } = useToastModal()

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
    (newVal, oldValue) => {
      if (oldValue === undefined) return // Needed, because it was deselecting magnify area object on add

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

      if (
        (newVal.tool !== 'shape' &&
          newVal.tool !== 'blur' &&
          newVal.tool !== 'magnifyArea' &&
          newVal.tool !== 'text' &&
          newVal.tool !== 'select') ||
        editorStore.previousToolKey !== 'select'
      ) {
        // Do not reset selection if coming from select tool
        imageStore.selectedSvgObjectIds = [] // Reset multi-selection on tool change
        imageStore.selectedSvgObjectId = null // Reset just created object ID
      }

      // Show or hide SVG objects list based on selected tool
      if (
        newVal.tool === 'shape' ||
        newVal.tool === 'blur' ||
        newVal.tool === 'magnifyArea' ||
        newVal.tool === 'text' ||
        newVal.tool === 'select'
      ) {
        if (imageStore.svgObjects.length > 0) {
          uiStore.svgObjectsListDisplayed = true
        } else {
          uiStore.svgObjectsListDisplayed = false
        }
      } else {
        uiStore.svgObjectsListDisplayed = false
      }

      // Clear previous tool key if switching between shape tool tabs
      if (newVal?.tool === 'shape' && oldValue?.tool === 'shape') {
        editorStore.previousToolKey = ''
      }

      // Clear removal canvas when switching between tools
      if (newVal.tool !== oldValue.tool) {
        imageStore.removalCanvas = null
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
    if (!imageStore.isImageLoaded || editorStore.isExportModalOpen) return
    if (editorStore.enableTools[toolKey] === false) {
      console.log('Tool is disabled:', toolKey)

      showToastModal(
        'info',
        t('tools.toolIsNotAvailable.title'),
        t('tools.toolIsNotAvailable.message'),
      )
      return
    }

    console.log('Toggle tool:', toolKey, 'Tab:', tabKey)

    // Send event
    useSendEvent().sendEvent('toggleTool', null, null, {
      tool: toolKey,
      tab: tabKey,
    })

    // if (editorStore.selectedToolKey === toolKey && tabKey === null) {
    //   // editorStore.selectTool('')
    //   // If the panel is open, hide it
    //   // useCollapsiblePanel(uiStore).hidePanel()
    //   return
    // }
    editorStore.selectTool(toolKey)

    // If the panel is closed, show it
    useCollapsiblePanel(uiStore).showPanel()

    if (tabKey) {
      editorStore.selectTab(tabKey)
    }
  }

  /**
   * Select tool or open export tool
   *
   * @param {string} toolKey - Tool key to select
   * @param {string | null} [tabKey] - Optional tab key
   */
  const selectTool = (toolKey, tabKey) => {
    if (isToolDisabled.value) return
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
    selectTool,
    isToolDisabled,
  }
}
