import { useMath } from '@/composables/common/useMath'
import { computed, ref, nextTick, watch } from 'vue'
import { useConfirmModal } from '../modals/useConfirmModal'
import { useToastModal } from '../modals/useToastModal'

/**
 * Currently selected crop aspect ratio
 */
const cropRatio = ref(null)

/**
 * Reactive state of the crop box used for user interactions
 * @type {import('vue').Ref<{
 *   x: number,
 *   y: number,
 *   width: number,
 *   height: number,
 *   dragging: boolean,
 *   resizing: boolean,
 *   resizeDir: string,
 *   startX: number,
 *   startY: number
 * }>}
 */
const cropBox = ref({
  x: 0,
  y: 0,
  width: 100,
  height: 100,
  dragging: false,
  resizing: false,
  resizeDir: '',
  startX: 0,
  startY: 0,
})

/**
 * Logic for crop tool functionality, including crop box manipulation and position constraints
 *
 * @param {object} imageStore - Store containing image state and metadata
 * @param {object} viewportStore - Store managing viewport state
 * @param {object} editorStore - Store for currently selected tool/tab
 * @param {object} historyStore - Store for undo/redo history
 * @param {function} t - Translation function (vue-i18n)
 * @returns {object} Crop tool logic and reactive state
 */
export function useCropTool(imageStore, viewportStore, editorStore, historyStore, t) {
  const { showConfirmModal } = useConfirmModal()
  const { showToastModal } = useToastModal()
  const { clamp } = useMath()

  /**
   * Watch for changes in image dimensions and update crop box accordingly
   */
  watch(
    () => imageStore.fileDimensions,
    (fileDimensions) => {
      if (fileDimensions.width && fileDimensions.height) {
        cropBox.value.width = fileDimensions.width
        cropBox.value.height = fileDimensions.height
        cropBox.value.x = 0
        cropBox.value.y = 0
      }
    },
    { immediate: true, deep: true },
  )

  /**
   * Maximum allowed crop position based on image dimensions
   */
  const maxCropPositionX = computed(() => {
    return imageStore.fileDimensions.width - cropBox.value.width
  })
  const maxCropPositionY = computed(() => {
    return imageStore.fileDimensions.height - cropBox.value.height
  })

  /**
   * Position of the crop box relative to the image
   */
  const cropPositionX = computed({
    get: () => cropBox.value.x,
    set: (value) => {
      cropBox.value.x = Math.round(clamp(value, 0, maxCropPositionX.value))
    },
  })
  const cropPositionY = computed({
    get: () => cropBox.value.y,
    set: (value) => {
      cropBox.value.y = Math.round(clamp(value, 0, maxCropPositionY.value))
    },
  })

  /**
   * Ref for crop width and height input field (used for syncing external components)
   */
  const widthInputRef = ref(null)
  const heightInputRef = ref(null)

  /**
   * Ref for crop position inputs field
   */
  const positionXInputRef = ref(null)
  const positionYInputRef = ref(null)

  /**
   * Whether width and height should be linked to preserve aspect ratio
   */
  const isDimensionsLinked = ref(false)

  /**
   * Maximum crop width and height based on current image dimensions and position
   */
  const maxCropWidth = computed(() => {
    return imageStore.fileDimensions.width - cropBox.value.x
  })
  const maxCropHeight = computed(() => {
    return imageStore.fileDimensions.height - cropBox.value.y
  })

  /**
   * Computed properties for crop width and height with setters to update crop box
   */
  const cropWidth = computed({
    get: () => cropBox.value.width,
    set: (value) => {
      cropBox.value.width = Math.round(clamp(value, 0, maxCropWidth.value))
    },
  })
  const cropHeight = computed({
    get: () => cropBox.value.height,
    set: (value) => {
      cropBox.value.height = Math.round(clamp(value, 0, maxCropHeight.value))
    },
  })

  /**
   * Temporary refs to store crop width and height for syncing with external components
   */
  const tmpCropWidth = ref(cropBox.value.width)
  const tmpCropHeight = ref(cropBox.value.height)

  /**
   * Watch for changes in crop width and height to update temporary refs
   */
  watch(
    () => cropBox.value.width,
    (value) => {
      tmpCropWidth.value = value
    },
  )
  watch(
    () => cropBox.value.height,
    (value) => {
      tmpCropHeight.value = value
    },
  )

  /**
   * Update crop dimensions based on input values
   * @param {'width'|'height'} key - Dimension to update
   * @param {number} value - New dimension value
   */
  const updateDimension = (key, value) => {
    const originalWidth = cropBox.value.width
    const originalHeight = cropBox.value.height

    if (key === 'width') {
      const clampedWidth = Math.round(clamp(value, 0, maxCropWidth.value))

      // Crop ratio is set
      if (cropRatio.value !== null) {
        cropBox.value.width = clampedWidth
        cropBox.value.height = Math.round(
          clamp(clampedWidth / cropRatio.value, 0, maxCropHeight.value),
        )
        if (cropBox.value.height === maxCropHeight.value) {
          cropBox.value.width = cropBox.value.height
        }
      }
      // Dimensions are linked
      else if (isDimensionsLinked.value && originalWidth > 0) {
        const aspectRatio = originalHeight / originalWidth
        cropBox.value.width = clampedWidth
        cropBox.value.height = Math.round(clamp(clampedWidth * aspectRatio, 0, maxCropHeight.value))
      }
      // Free crop
      else {
        cropBox.value.width = clampedWidth
      }
    } else if (key === 'height') {
      const clampedHeight = Math.round(clamp(value, 0, maxCropHeight.value))

      if (cropRatio.value !== null) {
        cropBox.value.height = clampedHeight
        cropBox.value.width = Math.round(
          clamp(clampedHeight / cropRatio.value, 0, maxCropWidth.value),
        )
        if (cropBox.value.width === maxCropWidth.value) {
          cropBox.value.height = cropBox.value.width
        }
      }
      // Dimensions are linked
      else if (isDimensionsLinked.value && originalHeight > 0) {
        const aspectRatio = originalWidth / originalHeight
        cropBox.value.height = clampedHeight
        cropBox.value.width = Math.round(clamp(clampedHeight * aspectRatio, 0, maxCropWidth.value))
      }
      // Free crop
      else {
        cropBox.value.height = clampedHeight
      }
    }
    nextTick(() => {
      // heightInputRef.value.value = cropHeight.value
      heightInputRef.value.setValue(cropHeight.value)
      // widthInputRef.value.value = cropWidth.value
      widthInputRef.value.setValue(cropWidth.value)
    })
  }

  /**
   * Update crop position based on input values
   * @param {'x'|'y'} key - Position to update
   * @param {number} value - New position value
   */
  const updatePosition = (key, value) => {
    if (key === 'x') {
      cropBox.value.x = Math.round(clamp(value, 0, maxCropPositionX.value))
    } else if (key === 'y') {
      cropBox.value.y = Math.round(clamp(value, 0, maxCropPositionY.value))
    }
    nextTick(() => {
      positionXInputRef.value.setValue(cropPositionX.value)
      positionYInputRef.value.setValue(cropPositionY.value)
    })
  }

  /**
   * Start panning the crop box with middle mouse button
   * @param {MouseEvent} event - Mouse event
   */
  const startPan = (event) => {
    if (event.button !== 1) {
      event.preventDefault()
      cropBox.value.dragging = true
      cropBox.value.startX = event.clientX
      cropBox.value.startY = event.clientY

      const onMouseMove = (e) => {
        const dx = e.clientX - cropBox.value.startX
        const dy = e.clientY - cropBox.value.startY
        cropBox.value.x = Math.round(
          clamp(
            cropBox.value.x + dx / viewportStore.realZoomLevel,
            0,
            imageStore.fileDimensions.width - cropBox.value.width,
          ),
        )
        cropBox.value.y = Math.round(
          clamp(
            cropBox.value.y + dy / viewportStore.realZoomLevel,
            0,
            imageStore.fileDimensions.height - cropBox.value.height,
          ),
        )
        cropBox.value.startX = e.clientX
        cropBox.value.startY = e.clientY
      }

      const onMouseUp = () => {
        cropBox.value.dragging = false
        document.removeEventListener('mousemove', onMouseMove)
        document.removeEventListener('mouseup', onMouseUp)
      }

      document.addEventListener('mousemove', onMouseMove)
      document.addEventListener('mouseup', onMouseUp)
    }
  }

  /**
   * Start resizing the crop box from a specific direction
   * @param {MouseEvent} e - Mouse event
   * @param {'top'|'bottom'|'left'|'right'|'top-left'|'top-right'|'bottom-left'|'bottom-right'} direction - Resize direction
   */
  const startResize = (e, direction) => {
    e.preventDefault()
    e.stopPropagation()
    cropBox.value.resizing = true
    cropBox.value.resizeDir = direction
    cropBox.value.startX = e.clientX
    cropBox.value.startY = e.clientY

    // Ulož pôvodný pomer strán len raz
    let originalAspectRatio = cropBox.value.width / cropBox.value.height

    const onMouseMove = (ev) => {
      const dx = ev.clientX - cropBox.value.startX
      const dy = ev.clientY - cropBox.value.startY
      const dxNorm = dx / viewportStore.realZoomLevel
      const dyNorm = dy / viewportStore.realZoomLevel
      const isShiftPressed = ev.shiftKey

      const getActiveRatio = () => {
        if (cropRatio.value !== null) return cropRatio.value
        if (isShiftPressed) return originalAspectRatio
        return null
      }

      const ratio = getActiveRatio()

      if (direction.includes('right')) {
        if (ratio !== null) {
          const maxWidth = Math.min(
            imageStore.fileDimensions.width - cropBox.value.x,
            (imageStore.fileDimensions.height - cropBox.value.y) * ratio,
          )
          const newWidth = clamp(cropBox.value.width + dxNorm, 0, maxWidth)
          cropBox.value.width = Math.round(newWidth)
          cropBox.value.height = Math.round(newWidth / ratio)
        } else {
          cropBox.value.width = Math.round(
            clamp(
              cropBox.value.width + dxNorm,
              0,
              imageStore.fileDimensions.width - cropBox.value.x,
            ),
          )
        }
      }

      if (direction.includes('left')) {
        if (ratio !== null) {
          const newWidth = clamp(
            cropBox.value.width - dxNorm,
            0,
            Math.min(
              cropBox.value.x + cropBox.value.width,
              (imageStore.fileDimensions.height - cropBox.value.y) * ratio,
            ),
          )
          const newHeight = newWidth / ratio
          const maxX = cropBox.value.x + cropBox.value.width

          cropBox.value.width = Math.round(newWidth)
          cropBox.value.height = Math.round(newHeight)
          cropBox.value.x = Math.round(
            clamp(maxX - cropBox.value.width, 0, imageStore.fileDimensions.width),
          )
        } else {
          if (cropBox.value.width > 0) {
            cropBox.value.x = Math.round(
              clamp(
                cropBox.value.x + dxNorm,
                0,
                imageStore.fileDimensions.width - cropBox.value.width,
              ),
            )
          }
          if (cropBox.value.x > 0 || dx > 0) {
            cropBox.value.width = Math.round(
              clamp(
                cropBox.value.width - dxNorm,
                0,
                imageStore.fileDimensions.width - cropBox.value.x,
              ),
            )
          }
        }
      }

      if (direction.includes('bottom')) {
        if (ratio !== null) {
          const maxHeight = Math.min(
            imageStore.fileDimensions.height - cropBox.value.y,
            (imageStore.fileDimensions.width - cropBox.value.x) / ratio,
          )
          const newHeight = clamp(cropBox.value.height + dyNorm, 0, maxHeight)
          cropBox.value.height = Math.round(newHeight)
          cropBox.value.width = Math.round(newHeight * ratio)
        } else {
          cropBox.value.height = Math.round(
            clamp(
              cropBox.value.height + dyNorm,
              0,
              imageStore.fileDimensions.height - cropBox.value.y,
            ),
          )
        }
      }

      if (direction.includes('top')) {
        if (ratio !== null) {
          const newHeight = clamp(
            cropBox.value.height - dyNorm,
            0,
            Math.min(
              cropBox.value.y + cropBox.value.height,
              (imageStore.fileDimensions.width - cropBox.value.x) / ratio,
            ),
          )
          const newWidth = newHeight * ratio
          const maxY = cropBox.value.y + cropBox.value.height

          cropBox.value.height = Math.round(newHeight)
          cropBox.value.width = Math.round(newWidth)
          cropBox.value.y = Math.round(
            clamp(maxY - cropBox.value.height, 0, imageStore.fileDimensions.height),
          )
        } else {
          if (cropBox.value.height > 0) {
            cropBox.value.y = Math.round(
              clamp(
                cropBox.value.y + dyNorm,
                0,
                imageStore.fileDimensions.height - cropBox.value.height,
              ),
            )
          }
          if (cropBox.value.y > 0 || dy > 0) {
            cropBox.value.height = Math.round(
              clamp(
                cropBox.value.height - dyNorm,
                0,
                imageStore.fileDimensions.height - cropBox.value.y,
              ),
            )
          }
        }
      }

      cropBox.value.startX = ev.clientX
      cropBox.value.startY = ev.clientY
    }

    const onMouseUp = () => {
      cropBox.value.resizing = false
      cropBox.value.resizeDir = ''
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }

  /**
   * Select a type of crop tool
   * @param {string} subTool - Sub tool key to select
   */
  const selectSubTool = (subTool) => {
    editorStore.selectSubTool(subTool)
    cropBox.value.x = 0
    cropBox.value.y = 0

    const { width: fileWidth, height: fileHeight } = imageStore.fileDimensions

    let cropWidth = fileWidth
    let cropHeight = fileHeight

    switch (subTool) {
      case 'cropFree':
        cropRatio.value = null
        cropBox.value.width = fileWidth
        cropBox.value.height = fileHeight
        break

      case 'crop11':
        cropRatio.value = 1
        if (fileWidth >= fileHeight) {
          cropHeight = fileHeight
          cropWidth = fileHeight
        } else {
          cropWidth = fileWidth
          cropHeight = fileWidth
        }
        break

      case 'crop43':
        cropRatio.value = 4 / 3
        if (fileWidth / fileHeight >= cropRatio.value) {
          cropHeight = fileHeight
          cropWidth = fileHeight * cropRatio.value
        } else {
          cropWidth = fileWidth
          cropHeight = fileWidth / cropRatio.value
        }
        break

      case 'crop34':
        cropRatio.value = 3 / 4
        if (fileWidth / fileHeight >= cropRatio.value) {
          cropHeight = fileHeight
          cropWidth = fileHeight * cropRatio.value
        } else {
          cropWidth = fileWidth
          cropHeight = fileWidth / cropRatio.value
        }
        break

      case 'crop169':
        cropRatio.value = 16 / 9
        if (fileWidth / fileHeight >= cropRatio.value) {
          cropHeight = fileHeight
          cropWidth = fileHeight * cropRatio.value
        } else {
          cropWidth = fileWidth
          cropHeight = fileWidth / cropRatio.value
        }
        break

      case 'crop916':
        cropRatio.value = 9 / 16
        if (fileWidth / fileHeight >= cropRatio.value) {
          cropHeight = fileHeight
          cropWidth = fileHeight * cropRatio.value
        } else {
          cropWidth = fileWidth
          cropHeight = fileWidth / cropRatio.value
        }
        break
    }

    // Set crop box dimensions
    cropBox.value.width = Math.round(cropWidth)
    cropBox.value.height = Math.round(cropHeight)

    // Set crop box position to center
    cropBox.value.x = Math.round((fileWidth - cropBox.value.width) / 2)
    cropBox.value.y = Math.round((fileHeight - cropBox.value.height) / 2)
  }

  /**
   * Apply the crop operation
   */
  const applyCrop = async () => {
    // Check if crop box is same as image dimensions
    if (
      cropBox.value.x === 0 &&
      cropBox.value.y === 0 &&
      cropBox.value.width === imageStore.fileDimensions.width &&
      cropBox.value.height === imageStore.fileDimensions.height
    ) {
      showToastModal(
        'info',
        t('tools.transform.settings.crop.cropBoxIsSameAsOriginalImage.title'),
        t('tools.transform.settings.crop.cropBoxIsSameAsOriginalImage.message'),
      )
      return
    }

    if (imageStore.svgObjects.length > 0) {
      const confirmed = await showConfirmModal(
        t('tools.confirmNeedRasterization.title'),
        t('tools.confirmNeedRasterization.message'),
        t('tools.confirmNeedRasterization.cancel'),
        t('tools.confirmNeedRasterization.confirm'),
      )
      if (!confirmed) return

      await imageStore.rasterize(t)
    }

    imageStore.addImageOperation({
      type: 'crop',
      cropBox: { ...cropBox.value },
    })

    applyCropRender(cropBox.value)

    historyStore.push(imageStore.getSnapshot(t))
  }

  /**
   * Apply the crop operation to the rendered image
   * @param {Object} cropBox - Crop box dimensions
   */
  const applyCropRender = (cropBox) => {
    if (!imageStore.getRenderedImage({ t, renderCall: false }) || !cropBox) return

    const { x, y, width, height } = cropBox

    // Check if crop box is same as image dimensions
    if (
      x === 0 &&
      y === 0 &&
      width === imageStore.fileDimensions.width &&
      height === imageStore.fileDimensions.height
    ) {
      showToastModal(
        'info',
        t('tools.transform.settings.crop.cropBoxIsSameAsOriginalImage.title'),
        t('tools.transform.settings.crop.cropBoxIsSameAsOriginalImage.message'),
      )
      return
    }

    // Check if crop box is valid
    if (
      x < 0 ||
      y < 0 ||
      width <= 0 ||
      height <= 0 ||
      x + width > imageStore.fileDimensions.width ||
      y + height > imageStore.fileDimensions.height
    ) {
      showToastModal(
        'warning',
        t('tools.transform.settings.crop.invalidCropBox.title'),
        t('tools.transform.settings.crop.invalidCropBox.message'),
      )
      return
    }

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    canvas.width = width
    canvas.height = height

    ctx.drawImage(
      imageStore.getRenderedImage({ t, renderCall: false }),
      x,
      y,
      width,
      height, // Source region
      0,
      0,
      width,
      height, // Destination canvas
    )

    // Update rendered image and preview URL
    imageStore.setRenderedImage(canvas)

    // Update file dimensions
    imageStore.fileDimensions.width = width
    imageStore.fileDimensions.height = height
    imageStore.fileDimensions.fileAspectRatio = width / height || 1

    imageStore.newFileDimensions = { ...imageStore.fileDimensions }
  }

  return {
    startPan,
    startResize,
    cropWidth,
    maxCropWidth,
    widthInputRef,
    tmpCropWidth,
    cropHeight,
    maxCropHeight,
    heightInputRef,
    tmpCropHeight,
    updateDimension,
    isDimensionsLinked,
    cropPositionX,
    cropPositionY,
    maxCropPositionX,
    maxCropPositionY,
    updatePosition,
    positionXInputRef,
    positionYInputRef,
    selectSubTool,
    cropRatio,
    cropBox,
    applyCrop,
    applyCropRender,
  }
}
