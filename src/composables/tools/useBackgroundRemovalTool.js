import { computed, ref } from 'vue'
import { useConfirmModal } from '../modals/useConfirmModal'
import { useSendEvent } from '@/composables/common/useSendEvent'
import { editorConfig } from '@/config/editorConfig'

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

  /**
   * Background color for replacement (if enabled)
   */
  const backgroundReplacementColor = computed({
    get: () => {
      return editorStore.toolsConfig.backgroundRemoval.backgroundColor
    },
    set: (value) => {
      editorStore.toolsConfig.backgroundRemoval.backgroundColor = value
    },
  })

  /**
   * Whether to replace removed background with color (otherwise transparent)
   */
  const replaceWithBackgroundColor = computed({
    get: () => {
      return editorStore.toolsConfig.backgroundRemoval.replaceWithBackgroundColor
    },
    set: (value) => {
      editorStore.toolsConfig.backgroundRemoval.replaceWithBackgroundColor = value
    },
  })

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
   * Get highlight color RGBA from config
   * @returns {Object} - Highlight color RGBA ({fillR, fillG, fillB, fillA})
   */
  const getHighlightColorRGBA = () => {
    const rgbaMatch = editorConfig.removalHighlightColor.match(
      /rgba?\((\d+),\s*(\d+),\s*(\d+),?\s*([0-9.]*)?\)/,
    )

    let fillR = 255,
      fillG = 0,
      fillB = 0,
      fillA = 255
    if (rgbaMatch) {
      fillR = parseInt(rgbaMatch[1])
      fillG = parseInt(rgbaMatch[2])
      fillB = parseInt(rgbaMatch[3])
      fillA = rgbaMatch[4] ? Math.round(parseFloat(rgbaMatch[4]) * 255) : 255
    }
    return { fillR, fillG, fillB, fillA }
  }

  /**
   * Get background replacement color RGBA from
   */
  const getBackgroundColorRGBA = (replaceWithBackgroundColor) => {
    if (replaceWithBackgroundColor) {
      const bgColor = editorStore.toolsConfig.backgroundRemoval.backgroundColor
      if (bgColor.startsWith('rgba')) {
        const rgbaMatch = bgColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+),?\s*([0-9.]*)?\)/)
        if (rgbaMatch) {
          const r = parseInt(rgbaMatch[1])
          const g = parseInt(rgbaMatch[2])
          const b = parseInt(rgbaMatch[3])
          const a = rgbaMatch[4] ? Math.round(parseFloat(rgbaMatch[4]) * 255) : 255
          return { r, g, b, a }
        }
      } else if (bgColor.startsWith('#')) {
        const { r, g, b } = hexToRgb(bgColor)
        return { r, g, b, a: 255 }
      } else {
        // Transparent
        return { r: 0, g: 0, b: 0, a: 0 }
      }
    } else {
      // Transparent
      return { r: 0, g: 0, b: 0, a: 0 }
    }
  }

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
  const replaceSelection = ref(false)

  /**
   * Highlight color for selection
   */
  const highlightColor = computed(() => {
    return editorStore.toolsConfig.backgroundRemoval.highlightColor
  })

  /**
   * Maximum size of the manual tool (10% of smaller image dimension, min 10px)
   */
  const manualMaxToolSize = computed(() => {
    const smallerDimension = imageStore.getSmallerImageDimension()
    return Math.max(10, Math.floor(smallerDimension * editorConfig.maxManualToolSizeCoefficient))
  })

  /**
   * Minimum size of the manual tool (2px)
   */
  const manualMinToolSize = 2

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
    const canvas = document.getElementById('removalCanvas')
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }

  /**
   * Invert manual selection
   */
  const invertSelection = () => {
    const canvas = document.getElementById('removalCanvas')
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data

    // Get highlight color RGBA
    const { fillR, fillG, fillB, fillA } = getHighlightColorRGBA()

    for (let i = 0; i < data.length; i += 4) {
      const alpha = data[i + 3]

      if (alpha > 0) {
        // Selected area set to transparent
        data[i + 3] = 0
      } else {
        // Unselected area set to highlight color
        data[i] = fillR
        data[i + 1] = fillG
        data[i + 2] = fillB
        data[i + 3] = fillA
      }
    }

    ctx.putImageData(imageData, 0, 0)
  }

  /**
   * Change size of the manual tool
   * @param {number} size - New size in pixels
   */
  const changeManualToolSize = (size) => {
    if (size < manualMinToolSize) size = manualMinToolSize
    if (size > manualMaxToolSize.value) size = manualMaxToolSize.value
    manualToolSize.value = size
  }

  /**
   * Highlight removed pixels on canvas
   */
  const highlightRemovedPixels = () => {
    const canvas = document.getElementById('removalCanvas')
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    // Clear previous selection
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Get the current rendered image
    const img = imageStore.getRenderedImage({ t, renderCall: false })
    if (!img) return

    const width = canvas.width
    const height = canvas.height

    // Draw image on temporary canvas to read pixel data
    const tempCanvas = document.createElement('canvas')
    tempCanvas.width = width
    tempCanvas.height = height
    const tempCtx = tempCanvas.getContext('2d')
    tempCtx.drawImage(img, 0, 0, width, height)
    const imageData = tempCtx.getImageData(0, 0, width, height)
    const data = imageData.data

    // Get highlight color RGBA
    const { fillR, fillG, fillB, fillA } = getHighlightColorRGBA()

    // Prepare canvas for manual selection overlay
    const manualImageData = ctx.getImageData(0, 0, width, height)
    const manualData = manualImageData.data

    for (let i = 0; i < data.length; i += 4) {
      const alpha = data[i + 3] // opacity of current pixel

      // If pixel is fully transparent, mark it
      if (alpha === 0) {
        manualData[i] = fillR
        manualData[i + 1] = fillG
        manualData[i + 2] = fillB
        manualData[i + 3] = fillA
      }
    }

    // Apply overlay to canvas
    ctx.putImageData(manualImageData, 0, 0)
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
    const canvas = document.getElementById('removalCanvas')
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    if (replaceSelection.value) {
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

  /**
   * Mark background color on canvas
   */
  const selectColorClick = () => {
    const canvas = document.getElementById('removalCanvas')
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    if (replaceSelection.value) {
      // Clear existing selection
      ctx.clearRect(0, 0, canvas.width, canvas.height)
    }

    // Get rendered image
    const img = imageStore.getRenderedImage({ t, renderCall: false })
    if (!img) return

    const width = canvas.width
    const height = canvas.height

    // Get background color and threshold
    const bgColor = hexToRgb(colorBackgroundColor.value)

    // Compute threshold as fraction of max possible distance
    const maxDist = Math.sqrt(255 ** 2 + 255 ** 2 + 255 ** 2) // ~441.67
    const threshold = maxDist * colorRemovalThreshold.value

    console.log('Using background color:', bgColor, 'with threshold:', threshold)

    // Get image data from rendered image
    const tempCanvas = document.createElement('canvas')
    tempCanvas.width = width
    tempCanvas.height = height
    const tempCtx = tempCanvas.getContext('2d')
    tempCtx.drawImage(img, 0, 0, width, height)
    const imageData = tempCtx.getImageData(0, 0, width, height)
    const data = imageData.data

    // Get highlight color RGBA
    const { fillR, fillG, fillB, fillA } = getHighlightColorRGBA()

    // Apply selection
    const manualImageData = ctx.getImageData(0, 0, width, height)
    const manualData = manualImageData.data

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]

      const dist = Math.sqrt((r - bgColor.r) ** 2 + (g - bgColor.g) ** 2 + (b - bgColor.b) ** 2)
      if (dist <= threshold) {
        manualData[i] = fillR
        manualData[i + 1] = fillG
        manualData[i + 2] = fillB
        manualData[i + 3] = fillA
      }
    }

    ctx.putImageData(manualImageData, 0, 0)
  }

  // ----------------------------------
  // Apply
  // ----------------------------------

  /**
   * Apply background removal
   *
   * @param {string} removalType - Type of removal ('color', 'manual', 'objectDetection')
   */
  const applyBackgroundRemoval = async (removalType) => {
    imageStore.addImageOperation({
      type: 'backgroundRemoval',
      removalType,
    })

    useSendEvent().sendEvent('toolSettings', 'backgroundRemoval', null, {
      settings: {
        removalType,
      },
    })

    await applyBackgroundRemovalRender()

    historyStore.push(imageStore.getSnapshot(t))
  }

  /**
   * Apply background removal rendering
   */
  const applyBackgroundRemovalRender = async () => {
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

    // if (removalType === 'color') {
    //   // applyColorRemovalRender(colorBackgroundColor.value, colorRemovalThreshold.value)
    //   applyRemovalRender()
    // } else if (removalType === 'manual') {
    //   applyRemovalRender()
    // } else if (removalType === 'objectDetection') {
    // }
    applyRemovalRender()
  }

  /**
   * Apply removal rendering based on canvas mask
   */
  const applyRemovalRender = () => {
    const manualCanvas = document.getElementById('removalCanvas')
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

    // Get background replacement color
    const {
      r: bgR,
      g: bgG,
      b: bgB,
      a: bgA,
    } = getBackgroundColorRGBA(replaceWithBackgroundColor.value)

    // Apply mask: make pixels transparent where mask is red
    for (let i = 0; i < data.length; i += 4) {
      const maskR = maskPixels[i]
      const maskG = maskPixels[i + 1]
      const maskB = maskPixels[i + 2]
      const maskA = maskPixels[i + 3]

      // If the pixel is mask
      const { fillR, fillG, fillB } = getHighlightColorRGBA()
      if (maskA > 0 && maskR === fillR && maskG === fillG && maskB === fillB) {
        data[i] = bgR
        data[i + 1] = bgG
        data[i + 2] = bgB
        data[i + 3] = bgA
      }
    }

    ctx.putImageData(imageData, 0, 0)
    imageStore.setRenderedImage(canvas)

    // Clear manual selection
    clearAllSelections()
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
    manualMinToolSize,
    clearAllSelections,
    invertSelection,
    useBaseImage,
    changeManualToolSize,
    detectObjectsClick,
    replaceSelection,
    highlightColor,
    selectColorClick,
    highlightRemovedPixels,
    backgroundReplacementColor,
    replaceWithBackgroundColor,
  }
}
