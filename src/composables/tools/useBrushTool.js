import { watch, computed } from 'vue'
import { editorConfig } from '@/config/editorConfig.js'
import { useConfirmModal } from '@/composables/modals/useConfirmModal.js'
import { useApi } from '../common/useApi'
const { addUserEvent } = useApi()
import { useImagePipeline } from '../editor/useImagePipeline.js'

export function useBrushTool(imageStore, historyStore, editorStore, uiStore, t) {
  const { showConfirmModal } = useConfirmModal()
  const { renderUpTo } = useImagePipeline(imageStore, uiStore)

  /**
   * Color of the brush tool (initialized from store)
   */
  const brushColor = computed({
    get: () => editorStore.toolsConfig.brush.color,
    set: (value) => {
      editorStore.toolsConfig.brush.color = value
    },
  })

  /**
   * Whether the brush tool is in eraser mode
   */
  const isEraserMode = computed({
    get: () => editorStore.toolsConfig.brush.isEraserMode,
    set: (value) => {
      editorStore.toolsConfig.brush.isEraserMode = value
    },
  })

  /**
   * Size of the brush tool, synced with store
   */
  const brushSize = computed({
    get: () => editorStore.toolsConfig.brush.brushSize,
    set: (value) => {
      editorStore.toolsConfig.brush.brushSize = value
    },
  })

  /**
   * Set eraser mode based on selected subtool
   * @param {boolean} value - True for eraser mode, false for brush/pencil mode
   */
  const setIsEraserMode = (value) => {
    isEraserMode.value = value
  }

  /**
   * Change size of the brush tool
   * @param {number} size - New size in pixels
   */
  const setBrushSize = (size) => {
    brushSize.value = size
  }

  /**
   * Watch for selected tab changes and reset eraser mode
   */
  watch(
    () => editorStore.selectedTabPerTool['brush'],
    () => {
      isEraserMode.value = false
    },
  )

  /**
   * Save selected color to store
   */
  const saveColorToStore = (color) => {
    editorStore.toolsConfig.brush.color = color
  }

  /**
   * Minimum size of the manual tool (2px)
   */
  const brushMinToolSize = editorConfig.minManualToolSize

  /**
   * Maximum size of the brush tool (10% of smaller image dimension, min 10px)
   */
  const brushMaxToolSize = computed(() => {
    const smallerDimension = imageStore.getSmallerImageDimension()
    return Math.max(10, Math.floor(smallerDimension * editorConfig.maxManualToolSizeCoefficient))
  })

  /**
   * Rasterize image if there are any vector or blur objects
   */
  const rasterizeImage = async () => {
    if (imageStore.needRasterization) {
      const confirmed = await showConfirmModal(
        t('tools.confirmNeedRasterization.title'),
        t('tools.confirmNeedRasterization.message'),
        t('tools.confirmNeedRasterization.cancel'),
        t('tools.confirmNeedRasterization.confirm'),
      )
      if (!confirmed) return
      const result = await imageStore.rasterize('editor', {}, t)

      imageStore.addImageOperation({
        type: 'rasterize',
        params: {
          overlay: result.overlay,
        },
        cost: 'high',
        affectsGeometry: true,
      })

      addUserEvent('applyOperation', {
        tool: 'rasterize',
        settings: {},
      })

      await renderUpTo(imageStore.renderPipeline.currentOpIndex + 1, { t, imageStore })

      // Push to undo history
      historyStore.push(imageStore.getSnapshot(t))
    }
  }

  /**
   * Clear all brush strokes from the overlay
   */
  const clearAllCanvas = async () => {
    if (imageStore.needRasterization) return

    // Create empty overlay canvas (same size as image)
    const emptyOverlay = document.createElement('canvas')
    emptyOverlay.width = imageStore.fileDimensions.width
    emptyOverlay.height = imageStore.fileDimensions.height

    // Register as brush operation with empty overlay
    imageStore.addImageOperation({
      type: 'brush',
      overlay: emptyOverlay,
      cost: 'high',
      affectsGeometry: false,
    })

    // Re-render pipeline
    await renderUpTo(imageStore.renderPipeline.currentOpIndex + 1, { t, imageStore })

    // Push undo snapshot
    historyStore.push(imageStore.getSnapshot(t))
  }

  return {
    brushColor,
    brushSize,
    setBrushSize,
    brushMaxToolSize,
    brushMinToolSize,
    saveColorToStore,
    rasterizeImage,
    clearAllCanvas,
    setIsEraserMode,
    isEraserMode,
  }
}
