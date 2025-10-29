import { ref, nextTick, watch } from 'vue'
import { useToastModal } from '../modals/useToastModal'
import { editorConfig } from '@/config/editorConfig'
import { useMath } from '../common/useMath'
import { PDFDocument } from 'pdf-lib'
import { useConfirmModal } from '../modals/useConfirmModal'
import { useConsole } from '@/composables/common/useConsole.js'
const { log, error } = useConsole()
import { useApi } from '@/composables/common/useApi'
const { addUserEvent } = useApi()

/**
 * Logic for the resize tool
 *
 * @param {ReturnType<typeof useImageStore>} imageStore - Image store instance
 * @param {ReturnType<typeof useHistoryStore>} historyStore - History store instance
 * @param {Function} t - Translation function
 * @returns {object} Resize tool bindings and methods
 */
export function useResizeTool(imageStore, historyStore, viewportStore, t) {
  const { showToastModal } = useToastModal()
  const { showConfirmModal } = useConfirmModal()

  const { round } = useMath()

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

    applyResize()
  }

  /**
   * Reset resize dimensions to original image dimensions
   */
  const resetResize = () => {
    fileDimensionWidth.value = imageStore.originalFileDimensions.width
    fileDimensionHeight.value = imageStore.originalFileDimensions.height
    isFileDimensionsLinked.value = true

    nextTick(() => {
      FileDimensionWidthInputRef.value?.setValue(fileDimensionWidth.value)
      FileDimensionHeightInputRef.value?.setValue(fileDimensionHeight.value)
    })

    applyResize()
  }

  /**
   * Apply the resize operation to the operation history and canvas
   */
  const applyResize = async () => {
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

    if (imageStore.needMergeOverlay) {
      const confirmed = await showConfirmModal(
        t('tools.confirmNeedOverlayMerge.title'),
        t('tools.confirmNeedOverlayMerge.message'),
        t('tools.confirmNeedOverlayMerge.cancel'),
        t('tools.confirmNeedOverlayMerge.confirm'),
      )
      if (confirmed) {
        imageStore.mergeOverlayIntoImage()
      } else {
        return
      }
    }

    if (imageStore.needMergeOverlay) {
      imageStore.mergeOverlayIntoImage()
      showToastModal(
        'info',
        t('tools.infoOverlayWasMerged.title'),
        t('tools.infoOverlayWasMerged.message'),
      )
    }

    imageStore.addImageOperation({
      type: 'resize',
      resizeDimensions: {
        width: fileDimensionWidth.value,
        height: fileDimensionHeight.value,
      },
    })

    addUserEvent('applyOperation', {
      tool: 'resize',
      settings: { width: fileDimensionWidth.value, height: fileDimensionHeight.value },
    })

    await applyResizeRender(fileDimensionWidth.value, fileDimensionHeight.value)

    historyStore.push(imageStore.getSnapshot(t))
  }

  /**
   * Resize the current canvas and update imageStore accordingly
   *
   * @param {number} width - Target width
   * @param {number} height - Target height
   */
  const applyResizeRender = async (width, height) => {
    if (width <= 0 || height <= 0) {
      showToastModal(
        'error',
        t('tools.transform.settings.resize.invalidResizeDimensions.title'),
        t('tools.transform.settings.resize.invalidResizeDimensions.message'),
      )
      return
    }

    // const oldImage = imageStore.getRenderedImage({ t, renderCall: false })
    const oldImage = imageStore.originalImage
    if (!oldImage) return

    if (imageStore.fileType === 'pdf' && imageStore.pdfPageBytes) {
      try {
        const existingPdf = await PDFDocument.load(imageStore.pdfPageBytes)
        const oldPage = existingPdf.getPage(0)

        // Create new pdf
        const newPdf = await PDFDocument.create()
        const newPage = newPdf.addPage([width, height])

        const [embeddedPage] = await newPdf.embedPages([oldPage])

        // Draw the embedded page onto the new page
        newPage.drawPage(embeddedPage, {
          x: 0,
          y: 0,
          width,
          height,
        })

        const pdfBytes = await newPdf.save()
        imageStore.pdfPageBytes = pdfBytes

        log(`PDF resized physically to ${width}x${height}`)
      } catch (e) {
        error('Error resizing PDF:', e)
      }
    }

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    canvas.width = width
    canvas.height = height

    ctx.drawImage(oldImage, 0, 0, width, height)

    imageStore.setRenderedImage(canvas)

    imageStore.fileDimensions = {
      width,
      height,
      fileAspectRatio: width / height || 1,
    }

    // Resize overlay svg objects
    if (imageStore.overlayImage) {
      const oldOverlay = imageStore.overlayImage
      const overlayCanvas = document.createElement('canvas')
      overlayCanvas.width = width
      overlayCanvas.height = height

      const overlayCtx = overlayCanvas.getContext('2d')
      overlayCtx.drawImage(oldOverlay, 0, 0, width, height)

      imageStore.overlayImage = overlayCanvas
      imageStore.overlayImageExport = overlayCanvas
      imageStore.overlayImagePreview = overlayCanvas
    }

    // Center image
    viewportStore.shouldFitToScreen = true
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
    applyResizeRender,
    resetResize,
  }
}
