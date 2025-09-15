import { ref, watch } from 'vue'
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

export function useBackgroundRemovalTool(imageStore, historyStore, workspaceStore, t) {
  const { showConfirmModal } = useConfirmModal()

  /**
   * Background color for removal
   */
  const backgroundColor = ref(editorConfig.defaultBackgroundColor)

  /**
   * Removal threshold for background removal
   */
  const removalThreshold = ref(editorConfig.defaultThreshold)

  /**
   * Available options for removal threshold
   */
  const removalThresholdOptions = [
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

  watch(removalThreshold, () => {
    resetCache()
  })

  watch(backgroundColor, () => {
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

  /**
   * Apply background removal
   */
  const applyBackgroundRemoval = async () => {
    imageStore.addImageOperation({
      type: 'backgroundRemoval',
      backgroundColor: backgroundColor.value,
      threshold: removalThreshold.value,
    })

    useSendEvent().sendEvent('toolSettings', 'backgroundRemoval', null, {
      settings: {
        backgroundColor: backgroundColor.value,
        removalThreshold: removalThreshold.value,
      },
    })

    await applyBackgroundRemovalRender(backgroundColor.value, removalThreshold.value)

    historyStore.push(imageStore.getSnapshot(t))
  }

  /**
   * Apply background removal rendering
   * @param {*} backgroundColor Color to remove
   * @param {*} threshold Removal threshold
   */
  const applyBackgroundRemovalRender = async (backgroundColor, threshold) => {
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
  return {
    removalThreshold,
    removalThresholdOptions,
    applyBackgroundRemoval,
    backgroundColor,
  }
}
