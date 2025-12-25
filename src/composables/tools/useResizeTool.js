import { ref, nextTick, watch, computed } from 'vue'
import { editorConfig } from '@/config/editorConfig'
import { useMath } from '../common/useMath'
import { useConfirmModal } from '../modals/useConfirmModal'
import { useApi } from '@/composables/common/useApi'
const { addUserEvent } = useApi()
import { useImagePipeline } from '../editor/useImagePipeline'

/**
 * Logic for the resize tool
 *
 * @param {ReturnType<typeof useImageStore>} imageStore - Image store instance
 * @param {ReturnType<typeof useHistoryStore>} historyStore - History store instance
 * @param {Function} t - Translation function
 * @returns {object} Resize tool bindings and methods
 */
export function useResizeTool(imageStore, historyStore, viewportStore, uiStore, t) {
  const { showConfirmModal } = useConfirmModal()
  const { round } = useMath()
  const { renderUpTo } = useImagePipeline(imageStore, uiStore)

  /**
   * Flag to prevent infinite loops during updates from the store
   */
  const isUpdatingFromStore = ref(false)

  /**
   * Maximum allowed image width and height based on editor config
   */
  const maxFileDimensionWidth = ref(editorConfig.maxFileDimensionWidth)
  const maxFileDimensionHeight = ref(editorConfig.maxFileDimensionHeight)

  /**
   * Whether to preserve the aspect ratio when resizing
   */
  const isFileDimensionsLinked = ref(true)

  /**
   * New width and height of the image entered by the user
   */
  const fileDimensionWidth = ref(imageStore.fileDimensions.width)
  const fileDimensionHeight = ref(imageStore.fileDimensions.height)

  /**
   * Original aspect ratio (width / height) of the image
   * Used when dimensions are linked
   */
  let originalAspectRatio = imageStore.fileDimensions.width / imageStore.fileDimensions.height

  /**
   * Reference to the width and height input component
   */
  const FileDimensionWidthInputRef = ref(null)
  const FileDimensionHeightInputRef = ref(null)

  /**
   * Operation can not be applied if image has same dimensions as requested or zero dimensions
   */
  const canBeApplied = computed(() => {
    return (
      fileDimensionWidth.value > 0 &&
      fileDimensionHeight.value > 0 &&
      (fileDimensionWidth.value !== imageStore.fileDimensions.width ||
        fileDimensionHeight.value !== imageStore.fileDimensions.height)
    )
  })

  /**
   * Watch for changes in file dimensions and update inputs accordingly
   */
  watch(
    () => imageStore.fileDimensions,
    (newVal) => {
      isUpdatingFromStore.value = true

      fileDimensionWidth.value = newVal.width
      fileDimensionHeight.value = newVal.height

      originalAspectRatio = newVal.width / newVal.height

      nextTick(() => {
        FileDimensionWidthInputRef.value?.setValue(fileDimensionWidth.value)
        FileDimensionHeightInputRef.value?.setValue(fileDimensionHeight.value)

        isUpdatingFromStore.value = false
      })
    },
    { immediate: true, deep: true },
  )

  /**
   * Update dimension input values, respecting aspect ratio if enabled
   *
   * @param {'width'|'height'} key - Dimension to update
   * @param {number} value - New dimension value
   */
  const updateFileDimension = (key, value) => {
    if (isUpdatingFromStore.value) return

    if (isNaN(value) || value <= 0) return

    if (key === 'width') {
      if (value > maxFileDimensionWidth.value) {
        value = maxFileDimensionWidth.value
      } else if (value < 1) {
        value = 1
      }

      fileDimensionWidth.value = value
      if (isFileDimensionsLinked.value) {
        const newHeight = round(value / originalAspectRatio)
        if (newHeight < 1) {
          fileDimensionHeight.value = 1
        } else if (newHeight > maxFileDimensionHeight.value) {
          fileDimensionHeight.value = maxFileDimensionHeight.value
        } else {
          fileDimensionHeight.value = newHeight
        }
      }
    } else if (key === 'height') {
      if (value > maxFileDimensionHeight.value) {
        value = maxFileDimensionHeight.value
      } else if (value < 1) {
        value = 1
      }

      fileDimensionHeight.value = value
      if (isFileDimensionsLinked.value) {
        const newWidth = round(value * originalAspectRatio)
        if (newWidth < 1) {
          fileDimensionWidth.value = 1
        } else if (newWidth > maxFileDimensionWidth.value) {
          fileDimensionWidth.value = maxFileDimensionWidth.value
        } else {
          fileDimensionWidth.value = newWidth
        }
      }
    }

    nextTick(() => {
      FileDimensionWidthInputRef.value?.setValue(fileDimensionWidth.value)
      FileDimensionHeightInputRef.value?.setValue(fileDimensionHeight.value)
    })
  }

  /**
   * Compute effective rotation (0, 90, 180, 270) from image operations.
   *
   * @returns {number} rotation in degrees
   */
  const getEffectiveRotation = () => {
    let rotation = 0

    for (const op of imageStore.imageOperations) {
      if (op.type !== 'rotate') continue

      rotation = (rotation + op.params.angle) % 360
    }

    // Normalize to positive values
    return (rotation + 360) % 360
  }

  /**
   * Reset resize dimensions to original image dimensions
   */
  const resetResize = () => {
    const rotation = getEffectiveRotation()

    let width = imageStore.originalFileDimensions.width
    let height = imageStore.originalFileDimensions.height

    // Swap dimensions for 90° or 270° rotation
    if (rotation === 90 || rotation === 270) {
      const tmp = width
      width = height
      height = tmp
    }

    fileDimensionWidth.value = width
    fileDimensionHeight.value = height
    originalAspectRatio = width / height || 1

    isFileDimensionsLinked.value = true

    nextTick(() => {
      FileDimensionWidthInputRef.value?.setValue(fileDimensionWidth.value)
      FileDimensionHeightInputRef.value?.setValue(fileDimensionHeight.value)
    })
  }

  /**
   * Apply the resize operation to the operation history and canvas
   */
  const applyResize = async () => {
    if (!canBeApplied.value) return

    if (imageStore.needRasterization) {
      const confirmed = await showConfirmModal(
        t('tools.confirmNeedRasterization.title'),
        t('tools.confirmNeedRasterization.message'),
        t('tools.confirmNeedRasterization.cancel'),
        t('tools.confirmNeedRasterization.confirm'),
      )
      if (confirmed) {
        await imageStore.rasterize(t, true)
      } else {
        return
      }
    }

    // if (imageStore.needMergeOverlay) {
    //   const confirmed = await showConfirmModal(
    //     t('tools.confirmNeedOverlayMerge.title'),
    //     t('tools.confirmNeedOverlayMerge.message'),
    //     t('tools.confirmNeedOverlayMerge.cancel'),
    //     t('tools.confirmNeedOverlayMerge.confirm'),
    //   )
    //   if (confirmed) {
    //     imageStore.mergeOverlayIntoImage()
    //   } else {
    //     return
    //   }
    // }

    // if (imageStore.needMergeOverlay) {
    //   imageStore.mergeOverlayIntoImage()
    //   showToastModal(
    //     'info',
    //     t('tools.infoOverlayWasMerged.title'),
    //     t('tools.infoOverlayWasMerged.message'),
    //   )
    // }

    imageStore.addImageOperation({
      type: 'resize',
      params: {
        width: fileDimensionWidth.value,
        height: fileDimensionHeight.value,
      },
      cost: 'high',
      affectsGeometry: true,
    })

    addUserEvent('applyOperation', {
      tool: 'resize',
      settings: { width: fileDimensionWidth.value, height: fileDimensionHeight.value },
    })

    await renderUpTo(imageStore.renderPipeline.currentOpIndex + 1)

    historyStore.push(imageStore.getSnapshot(t))
  }

  return {
    fileDimensionWidth,
    fileDimensionHeight,
    maxFileDimensionWidth,
    maxFileDimensionHeight,
    isFileDimensionsLinked,
    FileDimensionWidthInputRef,
    FileDimensionHeightInputRef,
    updateFileDimension,
    applyResize,
    resetResize,
    canBeApplied,
  }
}
