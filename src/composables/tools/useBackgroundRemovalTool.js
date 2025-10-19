import { computed, ref, watch } from 'vue'
import { useConfirmModal } from '../modals/useConfirmModal'
import { useSendEvent } from '@/composables/common/useSendEvent'
import { editorConfig } from '@/config/editorConfig'
import { useToastModal } from '../modals/useToastModal'

/**
 * Removal threshold for background removal
 */
const colorRemovalThreshold = ref(editorConfig.defaultThreshold)

/**
 * Auto removal threshold for automatic background removal
 */
const autoRemovalThreshold = ref(editorConfig.defaultAutoRemovalThreshold)

/**
 * Selected manual tool ('brush' | 'eraser')
 */
const manualSelectedTool = ref('brush') // 'brush' | 'eraser'

/**
 * Size of the manual tool
 */
const manualToolSize = ref(0)

export function useBackgroundRemovalTool(imageStore, historyStore, workspaceStore, editorStore, t) {
  const { showConfirmModal } = useConfirmModal()
  const { showToastModal } = useToastModal()

  /**
   * Watch for manual tool size changes in store and update local value
   */
  watch(
    () => editorStore.cursorSize,
    (newSize) => {
      manualToolSize.value = newSize
    },
    { immediate: true },
  )

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
   * Watch for removal threshold changes and re-apply color selection
   */
  watch(colorRemovalThreshold, () => {
    selectColorClick()
  })

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
  // Manual
  // ----------------------------------

  /**
   * Whether to use original image as base for manual removal
   */
  const useBaseImage = ref(false)

  /**
   * Whether to replace current selection with object detection result
   */
  const replaceSelection = ref(true)

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
   * Watch for active tab changes and reset manual tool size if it exceeds maximum to maximum
   */
  watch(
    () => workspaceStore.activeTabIndex,
    () => {
      if (manualToolSize.value > manualMaxToolSize.value) {
        manualToolSize.value = manualMaxToolSize.value
      }
    },
    { immediate: true },
  )

  /**
   * Minimum size of the manual tool (2px)
   */
  const manualMinToolSize = editorConfig.minManualToolSize

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

    // Save canvas to store
    const imageDataToSave = ctx.getImageData(0, 0, canvas.width, canvas.height)
    imageStore.removalCanvasOriginal = imageDataToSave
    imageStore.removalCanvas = imageDataToSave
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

    // Save canvas to store
    const imageDataToSave = ctx.getImageData(0, 0, canvas.width, canvas.height)
    imageStore.removalCanvasOriginal = imageDataToSave

    applyCombinedMaskAdjustments(boundaryOffset.value, softEdgesRadius.value)
  }

  /**
   * Change size of the manual tool
   * @param {number} size - New size in pixels
   */
  const changeManualToolSize = (size) => {
    editorStore.cursorSize = size
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

    // Save canvas to store
    const imageDataToSave = ctx.getImageData(0, 0, canvas.width, canvas.height)
    imageStore.removalCanvasOriginal = imageDataToSave

    applyCombinedMaskAdjustments(boundaryOffset.value, softEdgesRadius.value)
  }

  // ----------------------------------
  // Auto selection
  // ----------------------------------
  /**
   * Automatically selects a region similar to the clicked area.
   * Works like Photoshop's smart object selection (region growing).
   * @param {number} clickX - X coordinate of click on canvas
   * @param {number} clickY - Y coordinate of click on canvas
   * @param {boolean} shiftKey - Whether Shift key is pressed (to add to selection)
   * @param {boolean} altKey - Whether Alt key is pressed (to use eraser)
   */
  const autoSelectSimilarRegion = (clickX, clickY, shiftKey, altKey) => {
    const canvas = document.getElementById('removalCanvas')
    if (!canvas) return
    const ctx = canvas.getContext('2d', { willReadFrequently: true })

    const width = canvas.width
    const height = canvas.height

    // Start from stored original mask if it exists, otherwise create empty
    let manualImageData
    if (imageStore.removalCanvasOriginal) {
      manualImageData = new ImageData(
        new Uint8ClampedArray(imageStore.removalCanvasOriginal.data),
        width,
        height,
      )
    } else {
      manualImageData = ctx.createImageData(width, height)
    }
    const manualData = manualImageData.data

    // Reset mask if not adding to selection
    if (!shiftKey && !altKey) {
      manualData.fill(0)
    }

    // Get rendered image
    const img = imageStore.getRenderedImage({ t, renderCall: false })
    if (!img) return

    // Draw current rendered image to a temporary canvas
    const tempCanvas = document.createElement('canvas')
    tempCanvas.width = width
    tempCanvas.height = height
    const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true })
    tempCtx.drawImage(img, 0, 0, width, height)

    const imageData = tempCtx.getImageData(0, 0, width, height)
    const data = imageData.data

    // Get clicked pixel color
    const index = (Math.floor(clickY) * width + Math.floor(clickX)) * 4
    const targetR = data[index]
    const targetG = data[index + 1]
    const targetB = data[index + 2]

    // Prepare visited mask and output selection
    const visited = new Uint8Array(width * height)
    const stack = [[Math.floor(clickX), Math.floor(clickY)]]

    const getPixelIndex = (x, y) => (y * width + x) * 4
    const getDistance = (r, g, b) =>
      Math.sqrt((r - targetR) ** 2 + (g - targetG) ** 2 + (b - targetB) ** 2)

    // Get highlight color
    const { fillR, fillG, fillB, fillA } = getHighlightColorRGBA()

    // Region growing
    while (stack.length > 0) {
      const [x, y] = stack.pop()
      if (x < 0 || x >= width || y < 0 || y >= height) continue
      const idx = y * width + x
      if (visited[idx]) continue

      const pix = getPixelIndex(x, y)
      const r = data[pix]
      const g = data[pix + 1]
      const b = data[pix + 2]
      const dist = getDistance(r, g, b)

      // Convert colorRemovalThreshold from 0-1 to 0-441.67 range
      const maxDist = Math.sqrt(255 ** 2 + 255 ** 2 + 255 ** 2) / 2 // ~441.67 / 2 = 220.83 - half to make it less sensitive
      const colorThreshold = maxDist * autoRemovalThreshold.value

      if (dist <= colorThreshold) {
        visited[idx] = 1

        // Apply or erase highlight based on modifier key
        if (altKey) {
          // Erase region: set alpha to 0 (fully transparent)
          manualData[pix] = 0
          manualData[pix + 1] = 0
          manualData[pix + 2] = 0
          manualData[pix + 3] = 0
        } else {
          // Add region: apply highlight color
          manualData[pix] = fillR
          manualData[pix + 1] = fillG
          manualData[pix + 2] = fillB
          manualData[pix + 3] = fillA
        }

        stack.push([x + 1, y])
        stack.push([x - 1, y])
        stack.push([x, y + 1])
        stack.push([x, y - 1])
      }
    }

    // Save new mask
    imageStore.removalCanvasOriginal = manualImageData

    applyCombinedMaskAdjustments(boundaryOffset.value, softEdgesRadius.value)
  }

  /**
   * Mark background color on canvas
   */
  const selectColorClick = () => {
    const canvas = document.getElementById('removalCanvas')
    if (!canvas) return

    if (imageStore.needMergeOverlay) {
      imageStore.mergeOverlayIntoImage()
      showToastModal(
        'info',
        t('tools.infoOverlayWasMerged.title'),
        t('tools.infoOverlayWasMerged.message'),
      )
    }

    const ctx = canvas.getContext('2d')

    const width = canvas.width
    const height = canvas.height

    // Start from stored original mask if it exists, otherwise create empty
    let manualImageData
    if (imageStore.removalCanvasOriginal) {
      manualImageData = new ImageData(
        new Uint8ClampedArray(imageStore.removalCanvasOriginal.data),
        width,
        height,
      )
    } else {
      manualImageData = ctx.createImageData(width, height)
    }
    const manualData = manualImageData.data

    if (replaceSelection.value) {
      // Completely reset mask
      manualData.fill(0)
    }

    // Get rendered image
    const img = imageStore.getRenderedImage({ t, renderCall: false })
    if (!img) return

    // Background color + threshold
    const bgColor = hexToRgb(colorBackgroundColor.value)
    const maxDist = Math.sqrt(255 ** 2 + 255 ** 2 + 255 ** 2) // ~441.67
    const threshold = maxDist * colorRemovalThreshold.value

    // Draw rendered image to temp canvas
    const tempCanvas = document.createElement('canvas')
    tempCanvas.width = width
    tempCanvas.height = height
    const tempCtx = tempCanvas.getContext('2d')
    tempCtx.drawImage(img, 0, 0, width, height)
    const imageData = tempCtx.getImageData(0, 0, width, height)
    const data = imageData.data

    // Get highlight color RGBA
    const { fillR, fillG, fillB, fillA } = getHighlightColorRGBA()

    // Apply new selection on top of stored original mask
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

    // Save original mask to store
    imageStore.removalCanvasOriginal = manualImageData

    applyCombinedMaskAdjustments(boundaryOffset.value, softEdgesRadius.value)
  }

  // ----------------------------------
  // Soft edges and Boundary offset
  // ----------------------------------
  const softEdgesRadius = ref(0)
  const boundaryOffset = ref(0)

  /**
   * Watch for changes in either soft edges or boundary offset
   * and re-apply combined mask processing
   */
  watch([softEdgesRadius, boundaryOffset], ([newSoft, newOffset]) => {
    applyCombinedMaskAdjustments(newOffset, newSoft)
  })

  /**
   * Apply boundary shift and feathering together, in the correct order
   * @param {number} offset - Positive to expand, negative to shrink
   * @param {number} featherRadius - Radius in pixels for feathering
   */
  const applyCombinedMaskAdjustments = (offset, featherRadius) => {
    const canvas = document.getElementById('removalCanvas')
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    if (!imageStore.removalCanvasOriginal) return

    // Start from original mask data
    const baseMask = new ImageData(
      new Uint8ClampedArray(imageStore.removalCanvasOriginal.data),
      canvas.width,
      canvas.height,
    )

    // Apply boundary offset first
    const offsetMask = adjustMaskBoundary(baseMask, canvas.width, canvas.height, offset)

    // Apply feathering on top of that
    const featheredMask = featherMask(offsetMask, canvas.width, canvas.height, featherRadius) // FeatherRadius is strength here

    // Draw and store
    ctx.putImageData(featheredMask, 0, 0)
    imageStore.removalCanvas = featheredMask
  }

  /**
   * Feather mask (blur edges of selection) with adjustable strength
   * @param {ImageData} maskData
   * @param {number} width
   * @param {number} height
   * @param {number} strength - 0 = no blur, 1 = full blur
   * @param {number} radius - radius in pixels
   */
  const featherMask = (maskData, width, height, strength = 0, radius = 2) => {
    if (radius <= 0 || strength <= 0) return maskData // No feathering

    const data = maskData.data
    const newData = new Uint8ClampedArray(data.length)

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let rSum = 0,
          gSum = 0,
          bSum = 0,
          aSum = 0,
          count = 0

        for (let dy = -radius; dy <= radius; dy++) {
          for (let dx = -radius; dx <= radius; dx++) {
            const nx = x + dx
            const ny = y + dy
            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
              const idx = (ny * width + nx) * 4
              rSum += data[idx]
              gSum += data[idx + 1]
              bSum += data[idx + 2]
              aSum += data[idx + 3]
              count++
            }
          }
        }

        const idx = (y * width + x) * 4
        const rBlur = rSum / count
        const gBlur = gSum / count
        const bBlur = bSum / count
        const aBlur = aSum / count

        // Mix original value with blurred value according to strength
        newData[idx] = data[idx] * (1 - strength) + rBlur * strength
        newData[idx + 1] = data[idx + 1] * (1 - strength) + gBlur * strength
        newData[idx + 2] = data[idx + 2] * (1 - strength) + bBlur * strength
        newData[idx + 3] = data[idx + 3] * (1 - strength) + aBlur * strength
      }
    }

    maskData.data.set(newData)
    return maskData
  }

  /**
   * Expand or shrink mask boundaries by given pixel offset.
   * Positive offset expands (adds pixels), negative shrinks (removes pixels).
   * @param {ImageData} maskData - Binary/alpha mask (white = selected)
   * @param {number} width
   * @param {number} height
   * @param {number} offset - pixels to expand (>0) or shrink (<0)
   */
  const adjustMaskBoundary = (maskData, width, height, offset = 0) => {
    if (offset === 0) return maskData

    const data = maskData.data
    const newData = new Uint8ClampedArray(data.length)
    const radius = Math.abs(offset)

    // Helper to get alpha channel (selection)
    const getAlpha = (x, y) => {
      if (x < 0 || x >= width || y < 0 || y >= height) return 0
      return data[(y * width + x) * 4 + 3]
    }

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4

        // Skip edge pixels to prevent modifying image border
        if (x < radius || y < radius || x >= width - radius || y >= height - radius) {
          // Keep original pixel unchanged
          newData[idx] = data[idx]
          newData[idx + 1] = data[idx + 1]
          newData[idx + 2] = data[idx + 2]
          newData[idx + 3] = data[idx + 3]
          continue
        }
        let newAlpha

        if (offset > 0) {
          // Dilation: expand selection
          newAlpha = 0
          for (let dy = -radius; dy <= radius; dy++) {
            for (let dx = -radius; dx <= radius; dx++) {
              if (getAlpha(x + dx, y + dy) > 128) {
                newAlpha = 255
                break
              }
            }
            if (newAlpha === 255) break
          }
        } else {
          // Erosion: shrink selection
          newAlpha = 255
          for (let dy = -radius; dy <= radius; dy++) {
            for (let dx = -radius; dx <= radius; dx++) {
              if (getAlpha(x + dx, y + dy) < 128) {
                newAlpha = 0
                break
              }
            }
            if (newAlpha === 0) break
          }
        }

        // Keep RGB same, only modify alpha
        newData[idx] = data[idx]
        newData[idx + 1] = data[idx + 1]
        newData[idx + 2] = data[idx + 2]
        newData[idx + 3] = newAlpha
      }
    }

    maskData.data.set(newData)
    return maskData
  }

  // ----------------------------------
  // Apply
  // ----------------------------------
  /**
   * Apply background removal
   *
   * @param {string} removalType - Type of removal ('color', 'manual', 'auto')
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
  }

  /**
   * Apply background removal rendering
   */
  const applyBackgroundRemovalRender = async () => {
    if (editorStore.selectedToolKey !== 'backgroundRemoval') return

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

    if (imageStore.needRasterization) {
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

    const changed = applyRemovalRender()
    if (!changed) return // Skip history if mask was empty

    historyStore.push(imageStore.getSnapshot(t))
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

    // Check if mask contains any non-zero alpha (non-empty mask)
    let hasMask = false
    for (let i = 3; i < maskPixels.length; i += 4) {
      if (maskPixels[i] > 0) {
        hasMask = true
        break
      }
    }
    if (!hasMask) return false // mask is empty, skip processing

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

    // Apply mask: remove/replace based on mask alpha
    for (let i = 0; i < data.length; i += 4) {
      const maskA = maskPixels[i + 3] // alpha channel

      if (maskA > 0) {
        // Use alpha as blending factor
        const alpha = maskA / 255

        // Linear blend between background and original pixel
        data[i] = data[i] * (1 - alpha) + bgR * alpha
        data[i + 1] = data[i + 1] * (1 - alpha) + bgG * alpha
        data[i + 2] = data[i + 2] * (1 - alpha) + bgB * alpha
        data[i + 3] = data[i + 3] * (1 - alpha) + bgA * alpha
      }
    }

    ctx.putImageData(imageData, 0, 0)
    imageStore.setRenderedImage(canvas)

    // Clear manual selection
    clearAllSelections()

    return true // success
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
    // detectObjectsClick,
    replaceSelection,
    highlightColor,
    selectColorClick,
    highlightRemovedPixels,
    backgroundReplacementColor,
    replaceWithBackgroundColor,
    softEdgesRadius,
    boundaryOffset,
    autoSelectSimilarRegion,
    autoRemovalThreshold,
    applyBackgroundRemovalRender,
  }
}
