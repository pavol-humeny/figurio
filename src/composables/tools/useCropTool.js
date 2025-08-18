import { useMath } from '@/composables/common/useMath'
import { computed, ref, nextTick, watch } from 'vue'
import { useConfirmModal } from '../modals/useConfirmModal'
import { useToastModal } from '../modals/useToastModal'

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
  const { clamp, round } = useMath()

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
  const isDimensionsLinked = ref(true)

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

      // Dimensions are linked
      if (isDimensionsLinked.value && originalWidth > 0) {
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

      // Dimensions are linked
      if (isDimensionsLinked.value && originalHeight > 0) {
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

    const onMouseMove = (ev) => {
      const dx = ev.clientX - cropBox.value.startX
      const dy = ev.clientY - cropBox.value.startY
      const dxNorm = dx / viewportStore.realZoomLevel
      const dyNorm = dy / viewportStore.realZoomLevel

      if (direction.includes('right')) {
        let newWidth = cropBox.value.width + dxNorm
        let newX = cropBox.value.x

        // If cropBox goes out of bounds
        if (newX + newWidth > imageStore.fileDimensions.width) {
          newWidth = imageStore.fileDimensions.width - newX
        }

        cropBox.value.width = round(clamp(newWidth, 0, imageStore.fileDimensions.width - newX))
      }

      if (direction.includes('left')) {
        const maxX = cropBox.value.x + cropBox.value.width
        let newX = cropBox.value.x + dxNorm
        let newWidth = cropBox.value.width - dxNorm

        // If cropBox goes out of bounds
        if (newX < 0) {
          newWidth += newX
          newX = 0
        }

        cropBox.value.x = round(clamp(newX, 0, maxX))
        cropBox.value.width = round(
          clamp(newWidth, 0, imageStore.fileDimensions.width - cropBox.value.x),
        )
      }

      if (direction.includes('bottom')) {
        let newHeight = cropBox.value.height + dyNorm
        let newY = cropBox.value.y

        // If cropBox goes out of bounds
        if (newY + newHeight > imageStore.fileDimensions.height) {
          newHeight = imageStore.fileDimensions.height - newY
        }

        cropBox.value.height = round(clamp(newHeight, 0, imageStore.fileDimensions.height - newY))
      }

      if (direction.includes('top')) {
        const maxY = cropBox.value.y + cropBox.value.height
        let newY = cropBox.value.y + dyNorm
        let newHeight = cropBox.value.height - dyNorm

        // If cropBox goes out of bounds
        if (newY < 0) {
          newHeight += newY
          newY = 0
        }

        cropBox.value.y = Math.round(clamp(newY, 0, maxY))
        cropBox.value.height = Math.round(
          clamp(newHeight, 0, imageStore.fileDimensions.height - cropBox.value.y),
        )
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
    cropBox,
    applyCrop,
    applyCropRender,
  }
}
