import { computed, ref, watch } from 'vue'
import { useConfirmModal } from '../modals/useConfirmModal'
import { useSendEvent } from '@/composables/common/useSendEvent'
import { editorConfig } from '@/config/editorConfig'

/**
 * Cached histogram
 */
const cachedHistogram = ref(null)

/**
 * Cached threshold
 */
const cachedThreshold = ref(null)

/**
 * Selected manual tool ('brush' | 'eraser')
 */
const manualSelectedTool = ref('brush') // 'brush' | 'eraser'

/**
 * Size of the manual tool
 */
const manualToolSize = ref(editorConfig.defaultManualToolSize)

export function useBackgroundRemovalTool(imageStore, historyStore, workspaceStore, editorStore, t) {
  const { showConfirmModal } = useConfirmModal()

  // ----------------------------------
  // Color
  // ----------------------------------
  /**
   * Background color for removal
   */
  const colorBackgroundColor = ref(editorConfig.defaultBackgroundColor)

  /**
   * Removal threshold for background removal
   */
  const colorRemovalThreshold = ref(editorConfig.defaultThreshold)

  /**
   * Available options for removal threshold
   */
  const colorRemovalThresholdOptions = [
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
    '1',
  ]

  /**
   * Convert HEX color to RGB
   * @param {string} hex - HEX color string
   * @returns {{r: number, g: number, b: number}} - RGB values (0-255)
   */
  const hexToRgb = (hex) => {
    const bigint = parseInt(hex.replace('#', ''), 16)
    const r = (bigint >> 16) & 255
    const g = (bigint >> 8) & 255
    const b = bigint & 255
    return { r, g, b }
  }

  /**
   * Get or calculate threshold (computes histogram if needed)
   */
  const getOrComputeThreshold = (bgColor, threshold) => {
    if (cachedThreshold.value !== null) {
      return cachedThreshold.value
    }

    // Calculate histogram
    if (cachedHistogram.value === null) {
      cachedHistogram.value = computeHistogram(bgColor)
    }

    cachedThreshold.value = getThresholdFromHistogram(cachedHistogram.value, threshold)
    return cachedThreshold.value
  }

  /**
   * Reset cached values
   */
  const resetCache = () => {
    cachedHistogram.value = null
    cachedThreshold.value = null
  }

  /**
   * Watch for active tab changes and reset cache
   */
  watch(() => workspaceStore.activeTabIndex, resetCache, { immediate: true })

  /** Watch for color removal threshold changes */
  watch(colorRemovalThreshold, () => {
    resetCache()
  })

  /** Watch for background color changes */
  watch(colorBackgroundColor, () => {
    resetCache()
  })

  /**
   * Compute histogram of the image
   * @param {Object} bgColor - Background color
   * @returns {number[]} - Histogram bins
   */
  const computeHistogram = (bgColor = { r: 255, g: 255, b: 255 }) => {
    const img = imageStore.originalImage
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

  // ----------------------------------
  // Manual and Object Detection
  // ----------------------------------

  /**
   * Whether to use original image as base for manual removal
   */
  const useBaseImage = ref(false)

  /**
   * Whether to replace current selection with object detection result
   */
  const replaceSelectionWithObjectDetection = ref(false)

  /**
   * Highlight color for selection
   */
  const highlightColor = computed(() => {
    return editorStore.toolsConfig.backgroundRemoval.highlightColor
  })

  const setHighlightColor = () => {
    editorStore.toolsConfig.backgroundRemoval.highlightColor = highlightColor.value
  }

  /**
   * Maximum size of the manual tool (10% of smaller image dimension, min 10px)
   */
  const manualMaxToolSize = computed(() => {
    const smallerDimension = imageStore.getSmallerImageDimension()
    return Math.max(10, Math.floor(smallerDimension * editorConfig.maxManualToolSizeCoefficient))
  })

  /**
   * Select manual tool
   * @param {string} tool - Tool to select ('brush' | 'eraser')
   */
  const manualSelectTool = (tool) => {
    manualSelectedTool.value = tool
  }

  /**
   * Clear all manual selections
   */
  const clearAllSelections = () => {
    const canvas = document.getElementById('manualRemovalCanvas')
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }

  /**
   * Invert manual selection
   */
  const invertSelection = () => {
    const canvas = document.getElementById('manualRemovalCanvas')
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data

    for (let i = 0; i < data.length; i += 4) {
      const alpha = data[i + 3]

      if (alpha > 0) {
        // Red to transparent
        data[i + 3] = 0
      } else {
        // Transparent to red
        data[i] = 255 // R
        data[i + 1] = 0 // G
        data[i + 2] = 0 // B
        data[i + 3] = 255
      }
    }

    ctx.putImageData(imageData, 0, 0)
  }

  const changeManualToolSize = (size) => {
    if (size < 1) size = 1
    if (size > manualMaxToolSize.value) size = manualMaxToolSize.value
    manualToolSize.value = size
  }

  //////////////////////////////////////////////////////////////////////////
  const detectObjects = () => {
    const img = imageStore.originalImage
    if (!img) return

    const canvas = document.createElement('canvas')
    canvas.width = img.width
    canvas.height = img.height
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    ctx.drawImage(img, 0, 0, img.width, img.height)

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    return imageData
  }

  const detectEdges = (imageData) => {
    const { width, height, data } = imageData
    const gray = new Uint8ClampedArray(width * height)

    // prevod na grayscale
    for (let i = 0; i < data.length; i += 4) {
      gray[i / 4] = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
    }

    const edges = new Uint8ClampedArray(width * height)

    const sobel = (x, y) => {
      // const idx = y * width + x
      if (x === 0 || y === 0 || x === width - 1 || y === height - 1) return 0

      const gx =
        -1 * gray[(y - 1) * width + (x - 1)] +
        1 * gray[(y - 1) * width + (x + 1)] +
        -2 * gray[y * width + (x - 1)] +
        2 * gray[y * width + (x + 1)] +
        -1 * gray[(y + 1) * width + (x - 1)] +
        1 * gray[(y + 1) * width + (x + 1)]

      const gy =
        -1 * gray[(y - 1) * width + (x - 1)] +
        -2 * gray[(y - 1) * width + x] +
        -1 * gray[(y - 1) * width + (x + 1)] +
        1 * gray[(y + 1) * width + (x - 1)] +
        2 * gray[(y + 1) * width + x] +
        1 * gray[(y + 1) * width + (x + 1)]

      return Math.sqrt(gx * gx + gy * gy)
    }

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        edges[y * width + x] = sobel(x, y)
      }
    }

    console.log('edges:', edges)
    return edges
  }

  const getBoundingBoxes = (edges, width, height, threshold = 50) => {
    const visited = new Uint8Array(width * height)
    const boxes = []

    const neighbors = (x, y) => [
      [x - 1, y],
      [x + 1, y],
      [x, y - 1],
      [x, y + 1],
    ]

    const floodFill = (x0, y0) => {
      const stack = [[x0, y0]]
      let minX = x0,
        maxX = x0,
        minY = y0,
        maxY = y0

      while (stack.length) {
        const [x, y] = stack.pop()
        const idx = y * width + x
        if (x < 0 || x >= width || y < 0 || y >= height) continue
        if (visited[idx]) continue
        if (edges[idx] < threshold) continue

        visited[idx] = 1
        minX = Math.min(minX, x)
        maxX = Math.max(maxX, x)
        minY = Math.min(minY, y)
        maxY = Math.max(maxY, y)

        neighbors(x, y).forEach(([nx, ny]) => stack.push([nx, ny]))
      }

      return { x: minX, y: minY, width: maxX - minX, height: maxY - minY }
    }

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x
        if (!visited[idx] && edges[idx] >= threshold) {
          const box = floodFill(x, y)
          if (box.width > 5 && box.height > 5) boxes.push(box)
        }
      }
    }

    return boxes
  }

  const drawBoundingBoxes = (boxes) => {
    console.log('Drawing boxes:', boxes)
    const canvas = document.getElementById('manualRemovalCanvas')
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    if (replaceSelectionWithObjectDetection.value) {
      // Clear existing selection
      ctx.clearRect(0, 0, canvas.width, canvas.height)
    }

    ctx.fillStyle = editorConfig.removalHighlightColor

    boxes.forEach((box) => {
      ctx.fillRect(box.x, box.y, box.width, box.height)
    })
  }

  const detectObjectsClick = () => {
    const imageData = detectObjects()
    const edges = detectEdges(imageData)
    const boxes = getBoundingBoxes(edges, imageData.width, imageData.height)
    drawBoundingBoxes(boxes)
  }
  //////////////////////////////////////////////////////////////////////////

  // ----------------------------------
  // Apply
  // ----------------------------------

  /**
   * Apply background removal
   *
   * @param {string} removalType - Type of removal ('color', 'manual', 'objectDetection')
   */
  const applyBackgroundRemoval = async (removalType) => {
    const params = {
      removalType,
      colorBackgroundColor: colorBackgroundColor.value,
      colorThreshold: colorRemovalThreshold.value,
    }

    imageStore.addImageOperation({
      type: 'backgroundRemoval',
      params,
    })

    useSendEvent().sendEvent('toolSettings', 'backgroundRemoval', null, {
      settings: {
        removalType,
        colorBackgroundColor: colorBackgroundColor.value,
        colorRemovalThreshold: colorRemovalThreshold.value,
      },
    })

    await applyBackgroundRemovalRender(removalType, params)

    historyStore.push(imageStore.getSnapshot(t))
  }

  /**
   * Apply background removal rendering
   * @param {string} removalType - Type of removal ('color', 'manual', 'objectDetection')
   * @param {Object} params - Parameters for removal
   */
  const applyBackgroundRemovalRender = async (removalType, params) => {
    if (!imageStore.getRenderedImage({ t, renderCall: false })) return

    if (imageStore.fileType === 'pdf') {
      const confirmed = await showConfirmModal(
        t('tools.confirmNeedBaseImageRasterization.title'),
        t('tools.confirmNeedBaseImageRasterization.message'),
        t('tools.confirmNeedBaseImageRasterization.cancel'),
        t('tools.confirmNeedBaseImageRasterization.confirm'),
      )
      if (!confirmed) return

      await imageStore.rasterizeBaseImage(t)
    }

    if (imageStore.svgObjects.length > 0 || imageStore.blurObjects.length > 0) {
      const confirmed = await showConfirmModal(
        t('tools.confirmNeedRasterization.title'),
        t('tools.confirmNeedRasterization.message'),
        t('tools.confirmNeedRasterization.cancel'),
        t('tools.confirmNeedRasterization.confirm'),
      )
      if (confirmed) {
        await imageStore.rasterize(t)
      } else {
        return
      }
    }

    if (removalType === 'color') {
      applyColorRemovalRender(params.colorBackgroundColor, params.colorThreshold)
    } else if (removalType === 'manual') {
      applyManualRemovalRender()
    } else if (removalType === 'objectDetection') {
      applyManualRemovalRender()
    }
  }

  /**
   * Apply color-based background removal rendering
   * @param {string} backgroundColor - Background color in HEX
   * @param {number} threshold - Threshold value (0..1)
   */
  const applyColorRemovalRender = (backgroundColor, threshold) => {
    // Get RGB values from HEX
    const bgColor = hexToRgb(backgroundColor)

    const img = imageStore.originalImage
    if (!img) return

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    canvas.width = img.width
    canvas.height = img.height
    ctx.drawImage(img, 0, 0)

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data

    // Remove background
    const absThreshold = getOrComputeThreshold(bgColor, threshold)
    console.log('absThreshold (from histogram): ', absThreshold)

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]

      const dist = Math.sqrt((r - bgColor.r) ** 2 + (g - bgColor.g) ** 2 + (b - bgColor.b) ** 2)

      if (dist <= absThreshold) {
        data[i + 3] = 0 // Transparent pixel
      }
    }

    ctx.putImageData(imageData, 0, 0)

    imageStore.setRenderedImage(canvas)
  }

  const applyManualRemovalRender = () => {
    const manualCanvas = document.getElementById('manualRemovalCanvas')
    if (!manualCanvas) return

    const ctxMask = manualCanvas.getContext('2d')
    const maskData = ctxMask.getImageData(0, 0, manualCanvas.width, manualCanvas.height)
    const maskPixels = maskData.data

    const renderedImage = useBaseImage.value
      ? imageStore.originalImage
      : imageStore.getRenderedImage({ t, renderCall: false })
    if (!renderedImage) return

    // Create a temporary canvas to manipulate the rendered image
    const canvas = document.createElement('canvas')
    canvas.width = renderedImage.width
    canvas.height = renderedImage.height
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    ctx.drawImage(renderedImage, 0, 0)

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data

    // Apply mask: make pixels transparent where mask is red
    for (let i = 0; i < data.length; i += 4) {
      const maskR = maskPixels[i]
      const maskG = maskPixels[i + 1]
      const maskB = maskPixels[i + 2]
      const maskA = maskPixels[i + 3]

      // If the pixel is red (masking)
      if (maskA > 0 && maskR === 255 && maskG === 0 && maskB === 0) {
        data[i + 3] = 0 // Transparent
      }
    }

    ctx.putImageData(imageData, 0, 0)
    imageStore.setRenderedImage(canvas)
  }

  return {
    colorRemovalThreshold,
    colorRemovalThresholdOptions,
    applyBackgroundRemoval,
    colorBackgroundColor,
    manualSelectedTool,
    manualToolSize,
    manualSelectTool,
    manualMaxToolSize,
    clearAllSelections,
    invertSelection,
    useBaseImage,
    changeManualToolSize,
    detectObjectsClick,
    replaceSelectionWithObjectDetection,
    highlightColor,
    setHighlightColor,
  }
}
