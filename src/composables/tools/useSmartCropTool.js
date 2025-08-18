import { useConfirmModal } from '../modals/useConfirmModal'
import { editorConfig } from '@/config/editorConfig'
import { useToastModal } from '../modals/useToastModal'

/**
 * Logic for the auto crop tool for preset
 * @param {import('@/stores/imageStore').ImageStore} imageStore - The image store
 * @param {import('@/stores/historyStore').HistoryStore} historyStore - The history store
 * @param {import('@/stores/editorStore').EditorStore} editorStore - The editor store
 * @param {function} t - Translation function
 * @return {Object} - Composable methods and reactive properties
 */
export function useSmartCropTool(imageStore, t) {
  const { showConfirmModal } = useConfirmModal()
  const { showToastModal } = useToastModal()

  /**
   * Apply the auto smart crop render with the specified color
   * @param {string} color - The color to use for the smart crop
   */
  const applyAutoSmartCropRender = async (color) => {
    const newCropBox = calculateIndents(color)

    await applyCrop(newCropBox)
  }

  /**
   * Calculate the indents for the crop box based on the specified color
   * @param {string} color - The color to use for the smart crop
   * @returns {Object} - The calculated crop box with indents and dimensions
   */
  const calculateIndents = (color) => {
    if (!imageStore.getRenderedImage({ t, renderCall: false })) return

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = imageStore.getRenderedImage({ t, renderCall: false })

    const width = img.width
    const height = img.height

    canvas.width = width
    canvas.height = height

    ctx.drawImage(img, 0, 0)
    const imageData = ctx.getImageData(0, 0, width, height).data

    const parseHex = (hex) => {
      const bigint = parseInt(hex.replace('#', ''), 16)
      return {
        r: (bigint >> 16) & 255,
        g: (bigint >> 8) & 255,
        b: bigint & 255,
      }
    }

    const isColorMatch = (index, target) => {
      const r = imageData[index]
      const g = imageData[index + 1]
      const b = imageData[index + 2]
      const tolerance = editorConfig.smartCropColorTolerance
      return (
        Math.abs(r - target.r) <= tolerance &&
        Math.abs(g - target.g) <= tolerance &&
        Math.abs(b - target.b) <= tolerance
      )
    }

    const targetColor = parseHex(color)

    // Top
    let top = 0
    while (top < height) {
      let match = true
      for (let x = 0; x < width; x++) {
        const i = (top * width + x) * 4
        if (!isColorMatch(i, targetColor)) {
          match = false
          break
        }
      }
      if (!match) break
      top++
    }

    // Bottom
    let bottom = height - 1
    while (bottom >= 0) {
      let match = true
      for (let x = 0; x < width; x++) {
        const i = (bottom * width + x) * 4
        if (!isColorMatch(i, targetColor)) {
          match = false
          break
        }
      }
      if (!match) break
      bottom--
    }

    // Left
    let left = 0
    while (left < width) {
      let match = true
      for (let y = top; y <= bottom; y++) {
        const i = (y * width + left) * 4
        if (!isColorMatch(i, targetColor)) {
          match = false
          break
        }
      }
      if (!match) break
      left++
    }

    // Right
    let right = width - 1
    while (right >= 0) {
      let match = true
      for (let y = top; y <= bottom; y++) {
        const i = (y * width + right) * 4
        if (!isColorMatch(i, targetColor)) {
          match = false
          break
        }
      }
      if (!match) break
      right--
    }

    // Set cropBox values for cropping
    const cropBox2 = {
      topIndent: top,
      leftIndent: left,
      rightIndent: width - right - 1,
      bottomIndent: height - bottom - 1,
      width: width - left - (width - right - 1), // width: width - left - cropBox2.rightIndent,
      height: height - top - (height - bottom - 1), // height: height - top - cropBox2.bottomIndent,
    }

    return cropBox2
  }

  /**
   * Apply the crop based on the crop box values
   * @param {Object} cropBox - The crop box containing indents and dimensions
   */
  const applyCrop = async (cropBox) => {
    if (!imageStore.getRenderedImage({ t, renderCall: false })) return

    if (imageStore.svgObjects.length > 0) {
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

    if (
      cropBox.width === imageStore.fileDimensions.width &&
      cropBox.height === imageStore.fileDimensions.height
    ) {
      // No crop needed, just reset the crop box
      showToastModal(
        'info',
        t('tools.smartCrop.settings.noCropApplied.title'),
        t('tools.smartCrop.settings.noCropApplied.message'),
      )
      return
    }

    // Create confirm modal to confirm rasterization if there are SVG objects
    if (imageStore.svgObjects.length > 0) {
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

    const { topIndent, leftIndent, width, height } = cropBox

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    canvas.width = width
    canvas.height = height

    ctx.drawImage(
      imageStore.getRenderedImage({ t, renderCall: false }),
      leftIndent, // x
      topIndent, // y
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
    applyAutoSmartCropRender,
    calculateIndents,
  }
}
