import { useMath } from '@/composables/common/useMath'
import { computed, ref, nextTick, watch, onBeforeUnmount } from 'vue'
import { useConfirmModal } from '../modals/useConfirmModal'
import { useToastModal } from '../modals/useToastModal'
import { editorConfig } from '@/config/editorConfig'

import { PDFDocument } from 'pdf-lib'

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
   * Whether the fit crop was already applied
   */
  const fitCropApplied = ref(false)

  // -------------------------------
  // Manual crop
  // -------------------------------
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
  }

  /**
   * Update crop position based on input values
   * @param {'x'|'y'} key - Position to update
   * @param {number} value - New position value
   */
  const updatePosition = (key, value) => {
    if (key === 'x') {
      cropBox.value.x = round(clamp(value, 0, maxCropPositionX.value))
    } else if (key === 'y') {
      cropBox.value.y = round(clamp(value, 0, maxCropPositionY.value))
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
        cropBox.value.x = clamp(
          cropBox.value.x + dx / viewportStore.realZoomLevel,
          0,
          imageStore.fileDimensions.width - cropBox.value.width,
        )

        cropBox.value.y = clamp(
          cropBox.value.y + dy / viewportStore.realZoomLevel,
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

  /**
   * Watch the auto crop threshold and update artifacts visibility
   */
  watch(autoCropThreshold, (newValue) => {
    if (newValue > 0) {
      if (isArtifactsVisible.value) {
        hideArtifacts()
      }
      showArtifacts()
    } else {
      if (isArtifactsVisible.value) {
        hideArtifacts()
      }
    }
  })

  /**
   * Color selected for the auto crop
   */
  const selectedColor = ref(editorConfig.autoCropDefaultColor)

  /**
   * Watch the selected color and update artifacts visibility
   */
  watch(selectedColor, () => {
    if (isArtifactsVisible.value) {
      hideArtifacts()
      showArtifacts()
    }
  })

  /**
   * Whether to apply auto crop from base image or current crop
   */
  const useBaseImage = ref(false)

  /**
   * Watch crop box and recalculate indents
   */
  watch(
    cropBox,
    (newCropBox) => {
      manualIndents.value.topIndent = newCropBox.y
      manualIndents.value.rightIndent =
        imageStore.fileDimensions.width - (newCropBox.x + newCropBox.width)
      manualIndents.value.bottomIndent =
        imageStore.fileDimensions.height - (newCropBox.y + newCropBox.height)
      manualIndents.value.leftIndent = newCropBox.x

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

  /**
   * Parse a hex color string into an RGB object.
   */
  const parseHex = (hex) => {
    const bigint = parseInt(hex.replace('#', ''), 16)
    return {
      r: (bigint >> 16) & 255,
      g: (bigint >> 8) & 255,
      b: bigint & 255,
    }
  }

  /**
   * Calculate the crop box based on uniform color borders
   * @param {string} color - The color to use for the auto crop
   * @param {boolean} useBaseImage - If true, work on full base image, otherwise on current cropBox
   * @returns {Object} - The calculated crop box { x, y, width, height }
   */
  const calculateFitCropBox = (color, useBaseImage = true) => {
    const img = imageStore.getRenderedImage({ t, renderCall: false })
    if (!img) return

    // Create temporary canvas
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    const width = img.width
    const height = img.height

    canvas.width = width
    canvas.height = height

    if (img instanceof HTMLCanvasElement) {
      ctx.drawImage(img, 0, 0)
    } else if (img instanceof HTMLImageElement) {
      ctx.drawImage(img, 0, 0, width, height)
    }

    const imageData = ctx.getImageData(0, 0, width, height).data

    /**
     * Check if the color at the given index matches the target color.
     * @param {number} index - The index of the color to check.
     * @param {Object} target - The target color to match against.
     * @returns {boolean} - True if the colors match, false otherwise.
     */
    const isColorMatch = (index, target, threshold) => {
      const r = imageData[index]
      const g = imageData[index + 1]
      const b = imageData[index + 2]

      const dist = Math.sqrt((r - target.r) ** 2 + (g - target.g) ** 2 + (b - target.b) ** 2)

      return dist >= 0 && dist <= threshold
    }

    const targetColor = parseHex(color)

    // Define search area
    let startX = 0
    let startY = 0
    let endX = width - 1
    let endY = height - 1

    if (!useBaseImage) {
      startX = cropBox.value.x
      startY = cropBox.value.y
      endX = cropBox.value.x + cropBox.value.width - 1
      endY = cropBox.value.y + cropBox.value.height - 1
    }

    const bins = computeHistogram(parseHex(selectedColor.value))
    const dynamicThreshold = getThresholdFromHistogram(bins, autoCropThreshold.value)

    // Top
    let top = startY
    while (top <= endY) {
      let match = true
      for (let x = startX; x <= endX; x++) {
        const i = (top * width + x) * 4
        if (!isColorMatch(i, targetColor, dynamicThreshold)) {
          match = false
          break
        }
      }
      if (!match) break
      top++
    }

    // Bottom
    let bottom = endY
    while (bottom >= startY) {
      let match = true
      for (let x = startX; x <= endX; x++) {
        const i = (bottom * width + x) * 4
        if (!isColorMatch(i, targetColor, dynamicThreshold)) {
          match = false
          break
        }
      }
      if (!match) break
      bottom--
    }

    // Left
    let left = startX
    while (left <= endX) {
      let match = true
      for (let y = top; y <= bottom; y++) {
        const i = (y * width + left) * 4
        if (!isColorMatch(i, targetColor, dynamicThreshold)) {
          match = false
          break
        }
      }
      if (!match) break
      left++
    }

    // Right
    let right = endX
    while (right >= startX) {
      let match = true
      for (let y = top; y <= bottom; y++) {
        const i = (y * width + right) * 4
        if (!isColorMatch(i, targetColor, dynamicThreshold)) {
          match = false
          break
        }
      }
      if (!match) break
      right--
    }

    const newWidth = right - left + 1
    const newHeight = bottom - top + 1

    // Check if the new dimensions are valid
    if (newWidth <= 0 || newHeight <= 0) {
      return cropBox.value
    }

    // Final crop box
    return {
      x: left,
      y: top,
      width: newWidth,
      height: newHeight,
    }
  }

  /**
   * Fit the crop box to the content
   */
  const fitCrop = () => {
    const newCropBox = calculateFitCropBox(selectedColor.value, useBaseImage.value)
    if (newCropBox) {
      cropBox.value = newCropBox
      fitCropApplied.value = true
    }
  }

  // -------------------------------
  // Crop apply
  // -------------------------------
  /**
   * Apply the auto crop in preset
   * @param {string} color - The target color to crop
   */
  const applyAutoCropPreset = async (color) => {
    const newCropBox = calculateFitCropBox(color)

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

        console.log('PDF successfully cropped.')
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

    // Update file dimensions
    imageStore.fileDimensions.width = width
    imageStore.fileDimensions.height = height
    imageStore.fileDimensions.fileAspectRatio = width / height || 1

    imageStore.newFileDimensions = { ...imageStore.fileDimensions }

    hideArtifacts()

    // Center image
    viewportStore.shouldFitToScreen = true
  }

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

  //------------------------------------
  // Artifacts, color histogram
  //------------------------------------
  /**
   * Artifacts
   */
  const cachedArtifacts = ref(null)

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
    if (percentile <= 0) return 0 // neoznač nič
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
    const bins = computeHistogram(parseHex(selectedColor.value))
    const dynamicThreshold = getThresholdFromHistogram(bins, autoCropThreshold.value)
    computeArtifacts(dynamicThreshold, parseHex(selectedColor.value))

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
    // Auto crop
    selectedColor,
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
    resetThreshold,
  }
}
