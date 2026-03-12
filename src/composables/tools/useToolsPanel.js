/**
 * @file: useToolsPanel.js
 * @author: Pavol Humeny
 * @date: 15.5.2026
 */
import { ref, onMounted, nextTick, computed, watch } from 'vue'
import { useCollapsiblePanel } from '../common/useCollapsiblePanel'
import { useToastModal } from '../modals/useToastModal'
import { useConsole } from '@/composables/common/useConsole.js'
const { log } = useConsole()
import { useApi } from '@/composables/common/useApi'
const { addUserEvent } = useApi()

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
export function useToolsPanel(editorStore, imageStore, uiStore, workspaceStore, t) {
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
        newVal.tool === 'magnifyArea' ||
        newVal.tool === 'brush' ||
        newVal.tool === 'crop'
      ) {
        editorStore.selectSubTool('')
        // imageStore.removeGrayscaleOperation()
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
        imageStore.clipboardSvgObject = null // Delete copied object from clipboard
      }

      // Show or hide SVG objects list based on selected tool
      if (
        newVal.tool === 'shape' ||
        newVal.tool === 'blur' ||
        newVal.tool === 'magnifyArea' ||
        newVal.tool === 'text' ||
        newVal.tool === 'select'
      ) {
        if (
          imageStore.svgObjects.length > 0 ||
          imageStore.blurObjects.length > 0 ||
          imageStore.magnifyObjects.length > 0
        ) {
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
    toolsRef.value?.scrollBy({ top: -10, behavior: 'auto' })
  }

  /**
   * Scroll panel downward by 100px
   */
  const scrollDown = () => {
    toolsRef.value?.scrollBy({ top: 10, behavior: 'auto' })
  }

  // Hold-scroll state
  const holdInterval = ref(null)
  const isHolding = ref(false)

  // Start auto-scrolling (direction: "up" | "down")
  const startHoldScroll = (direction) => {
    isHolding.value = true

    // First immediate scroll
    if (direction === 'up') scrollUp()
    else scrollDown()

    // Then repeating scroll
    holdInterval.value = setInterval(() => {
      if (direction === 'up') scrollUp()
      else scrollDown()
    }, 120) // repeat every 120 ms
  }

  // Stop auto-scrolling
  const stopHoldScroll = () => {
    isHolding.value = false
    clearInterval(holdInterval.value)
    holdInterval.value = null
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
  const toggleTool = async (toolKey, tabKey, canDeselect = true, resetPreviousTool = true) => {
    if (!imageStore.isImageLoaded || editorStore.isExportModalOpen) return
    if (editorStore.enableTools[toolKey] === false) {
      log('Tool is disabled:', toolKey)

      showToastModal(
        'info',
        t('tools.toolIsNotAvailable.title'),
        t('tools.toolIsNotAvailable.message'),
      )
      return
    }

    // If already selected, deselect
    if (
      canDeselect &&
      editorStore.selectedToolKey === toolKey &&
      (tabKey === null || tabKey === editorStore.selectedTabPerTool[toolKey])
    ) {
      // Do not deselect tool if coming from select tool
      if (editorStore.previousToolKey === 'select') {
        return
      }

      // If panel is closed, just open it without deselecting
      if (!uiStore.rightPanelOpen) {
        useCollapsiblePanel(uiStore).showPanel()
        return
      }

      log('Deselect tool:', toolKey)

      addUserEvent('deselectTool', { tool: toolKey })

      editorStore.selectTool('')
      editorStore.selectSubTool('')

      // Close the panel if no tool is selected
      useCollapsiblePanel(uiStore).hidePanel()

      return
    }

    // Reset previous tool key
    if (resetPreviousTool) {
      editorStore.previousToolKey = ''
    }

    log('Toggle tool:', toolKey, 'Tab:', tabKey)

    addUserEvent('toggleTool', { tool: toolKey, tab: tabKey || null })

    editorStore.selectTool(toolKey)

    if (tabKey) {
      editorStore.selectTab(tabKey)
    }

    // If the panel is closed, show it
    useCollapsiblePanel(uiStore).showPanel()
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
    startHoldScroll,
    stopHoldScroll,
  }
}
