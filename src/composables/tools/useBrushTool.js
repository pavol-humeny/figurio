import { ref, watch, computed } from 'vue'
import { editorConfig } from '@/config/editorConfig.js'
import { useConfirmModal } from '@/composables/modals/useConfirmModal.js'

/**
 * Size of the brush tool
 */
const brushToolSize = ref(0)

export function useBrushTool(imageStore, historyStore, editorStore, t) {
  const { showConfirmModal } = useConfirmModal()

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
   * Watch for brush tool size changes in store and update local value
   */
  watch(
    () => editorStore.cursorSize,
    (newSize) => {
      brushToolSize.value = newSize
    },
    { immediate: true },
  )

  /**
   * Change size of the tool
   * @param {number} size - New size in pixels
   */
  const changeBrushToolSize = (size) => {
    editorStore.cursorSize = size
  }

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

      await imageStore.rasterize(t, true)

      historyStore.push(imageStore.getSnapshot(t))
    }
  }

  return {
    brushColor,
    brushToolSize,
    changeBrushToolSize,
    brushMaxToolSize,
    brushMinToolSize,
    saveColorToStore,
    rasterizeImage,
  }
}
