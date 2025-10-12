import { useMath } from '@/composables/common/useMath'
import { computed, ref, nextTick, watch, onBeforeUnmount } from 'vue'
import { useConfirmModal } from '../modals/useConfirmModal'
import { useToastModal } from '../modals/useToastModal'
import { editorConfig } from '@/config/editorConfig'

import { PDFDocument } from 'pdf-lib'

import { useSendEvent } from '@/composables/common/useSendEvent'

/**
 * Detected background color
 */
const detectedBgColor = ref(null)

/**
 * Cached histogram
 */
const cachedHistogram = ref(null)

/**
 * Cached threshold
 */
const cachedThreshold = ref(null)

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
  width: 0,
  height: 0,
  dragging: false,
  resizing: false,
  resizeDir: '',
  startX: 0,
  startY: 0,
})

/**
 * Manual indents for the crop box
 */
const manualIndents = ref({
  topIndent: 0,
  rightIndent: 0,
  bottomIndent: 0,
  leftIndent: 0,

  topIndentMin: 0,
  topIndentMax: Infinity,
  rightIndentMin: 0,
  rightIndentMax: Infinity,
  bottomIndentMin: 0,
  bottomIndentMax: Infinity,
  leftIndentMin: 0,
  leftIndentMax: Infinity,
})

const lastCannyCrop = ref({
  x: 0,
  y: 0,
  width: 0,
  height: 0,
})

/**
 * Logic for crop tool functionality, including crop box manipulation and position constraints
 *
 * @param {object} imageStore - Store containing image state and metadata
 * @param {object} viewportStore - Store managing viewport state
 * @param {object} editorStore - Store for currently selected tool/tab
 * @param {object} historyStore - Store for undo/redo history
 * @param {object} workspaceStore - Store for workspace state
 * @param {function} t - Translation function (vue-i18n)
 * @returns {object} Crop tool logic and reactive state
 */
