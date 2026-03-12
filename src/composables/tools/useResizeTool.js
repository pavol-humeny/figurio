/**
 * @file: useResizeTool.js
 * @author: Pavol Humeny
 * @date: 15.5.2026
 */
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
   * Maximum and minimum allowed image width and height based on editor config
   */
  const maxFileDimensionWidth = ref(editorConfig.maxFileDimensionWidth)
  const maxFileDimensionHeight = ref(editorConfig.maxFileDimensionHeight)

  const minFileDimensionWidth = ref(editorConfig.minCropSize)
  const minFileDimensionHeight = ref(editorConfig.minCropSize)

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
  let originalAspectRatio = imageStore.fileDimensions.width / imageStore.fileDimensions.height || 1

  /**
   * Reference to the width and height input component
   */
  const FileDimensionWidthInputRef = ref(null)
  const FileDimensionHeightInputRef = ref(null)

  /**
   * Effective maximum and minimum dimensions when aspect ratio is locked
   */
  const effectiveMaxWidth = computed(() => {
    if (!isFileDimensionsLinked.value) {
      return maxFileDimensionWidth.value
    }

    return Math.floor(
      Math.min(maxFileDimensionWidth.value, maxFileDimensionHeight.value * originalAspectRatio),
    )
  })

  const effectiveMaxHeight = computed(() => {
    if (!isFileDimensionsLinked.value) {
      return maxFileDimensionHeight.value
    }

    return Math.floor(
      Math.min(maxFileDimensionHeight.value, maxFileDimensionWidth.value / originalAspectRatio),
    )
  })

  const effectiveMinWidth = computed(() => {
    if (!isFileDimensionsLinked.value) {
      return minFileDimensionWidth.value
    }

    return Math.ceil(
      Math.max(minFileDimensionWidth.value, minFileDimensionHeight.value * originalAspectRatio),
    )
  })

  const effectiveMinHeight = computed(() => {
    if (!isFileDimensionsLinked.value) {
      return minFileDimensionHeight.value
    }

    return Math.ceil(
      Math.max(minFileDimensionHeight.value, minFileDimensionWidth.value / originalAspectRatio),
    )
  })

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
   * Whether the resize can be reset to original dimensions
   */
  const canBeReset = computed(() => {
    return (
      imageStore.fileDimensions.width !== imageStore.originalFileDimensions.width ||
      imageStore.fileDimensions.height !== imageStore.originalFileDimensions.height
    )
  })

  /**
   * Whether to suppress automatic resize reset on image changes when applying rasterization
   */
  const suppressResizeReset = ref(false)

  /**
   * Watch for changes in file dimensions and update inputs accordingly
   */
  watch(
    () => imageStore.fileDimensions,
    (newVal) => {
      if (suppressResizeReset.value) return

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
   * Watch for changes in linked dimensions and adjust size accordingly
   */
  watch(isFileDimensionsLinked, (linked) => {
    if (!linked) return

    let width = fileDimensionWidth.value
    let height = fileDimensionHeight.value

    if (width > effectiveMaxWidth.value) {
      width = effectiveMaxWidth.value
      height = round(width / originalAspectRatio)
    }

    if (height > effectiveMaxHeight.value) {
      height = effectiveMaxHeight.value
      width = round(height * originalAspectRatio)
    }

    if (width < effectiveMinWidth.value) {
      width = effectiveMinWidth.value
      height = round(width / originalAspectRatio)
    }

    if (height < effectiveMinHeight.value) {
      height = effectiveMinHeight.value
      width = round(height * originalAspectRatio)
    }

    fileDimensionWidth.value = width
    fileDimensionHeight.value = height

    nextTick(() => {
      FileDimensionWidthInputRef.value?.setValue(width)
      FileDimensionHeightInputRef.value?.setValue(height)
    })
  })

  /**
   * Update dimension input values, respecting aspect ratio if enabled
   *
   * @param {'width'|'height'} key - Dimension to update
   * @param {number} value - New dimension value
   */
  const updateFileDimension = (key, value) => {
    if (isUpdatingFromStore.value) return
    if (isNaN(value)) return

    if (key === 'width') {
      value = Math.min(Math.max(value, effectiveMinWidth.value), effectiveMaxWidth.value)

      fileDimensionWidth.value = value

      if (isFileDimensionsLinked.value) {
        fileDimensionHeight.value = Math.min(
          Math.max(round(value / originalAspectRatio), effectiveMinHeight.value),
          effectiveMaxHeight.value,
        )
      }
    }

    if (key === 'height') {
      value = Math.min(Math.max(value, effectiveMinHeight.value), effectiveMaxHeight.value)

      fileDimensionHeight.value = value

      if (isFileDimensionsLinked.value) {
        fileDimensionWidth.value = Math.min(
          Math.max(round(value * originalAspectRatio), effectiveMinWidth.value),
          effectiveMaxWidth.value,
        )
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
  const resetResize = async () => {
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

    // Apply the reset resize immediately
    await applyResize()
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
        // Register operation in the operation list
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

        suppressResizeReset.value = true

        await renderUpTo(imageStore.renderPipeline.currentOpIndex + 1, { t, imageStore })

        // Push to undo history
        historyStore.push(imageStore.getSnapshot(t))

        suppressResizeReset.value = false
      } else {
        return
      }
    }

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

    await renderUpTo(imageStore.renderPipeline.currentOpIndex + 1, { t, imageStore })

    historyStore.push(imageStore.getSnapshot(t))

    // Center image after resize
    viewportStore.shouldFitToScreen = true
  }

  return {
    fileDimensionWidth,
    fileDimensionHeight,
    maxFileDimensionWidth,
    maxFileDimensionHeight,
    minFileDimensionWidth,
    minFileDimensionHeight,
    isFileDimensionsLinked,
    FileDimensionWidthInputRef,
    FileDimensionHeightInputRef,
    updateFileDimension,
    applyResize,
    resetResize,
    canBeApplied,
    canBeReset,
  }
}