export function useCropTool(
  imageStore,
  viewportStore,
  editorStore,
  historyStore,
  workspaceStore,
  t,
) {
  const { showConfirmModal } = useConfirmModal()
  const { showToastModal } = useToastModal()
  const { clamp, round } = useMath()

  /**
   * Update last canny crop to current crop box
   */
  const updateLastCannyCrop = () => {
    lastCannyCrop.value.width = cropBox.value.width
    lastCannyCrop.value.height = cropBox.value.height
    lastCannyCrop.value.x = cropBox.value.x
    lastCannyCrop.value.y = cropBox.value.y
  }

  /**
   * Whether the fit crop was already applied
   */
  const fitCropApplied = ref(false)

  // -------------------------------
  // Manual crop
  // -------------------------------

  /**
   * Whether the manual adjustments are linked (all sides change together)
   */
  const isManualAdjustmentsLinked = ref(false)

  /**
   * Old manual indents for comparison when one is changed
   */
  const oldManualIndents = ref({ ...manualIndents.value })

  /**
   * Update all indents if they are linked and one was changed
   */
  const manualIndentsWereChangedManually = () => {
    // If is isManualAdjustmentsLinked, update all indents
    if (isManualAdjustmentsLinked.value) {
      // Find which indent was changed
      let changedIndent = { name: null, value: 0 }
      if (manualIndents.value.topIndent > oldManualIndents.value.topIndent) {
        changedIndent = { name: 'topIndent', value: 1 }
      } else if (manualIndents.value.topIndent < oldManualIndents.value.topIndent) {
        changedIndent = { name: 'topIndent', value: -1 }
      } else if (manualIndents.value.rightIndent > oldManualIndents.value.rightIndent) {
        changedIndent = { name: 'rightIndent', value: 1 }
      } else if (manualIndents.value.rightIndent < oldManualIndents.value.rightIndent) {
        changedIndent = { name: 'rightIndent', value: -1 }
      } else if (manualIndents.value.bottomIndent > oldManualIndents.value.bottomIndent) {
        changedIndent = { name: 'bottomIndent', value: 1 }
      } else if (manualIndents.value.bottomIndent < oldManualIndents.value.bottomIndent) {
        changedIndent = { name: 'bottomIndent', value: -1 }
      } else if (manualIndents.value.leftIndent > oldManualIndents.value.leftIndent) {
        changedIndent = { name: 'leftIndent', value: 1 }
      } else if (manualIndents.value.leftIndent < oldManualIndents.value.leftIndent) {
        changedIndent = { name: 'leftIndent', value: -1 }
      }

      if (changedIndent.name === 'topIndent') {
        manualIndents.value.rightIndent += changedIndent.value
        manualIndents.value.bottomIndent += changedIndent.value
        manualIndents.value.leftIndent += changedIndent.value
      } else if (changedIndent.name === 'rightIndent') {
        manualIndents.value.topIndent += changedIndent.value
        manualIndents.value.bottomIndent += changedIndent.value
        manualIndents.value.leftIndent += changedIndent.value
      } else if (changedIndent.name === 'bottomIndent') {
        manualIndents.value.topIndent += changedIndent.value
        manualIndents.value.rightIndent += changedIndent.value
        manualIndents.value.leftIndent += changedIndent.value
      } else if (changedIndent.name === 'leftIndent') {
        manualIndents.value.topIndent += changedIndent.value
        manualIndents.value.rightIndent += changedIndent.value
        manualIndents.value.bottomIndent += changedIndent.value
      }

      oldManualIndents.value = { ...manualIndents.value }
    }

    updateLastCannyCrop()
  }

  /**
   * Watch for changes in manualIndents and recalculate cropBox
   */
  watch(
    manualIndents,
    (newIndents) => {
      cropBox.value.x = newIndents.leftIndent
      cropBox.value.y = newIndents.topIndent
      cropBox.value.width =
        imageStore.fileDimensions.width - newIndents.rightIndent - newIndents.leftIndent
      cropBox.value.height =
        imageStore.fileDimensions.height - newIndents.bottomIndent - newIndents.topIndent
    },
    { deep: true },
  )

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

        fitCropApplied.value = false

        // Set max for indents
        manualIndents.value.topIndentMax = fileDimensions.height
        manualIndents.value.rightIndentMax = fileDimensions.width
        manualIndents.value.bottomIndentMax = fileDimensions.height
        manualIndents.value.leftIndentMax = fileDimensions.width

        // Last canny crop reset
        updateLastCannyCrop()
      }
    },
    { immediate: true, deep: true },
  )

  /**
   * Maximum allowed crop position based on image dimensions
   */
  const maxCropPositionX = computed(() => {
    return imageStore.fileDimensions.width
  })
  const maxCropPositionY = computed(() => {
    return imageStore.fileDimensions.height
  })

  /**
   * Position of the crop box relative to the image
   */
  const cropPositionX = computed({
    get: () => cropBox.value.x,
    set: (value) => {
      cropBox.value.x = round(clamp(value, 0, maxCropPositionX.value))
    },
  })
  const cropPositionY = computed({
    get: () => cropBox.value.y,
    set: (value) => {
      cropBox.value.y = round(clamp(value, 0, maxCropPositionY.value))
    },
  })

  /**
   * Temporary refs to store crop x and y for syncing with external components
   */
  const tmpCropX = ref(cropBox.value.x)
  const tmpCropY = ref(cropBox.value.y)

  /**
   * Watch for changes in crop x and y to update temporary refs
   */
  watch(
    () => cropBox.value.x,
    (value) => {
      tmpCropX.value = value
    },
  )
  watch(
    () => cropBox.value.y,
    (value) => {
      tmpCropY.value = value
    },
  )

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
      cropBox.value.width = round(clamp(value, 0, maxCropWidth.value))
    },
  })
  const cropHeight = computed({
    get: () => cropBox.value.height,
    set: (value) => {
      cropBox.value.height = round(clamp(value, 0, maxCropHeight.value))
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
    const minCropSize = editorConfig.minCropSize
    const originalWidth = cropBox.value.width
    const originalHeight = cropBox.value.height

    if (key === 'width') {
      const clampedWidth = round(clamp(value, minCropSize, maxCropWidth.value))

      // Dimensions are linked
      if (isDimensionsLinked.value && originalWidth > 0) {
        const aspectRatio = originalHeight / originalWidth
        cropBox.value.width = clampedWidth
        cropBox.value.height = round(
          clamp(clampedWidth * aspectRatio, minCropSize, maxCropHeight.value),
        )
      }
      // Free crop
      else {
        cropBox.value.width = clampedWidth
      }
    } else if (key === 'height') {
      const clampedHeight = round(clamp(value, minCropSize, maxCropHeight.value))

      // Dimensions are linked
      if (isDimensionsLinked.value && originalHeight > 0) {
        const aspectRatio = originalWidth / originalHeight
        cropBox.value.height = clampedHeight
        cropBox.value.width = round(
          clamp(clampedHeight * aspectRatio, minCropSize, maxCropWidth.value),
        )
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

    updateLastCannyCrop()
  }

  /**
   * Update crop position based on input values
   * @param {'x'|'y'} key - Position to update
   * @param {number} value - New position value
   */
  const updatePosition = (key, value) => {
    if (key === 'x') {
      cropBox.value.x = round(clamp(value, 0, maxCropPositionX.value))
      if (cropBox.value.x + cropBox.value.width > imageStore.fileDimensions.width) {
        cropBox.value.width = imageStore.fileDimensions.width - cropBox.value.x
      }
    } else if (key === 'y') {
      cropBox.value.y = round(clamp(value, 0, maxCropPositionY.value))
      if (cropBox.value.y + cropBox.value.height > imageStore.fileDimensions.height) {
        cropBox.value.height = imageStore.fileDimensions.height - cropBox.value.y
      }
    }
    nextTick(() => {
      positionXInputRef.value.setValue(cropPositionX.value)
      positionYInputRef.value.setValue(cropPositionY.value)
    })

    updateLastCannyCrop()
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

      let remainingDx = 0
      let remainingDy = 0

      const onMouseMove = (e) => {
        // Compute raw delta + remaining for smooth movement
        let rawDx = (e.clientX - cropBox.value.startX) / viewportStore.realZoomLevel + remainingDx
        let rawDy = (e.clientY - cropBox.value.startY) / viewportStore.realZoomLevel + remainingDy

        // Round to whole pixels
        const dx = Math.round(rawDx)
        const dy = Math.round(rawDy)

        // Save remaining for next move
        remainingDx = rawDx - dx
        remainingDy = rawDy - dy

        cropBox.value.x = clamp(
          cropBox.value.x + dx,
          0,
          imageStore.fileDimensions.width - cropBox.value.width,
        )

        cropBox.value.y = clamp(
          cropBox.value.y + dy,
          0,
          imageStore.fileDimensions.height - cropBox.value.height,
        )

        cropBox.value.startX = e.clientX
        cropBox.value.startY = e.clientY
      }

      const onMouseUp = () => {
        cropBox.value.dragging = false

        // Round crop box
        cropBox.value.x = round(cropBox.value.x)
        cropBox.value.y = round(cropBox.value.y)

        document.removeEventListener('mousemove', onMouseMove)
        document.removeEventListener('mouseup', onMouseUp)

        resetCache()

        updateLastCannyCrop()
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

    let remainingDx = 0
    let remainingDy = 0

    const onMouseMove = (ev) => {
      const dx = (ev.clientX - cropBox.value.startX) / viewportStore.realZoomLevel + remainingDx
      const dy = (ev.clientY - cropBox.value.startY) / viewportStore.realZoomLevel + remainingDy

      // Round to whole pixels
      const dxNorm = Math.round(dx)
      const dyNorm = Math.round(dy)

      // Save remaining values for smooth dragging
      remainingDx = dx - dxNorm
      remainingDy = dy - dyNorm

      const minValue = editorConfig.minCropSize

      if (direction.includes('right')) {
        let newWidth = cropBox.value.width + dxNorm
        let newX = cropBox.value.x

        // If cropBox goes out of bounds
        if (newX + newWidth > imageStore.fileDimensions.width) {
          newWidth = imageStore.fileDimensions.width - newX
        }

        cropBox.value.width = clamp(newWidth, minValue, imageStore.fileDimensions.width - newX)
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

        // If minimum width is reached
        if (newWidth <= minValue) {
          newX = maxX - minValue
          newWidth = minValue
        }

        cropBox.value.x = clamp(newX, 0, maxX)
        cropBox.value.width = clamp(
          newWidth,
          minValue,
          imageStore.fileDimensions.width - cropBox.value.x,
        )
      }

      if (direction.includes('bottom')) {
        let newHeight = cropBox.value.height + dyNorm
        let newY = cropBox.value.y

        // If cropBox goes out of bounds
        if (newY + newHeight > imageStore.fileDimensions.height) {
          newHeight = imageStore.fileDimensions.height - newY
        }

        cropBox.value.height = clamp(newHeight, minValue, imageStore.fileDimensions.height - newY)
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

        // If minimum height is reached
        if (newHeight <= minValue) {
          newY = maxY - minValue
          newHeight = minValue
        }

        cropBox.value.y = clamp(newY, 0, maxY)
        cropBox.value.height = clamp(
          newHeight,
          minValue,
          imageStore.fileDimensions.height - cropBox.value.y,
        )
      }

      cropBox.value.startX = ev.clientX
      cropBox.value.startY = ev.clientY
    }

    const onMouseUp = () => {
      cropBox.value.resizing = false
      cropBox.value.resizeDir = ''

      // Round crop box
      cropBox.value.x = round(cropBox.value.x)
      cropBox.value.y = round(cropBox.value.y)
      cropBox.value.width = round(cropBox.value.width)
      cropBox.value.height = round(cropBox.value.height)

      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)

      resetCache()

      updateLastCannyCrop()
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }

  // -------------------------------
  // Auto crop
  // -------------------------------

  /**
   * Threshold for auto cropping
   */
  const autoCropThreshold = ref(editorConfig.autoCropThreshold)
  const autoCropThresholdWasChanged = ref(false)

  watch(autoCropThreshold, () => {
    autoCropThresholdWasChanged.value = true
  })

  /**
   * Options for the auto crop threshold dropdown
   */
  const autoCropThresholdOptions = [
    '0',
    '0,1',
    '0,2',
    '0,3',
    '0,4',
    '0,5',
    '0,6',
    '0,7',
    '0,8',
    '0,9',
  ]

  /**
   * Watch the auto crop threshold and update artifacts visibility
   */
  watch(autoCropThreshold, (newValue) => {
    resetCache()
    if (newValue > 0) {
      if (isArtifactsVisible.value) {
        hideArtifacts()
        showArtifacts()
      }
    } else {
      if (isArtifactsVisible.value) {
        hideArtifacts()
      }
    }
  })

  /**
   * Whether to apply auto crop from base image or current crop
   */
  const useBaseImage = ref(false)

  watch(useBaseImage, () => {
    resetCache()
  })

  /**
   * Watch crop box and recalculate indents
   */
  watch(
    cropBox,
    (newCropBox) => {
      manualIndents.value.topIndent = round(newCropBox.y)
      manualIndents.value.rightIndent =
        imageStore.fileDimensions.width - round(newCropBox.x + newCropBox.width)
      manualIndents.value.bottomIndent =
        imageStore.fileDimensions.height - round(newCropBox.y + newCropBox.height)
      manualIndents.value.leftIndent = round(newCropBox.x)

      // Change max indents
      manualIndents.value.topIndentMax = newCropBox.y + newCropBox.height
      manualIndents.value.rightIndentMax = imageStore.fileDimensions.width - newCropBox.x
      manualIndents.value.bottomIndentMax = imageStore.fileDimensions.height - newCropBox.y
      manualIndents.value.leftIndentMax = newCropBox.x + newCropBox.width
    },
    {
      deep: true,
    },
  )

  /**
   * Watch indents and recalculate cropBox
   */
  const recalculateCropBox = () => {
    cropBox.value.x = manualIndents.value.leftIndent
    cropBox.value.y = manualIndents.value.topIndent
    cropBox.value.width =
      imageStore.fileDimensions.width -
      manualIndents.value.leftIndent -
      manualIndents.value.rightIndent
    cropBox.value.height =
      imageStore.fileDimensions.height -
      manualIndents.value.topIndent -
      manualIndents.value.bottomIndent
  }

  // -------------------------------
  // Auto crop
  // -------------------------------
  /**
   * Detects the background from the edges (can be transparent)
   * @param {Uint8ClampedArray} data - The image data array.
   * @param {number} width - The width of the image.
   * @param {number} height - The height of the image.
   * @returns {Object} - The detected background color as an RGB object.
   */
  const guessBackgroundColor = (data, width, height) => {
    const counts = {}
    const addPixel = (i) => {
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]
      const a = data[i + 3]
      const key = `${r},${g},${b},${a}`
      counts[key] = (counts[key] || 0) + 1
    }

    // top + bottom
    for (let x = 0; x < width; x++) {
      addPixel((0 * width + x) * 4)
      addPixel(((height - 1) * width + x) * 4)
    }
    // left + right
    for (let y = 0; y < height; y++) {
      addPixel((y * width + 0) * 4)
      addPixel((y * width + (width - 1)) * 4)
    }

    // The most frequent color
    let picked = Object.keys(counts).reduce((a, b) => (counts[a] > counts[b] ? a : b))
    const [r, g, b, a] = picked.split(',').map(Number)
    return { r, g, b, a }
  }

  /**
   * Check if the pixel color matches the target color within a threshold.
   * @param {number} index - The pixel index in the image data.
   * @param {Object} target - The target color object with r, g, b, a properties.
   * @param {number} threshold - The color matching threshold.
   * @param {Uint8ClampedArray} imageData - The image data array.
   * @returns {boolean} - True if the pixel color matches the target color, false otherwise.
   */

  const trimmedSides = { left: false, right: false, top: false, bottom: false }

  /* global cv */
  /**
   * Calculate the auto crop box with edge smoothing to reduce noise at borders.
   * Uses Canny + filled contours + adaptive edge trimming.
   * @param {boolean} useBaseImage - Whether to mask with previous crop
   * @param {number} sensitivity - higher = more aggressive trimming
   * @returns {Object|null} cropRect {x, y, width, height} or null
   */
  const calculateAutoCropBoxCanny = (useBaseImage) => {
    const scale = 1
    const img = imageStore.getRenderedImage({ t, renderCall: false })
    if (!img) return null

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    canvas.width = img.width * scale
    canvas.height = img.height * scale
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const { data, width: imgWidth, height: imgHeight } = imgData

    // Convert canvas to OpenCV Mat
    const src = cv.imread(canvas)
    let gray = new cv.Mat()
    let edges = new cv.Mat()

    // Grayscale + blur
    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0)
    cv.GaussianBlur(gray, gray, new cv.Size(5, 5), 0, 0, cv.BORDER_DEFAULT)

    const lower = 1
    const upper = 20
    cv.Canny(gray, edges, lower, upper)

    // Mask edges if not using base image
    if (lastCannyCrop.value && !useBaseImage) {
      const mask = new cv.Mat.zeros(edges.rows, edges.cols, edges.type())
      const rect = new cv.Rect(
        lastCannyCrop.value.x * scale,
        lastCannyCrop.value.y * scale,
        lastCannyCrop.value.width * scale,
        lastCannyCrop.value.height * scale,
      )
      const roi = mask.roi(rect)
      roi.setTo(new cv.Scalar(255))
      roi.delete()
      cv.bitwise_and(edges, mask, edges)
      mask.delete()
    }

    // Find contours
    const contours = new cv.MatVector()
    const hierarchy = new cv.Mat()
    cv.findContours(edges, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)

    // Create filled mask
    let maskFilled = new cv.Mat.zeros(edges.rows, edges.cols, cv.CV_8UC1)
    for (let i = 0; i < contours.size(); i++) {
      cv.drawContours(maskFilled, contours, i, new cv.Scalar(255), -1)
    }

    // Morphological opening to remove small noise
    const kernel = cv.getStructuringElement(cv.MORPH_RECT, new cv.Size(1, 1))
    cv.morphologyEx(maskFilled, maskFilled, cv.MORPH_OPEN, kernel)
    kernel.delete()

    // Initial bounding box
    let xMin = maskFilled.cols,
      yMin = maskFilled.rows,
      xMax = 0,
      yMax = 0
    for (let y = 0; y < maskFilled.rows; y++) {
      for (let x = 0; x < maskFilled.cols; x++) {
        if (maskFilled.ucharPtr(y, x)[0] > 0) {
          xMin = Math.min(xMin, x)
          yMin = Math.min(yMin, y)
          xMax = Math.max(xMax, x)
          yMax = Math.max(yMax, y)
        }
      }
    }

    let cropRect = { x: 0, y: 0, width: img.width, height: img.height }
    if (xMax >= xMin && yMax >= yMin) {
      cropRect = {
        x: Math.floor(xMin / scale),
        y: Math.floor(yMin / scale),
        width: Math.ceil((xMax - xMin + 1) / scale),
        height: Math.ceil((yMax - yMin + 1) / scale),
      }
    }

    lastCannyCrop.value = { ...cropRect }

    /**
     * Get pixel color at (x, y), returns [r, g, b, a]
     */
    const getPixel = (x, y) => {
      if (x < 0 || x >= imgWidth || y < 0 || y >= imgHeight) return [0, 0, 0, 255]
      const idx = (y * imgWidth + x) * 4
      return [data[idx], data[idx + 1], data[idx + 2], data[idx + 3]]
    }

    // Convert color [r,g,b] to intensity (brightness)
    const getIntensity = ([r, g, b]) => r * 0.299 + g * 0.587 + b * 0.114

    /**
     * Compute average dual contrast for a given edge:
     * returns { inner1Contrast, inner2Contrast }
     */
    const getDualContrastForSide = (side) => {
      const diffs1 = [] // inner1 vs outer
      const diffs2 = [] // inner2 vs outer

      switch (side) {
        case 'left':
          for (let i = 0; i < cropRect.height; i++) {
            const inner1 = getIntensity(getPixel(cropRect.x, cropRect.y + i))
            const inner2 = getIntensity(getPixel(cropRect.x + 1, cropRect.y + i))
            const outer = getIntensity(getPixel(cropRect.x - 1, cropRect.y + i))
            diffs1.push(Math.abs(inner1 - outer))
            diffs2.push(Math.abs(inner2 - outer))
          }
          break

        case 'right':
          for (let i = 0; i < cropRect.height; i++) {
            const inner1 = getIntensity(getPixel(cropRect.x + cropRect.width - 1, cropRect.y + i))
            const inner2 = getIntensity(getPixel(cropRect.x + cropRect.width - 2, cropRect.y + i))
            const outer = getIntensity(getPixel(cropRect.x + cropRect.width, cropRect.y + i))
            diffs1.push(Math.abs(inner1 - outer))
            diffs2.push(Math.abs(inner2 - outer))
          }
          break

        case 'top':
          for (let i = 0; i < cropRect.width; i++) {
            const inner1 = getIntensity(getPixel(cropRect.x + i, cropRect.y))
            const inner2 = getIntensity(getPixel(cropRect.x + i, cropRect.y + 1))
            const outer = getIntensity(getPixel(cropRect.x + i, cropRect.y - 1))
            diffs1.push(Math.abs(inner1 - outer))
            diffs2.push(Math.abs(inner2 - outer))
          }
          break

        case 'bottom':
          for (let i = 0; i < cropRect.width; i++) {
            const inner1 = getIntensity(getPixel(cropRect.x + i, cropRect.y + cropRect.height - 1))
            const inner2 = getIntensity(getPixel(cropRect.x + i, cropRect.y + cropRect.height - 2))
            const outer = getIntensity(getPixel(cropRect.x + i, cropRect.y + cropRect.height))
            diffs1.push(Math.abs(inner1 - outer))
            diffs2.push(Math.abs(inner2 - outer))
          }
          break
      }

      const inner1Contrast = diffs1.reduce((a, b) => a + b, 0) / diffs1.length
      const inner2Contrast = diffs2.reduce((a, b) => a + b, 0) / diffs2.length

      return { inner1Contrast, inner2Contrast }
    }

    /**
     * Adaptively trim one side based on two contrast values
     */
    const trimEdgeAdaptive = (side) => {
      const { inner1Contrast, inner2Contrast } = getDualContrastForSide(side)

      const c1 = inner1Contrast / 255
      const c2 = inner2Contrast / 255

      // Compute ratio (always ≥1)
      const ratio = c2 > c1 ? c2 / c1 : c1 / c2

      // Base range of possible thresholds for ratio
      const minRatio = 1.2
      const maxRatio = 10
      const threshold = minRatio + (maxRatio - minRatio)

      console.log(
        `${side} contrast1: ${c1.toFixed(3)} contrast2: ${c2.toFixed(3)} ratio: ${ratio.toFixed(
          3,
        )} threshold: ${threshold.toFixed(3)}`,
      )

      // If ratio exceeds threshold trim
      if (ratio >= threshold) {
        console.warn(`${side}  → trimming`)
        switch (side) {
          case 'left':
            cropRect.x += 1
            cropRect.width -= 1
            trimmedSides.left = true
            break
          case 'right':
            cropRect.width -= 1
            trimmedSides.right = true
            break
          case 'top':
            cropRect.y += 1
            cropRect.height -= 1
            trimmedSides.top = true
            break
          case 'bottom':
            cropRect.height -= 1
            trimmedSides.bottom = true
            break
        }
      }
    }

    // Apply for all edges only if specific side changed or sensitivity was changed
    if (cropBox.value.x !== cropRect.x || (autoCropThresholdWasChanged.value && !trimmedSides.left))
      trimEdgeAdaptive('left')

    if (
      cropBox.value.x + cropBox.value.width !== cropRect.x + cropRect.width ||
      (autoCropThresholdWasChanged.value && !trimmedSides.right)
    )
      trimEdgeAdaptive('right')
    if (cropBox.value.y !== cropRect.y || (autoCropThresholdWasChanged.value && !trimmedSides.top))
      trimEdgeAdaptive('top')
    if (
      cropBox.value.y + cropBox.value.height !== cropRect.y + cropRect.height ||
      (autoCropThresholdWasChanged.value && !trimmedSides.bottom)
    )
      trimEdgeAdaptive('bottom')

    autoCropThresholdWasChanged.value = false

    // Clean up
    src.delete()
    gray.delete()
    edges.delete()
    contours.delete()
    hierarchy.delete()
    maskFilled.delete()

    return cropRect
  }

  /**
   * Fit the crop box to the content
   */
  const fitCrop = () => {
    const newCropBox = calculateAutoCropBoxCanny(useBaseImage.value)

    if (
      cropBox.value.x === newCropBox.x &&
      cropBox.value.y === newCropBox.y &&
      cropBox.value.width === newCropBox.width &&
      cropBox.value.height === newCropBox.height
    ) {
      showToastModal(
        'info',
        t('tools.crop.settings.general.sameCropBoxAfterFit.title'),
        t('tools.crop.settings.general.sameCropBoxAfterFit.message'),
      )
    }

    if (newCropBox) {
      cropBox.value = newCropBox
      fitCropApplied.value = true
    }
  }

  //------------------------------------
  // Color and threshold detection
  //------------------------------------

  /**
   * Get or calculate background color
   * @param {boolean} useBaseImage - whether to use the full image or current crop box
   */
  const getOrDetectBgColor = (useBaseImage = true) => {
    if (detectedBgColor.value !== null) {
      return detectedBgColor.value
    }

    const img = imageStore.getRenderedImage({ t, renderCall: false })
    if (!img) return { r: 255, g: 255, b: 255, a: 255 }

    // Canvas dimensions
    let canvasWidth = img.width
    let canvasHeight = img.height
    let sx = 0,
      sy = 0,
      sWidth = img.width,
      sHeight = img.height

    if (!useBaseImage && cropBox.value) {
      sx = cropBox.value.x
      sy = cropBox.value.y
      sWidth = cropBox.value.width
      sHeight = cropBox.value.height

      canvasWidth = sWidth
      canvasHeight = sHeight
    }

    const canvas = document.createElement('canvas')
    canvas.width = canvasWidth
    canvas.height = canvasHeight
    const ctx = canvas.getContext('2d', { willReadFrequently: true })

    ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, canvasWidth, canvasHeight)

    const { data } = ctx.getImageData(0, 0, canvasWidth, canvasHeight)
    detectedBgColor.value = guessBackgroundColor(data, canvasWidth, canvasHeight)

    return detectedBgColor.value
  }

  /**
   * Get or calculate threshold (computes histogram if needed)
   */
  const getOrComputeThreshold = (bgColor) => {
    if (cachedThreshold.value !== null) {
      return cachedThreshold.value
    }

    // Calculate histogram
    if (cachedHistogram.value === null) {
      cachedHistogram.value = computeHistogram(bgColor)
    }

    cachedThreshold.value = getThresholdFromHistogram(
      cachedHistogram.value,
      autoCropThreshold.value,
    )
    return cachedThreshold.value
  }

  /**
   * Reset background color
   */
  const resetCache = () => {
    detectedBgColor.value = null
    cachedHistogram.value = null
    cachedThreshold.value = null
  }

  /**
   * Watch for active tab changes and reset cache
   */
  watch(() => workspaceStore.activeTabIndex, resetCache, { immediate: true })

  /**
   * Compute histogram of the image
   * @param {Object} bgColor - Background color
   * @returns {number[]} - Histogram bins
   */
  const computeHistogram = (bgColor = { r: 255, g: 255, b: 255 }) => {
    const img = imageStore.getRenderedImage({ t, renderCall: false })
    if (!img) return null

    // Create temporary canvas
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d', { willReadFrequently: true })

    const width = img.width
    const height = img.height

    canvas.width = width
    canvas.height = height

    if (img instanceof HTMLCanvasElement) {
      ctx.drawImage(img, 0, 0)
    } else if (img instanceof HTMLImageElement) {
      ctx.drawImage(img, 0, 0, width, height)
    }

    const imageData = ctx.getImageData(0, 0, width, height)
    const data = imageData.data

    // Max distance = 441 (sqrt(255**2 * 3))
    const maxDist = Math.sqrt(255 ** 2 * 3)
    const bins = new Array(256).fill(0)

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]
      const dist = Math.sqrt((r - bgColor.r) ** 2 + (g - bgColor.g) ** 2 + (b - bgColor.b) ** 2)

      if (dist > 0) {
        // Normalize to 0..255
        const binIndex = Math.floor((dist / maxDist) * 255)
        bins[binIndex]++
      }
    }

    return bins
  }

  /**
   * Get threshold value from histogram bins
   * @param {number[]} bins - Histogram bins
   * @param {number} percentile - Percentile to use for threshold (0..1)
   * @returns {number} - Computed threshold value
   */
  const getThresholdFromHistogram = (bins, percentile) => {
    if (percentile <= 0) return 0
    if (percentile > 1) percentile = 1

    const total = bins.reduce((a, b) => a + b, 0)
    let cumulative = 0

    for (let i = 0; i < bins.length; i++) {
      cumulative += bins[i]
      if (cumulative / total >= percentile) {
        const maxDist = Math.sqrt(255 ** 2 * 3)
        const threshold = (i / 255) * maxDist
        return threshold
      }
    }

    // fallback
    return 10
  }

  // -----------------------------
  // Artifacts
  // -----------------------------

  /**
   * Artifacts
   */
  const cachedArtifacts = ref(null)

  /**
   * Compute artifacts in the image
   */
  const computeArtifacts = (threshold, bgColor = { r: 255, g: 255, b: 255 }) => {
    const img = imageStore.getRenderedImage({ t, renderCall: false })
    if (!img) return null

    // Create temporary canvas
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d', { willReadFrequently: true })

    const width = img.width
    const height = img.height

    canvas.width = width
    canvas.height = height

    if (img instanceof HTMLCanvasElement) {
      ctx.drawImage(img, 0, 0)
    } else if (img instanceof HTMLImageElement) {
      ctx.drawImage(img, 0, 0, width, height)
    }

    const imageData = ctx.getImageData(0, 0, width, height)
    const data = imageData.data

    const overlayData = new ImageData(canvas.width, canvas.height)
    const odata = overlayData.data

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]
      const dist = Math.sqrt((r - bgColor.r) ** 2 + (g - bgColor.g) ** 2 + (b - bgColor.b) ** 2)

      if (dist > 0 && dist <= threshold) {
        // Highlight pixel on overlay with red
        odata[i] = 255
        odata[i + 1] = 0
        odata[i + 2] = 0
        odata[i + 3] = 80 // Opacity
      } else {
        odata[i + 3] = 0 // Transparent pixels
      }
    }

    cachedArtifacts.value = overlayData
    return overlayData
  }

  /**
   * Whether artifacts are visible
   */
  const isArtifactsVisible = computed(() => imageStore.isArtifactsVisible)

  /**
   * Show artifacts in the image
   */
  const showArtifacts = () => {
    const bgColor = getOrDetectBgColor(true)
    const threshold = getOrComputeThreshold(bgColor)
    computeArtifacts(threshold, bgColor)

    const canvas = document.querySelector('.image-canvas')
    const overlay = document.querySelector('.overlay-canvas')
    if (!canvas || !overlay || !cachedArtifacts.value) return

    overlay.width = canvas.width
    overlay.height = canvas.height

    const oCtx = overlay.getContext('2d')
    oCtx.putImageData(cachedArtifacts.value, 0, 0)

    imageStore.isArtifactsVisible = true
  }

  /**
   * Hide artifacts in the image
   */
  const hideArtifacts = () => {
    const overlay = document.querySelector('.overlay-canvas')
    if (overlay) {
      const oCtx = overlay.getContext('2d')
      oCtx.clearRect(0, 0, overlay.width, overlay.height)
    }
    imageStore.isArtifactsVisible = false
  }

  /**
   * Cleanup artifacts on component unmount
   */
  onBeforeUnmount(() => {
    hideArtifacts()
  })

  /**
   * Watch for changes in isArtifactsVisible and hide it
   */
  watch(isArtifactsVisible, (newValue) => {
    if (!newValue) {
      hideArtifacts()
    }
  })

  //----------------------------------
  // Reset
  //----------------------------------

  /**
   * Check if the crop box can be reset
   */
  const cropCanBeReset = computed(() => {
    return (
      cropBox.value.x !== 0 ||
      cropBox.value.y !== 0 ||
      cropBox.value.width !== imageStore.fileDimensions.width ||
      cropBox.value.height !== imageStore.fileDimensions.height
    )
  })

  /**
   * Reset the crop box to its initial state
   */
  const resetCrop = () => {
    cropBox.value = {
      x: 0,
      y: 0,
      width: imageStore.fileDimensions.width,
      height: imageStore.fileDimensions.height,
    }
    fitCropApplied.value = false
    resetCache()
    updateLastCannyCrop()
  }

  /**
   * Reset the auto crop threshold to its initial state
   */
  const resetThreshold = () => {
    autoCropThreshold.value = editorConfig.autoCropThreshold
    if (isArtifactsVisible.value) {
      hideArtifacts()
      showArtifacts()
    }
  }

  // -------------------------------
  // Crop apply
  // -------------------------------
  /**
   * Apply the auto crop in preset
   */
  const applyAutoCropPreset = async () => {
    const newCropBox = calculateAutoCropBoxCanny(useBaseImage)

    applyCropRender(newCropBox)
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
        t('tools.crop.settings.general.cropBoxIsSameAsOriginalImage.title'),
        t('tools.crop.settings.general.cropBoxIsSameAsOriginalImage.message'),
      )
      return
    }

    if (imageStore.needRasterization) {
      const confirmed = await showConfirmModal(
        t('tools.confirmNeedRasterization.title'),
        t('tools.confirmNeedRasterization.message'),
        t('tools.confirmNeedRasterization.cancel'),
        t('tools.confirmNeedRasterization.confirm'),
      )
      if (!confirmed) return

      await imageStore.rasterize(t, true)
    }

    imageStore.addImageOperation({
      type: 'crop',
      cropBox: { ...cropBox.value },
    })

    useSendEvent().sendEvent('toolSettings', 'crop', null, {
      settings: { cropBox: { ...cropBox.value } },
    })

    await applyCropRender(cropBox.value)

    historyStore.push(imageStore.getSnapshot(t))
  }

  /**
   * Apply the crop operation to the rendered image
   * @param {Object} cropBox - Crop box dimensions
   */
  const applyCropRender = async (cropBox) => {
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
        t('tools.crop.settings.general.cropBoxIsSameAsOriginalImage.title'),
        t('tools.crop.settings.general.cropBoxIsSameAsOriginalImage.message'),
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
        t('tools.crop.settings.general.invalidCropBox.title'),
        t('tools.crop.settings.general.invalidCropBox.message'),
      )
      return
    }

    if (imageStore.fileType === 'pdf' && imageStore.pdfPageBytes) {
      try {
        const currentPdf = await PDFDocument.load(imageStore.pdfPageBytes)
        // Create new page
        const newPdf = await PDFDocument.create()

        // Embed old page
        const [embeddedPage] = await newPdf.embedPages([currentPdf.getPage(0)])

        const { x, y, width, height } = cropBox
        const pageHeight = embeddedPage.height
        const pdfY = pageHeight - (y + height)

        // Add cropped page
        const page = newPdf.addPage([width, height])
        page.drawPage(embeddedPage, {
          x: -x, // Move according to crop box
          y: -pdfY,
          width: embeddedPage.width,
          height: embeddedPage.height,
        })

        const pdfBytes = await newPdf.save()
        imageStore.pdfPageBytes = pdfBytes
      } catch (e) {
        console.error('Error cropping PDF:', e)
      }
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
    imageStore.originalImage = canvas
    imageStore.originalFileDimensions.width = width
    imageStore.originalFileDimensions.height = height
    imageStore.originalFileDimensions.fileAspectRatio = width / height || 1

    // Crop overlay svg objects
    if (imageStore.overlayImage) {
      const oldOverlay = imageStore.overlayImage
      const overlayCanvas = document.createElement('canvas')
      const overlayCtx = overlayCanvas.getContext('2d')
      overlayCanvas.width = width
      overlayCanvas.height = height

      overlayCtx.drawImage(
        oldOverlay,
        x,
        y,
        width,
        height, // Source crop region
        0,
        0,
        width,
        height, // Destination
      )

      imageStore.overlayImage = overlayCanvas
      imageStore.overlayImageExport = overlayCanvas
      imageStore.overlayImagePreview = overlayCanvas
    }

    // Update file dimensions
    imageStore.fileDimensions.width = width
    imageStore.fileDimensions.height = height
    imageStore.fileDimensions.fileAspectRatio = width / height || 1

    imageStore.newFileDimensions = { ...imageStore.fileDimensions }

    hideArtifacts()

    // Center image
    viewportStore.shouldFitToScreen = true

    // Reset crop color
    resetCache()
  }

  /**
   * Show crop box
   */
  const showCropBox = () => {
    editorStore.toolsConfig.crop.isVisibleCropBox = true
  }

  /**
   * Hide crop box
   */
  const hideCropBox = () => {
    editorStore.toolsConfig.crop.isVisibleCropBox = false
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
    resetCrop,
    cropCanBeReset,
    showCropBox,
    hideCropBox,
    // Auto crop
    useBaseImage,
    fitCrop,
    manualIndents,
    recalculateCropBox,
    fitCropApplied,
    applyAutoCropPreset,
    showArtifacts,
    hideArtifacts,
    isArtifactsVisible,
    autoCropThreshold,
    autoCropThresholdOptions,
    resetThreshold,
    resetCache,
    tmpCropX,
    tmpCropY,
    isManualAdjustmentsLinked,
    manualIndentsWereChangedManually,
  }
}
