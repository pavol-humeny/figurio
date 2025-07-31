import { ref, watch } from 'vue'
import { useConfirmModal } from '../modals/useConfirmModal'
import { useMath } from '../common/useMath'
import { editorConfig } from '@/config/editorConfig'
import { useToastModal } from '../modals/useToastModal'

/**
 * Whether the crop box is currently shown
 */
const isCropShown = ref(false)

/**
 * Color selected for the smart crop
 */
const selectedColor = ref(editorConfig.smartCropDefaultColor)

/**
 * Indents for the crop box
 */
const topIndent = ref(0)
const bottomIndent = ref(0)
const leftIndent = ref(0)
const rightIndent = ref(0)

/**
 * Limits for the crop box indents
 */
const topIndentMin = ref(0)
const topIndentMax = ref(0)
const rightIndentMin = ref(0)
const rightIndentMax = ref(0)
const bottomIndentMin = ref(0)
const bottomIndentMax = ref(0)
const leftIndentMin = ref(0)
const leftIndentMax = ref(0)

/**
 * Crop box object containing the indents and dimensions
 * @type {import('vue').Ref<{ topIndent: number, leftIndent: number, rightIndent: number, bottomIndent: number, width: number, height: number }>}
 */
const cropBox = ref({
  topIndent: 0,
  leftIndent: 0,
  rightIndent: 0,
  bottomIndent: 0,
  width: 0,
  height: 0,
})

/**
 * Logic for the smart crop tool
 * @param {import('@/stores/imageStore').ImageStore} imageStore - The image store
 * @param {import('@/stores/historyStore').HistoryStore} historyStore - The history store
 * @param {import('@/stores/editorStore').EditorStore} editorStore - The editor store
 * @param {function} t - Translation function
 * @return {Object} - Composable methods and reactive properties
 */
export function useSmartCropTool(imageStore, historyStore, editorStore, t) {
  const { showConfirmModal } = useConfirmModal()
  const { showToastModal } = useToastModal()
  const { clamp } = useMath()

  /**
   * Watch for changes in the rendered image and reset the crop box
   */
  watch(
    () => imageStore.getRenderedImage({ t, renderCall: false }),
    () => {
      resetCropBox()
    },
  )

  /**
   * Watch for changes in the file dimensions and update the crop box limits
   */
  watch(
    () => imageStore.fileDimensions,
    (fileDimensions) => {
      if (fileDimensions.width && fileDimensions.height) {
        topIndentMax.value = fileDimensions.height - bottomIndent.value
        rightIndentMax.value = fileDimensions.width - leftIndent.value
        bottomIndentMax.value = fileDimensions.height - topIndent.value
        leftIndentMax.value = fileDimensions.width - rightIndent.value
      }
    },
    { immediate: true, deep: true },
  )

  /**
   * Watch for changes in the crop box indents and update the crop box dimensions
   */
  watch(topIndent, (value) => {
    cropBox.value.topIndent = clamp(value, topIndentMin.value, topIndentMax.value)
    cropBox.value.height =
      imageStore.fileDimensions.height - cropBox.value.topIndent - bottomIndent.value

    bottomIndentMax.value = imageStore.fileDimensions.height - cropBox.value.topIndent
  })
  watch(bottomIndent, (value) => {
    cropBox.value.bottomIndent = clamp(value, bottomIndentMin.value, bottomIndentMax.value)
    cropBox.value.height =
      imageStore.fileDimensions.height - topIndent.value - cropBox.value.bottomIndent

    topIndentMax.value = imageStore.fileDimensions.height - cropBox.value.bottomIndent
  })
  watch(leftIndent, (value) => {
    cropBox.value.leftIndent = clamp(value, leftIndentMin.value, leftIndentMax.value)
    cropBox.value.width =
      imageStore.fileDimensions.width - cropBox.value.leftIndent - rightIndent.value

    rightIndentMax.value = imageStore.fileDimensions.width - cropBox.value.leftIndent
  })
  watch(rightIndent, (value) => {
    cropBox.value.rightIndent = clamp(value, rightIndentMin.value, rightIndentMax.value)
    cropBox.value.width =
      imageStore.fileDimensions.width - leftIndent.value - cropBox.value.rightIndent

    leftIndentMax.value = imageStore.fileDimensions.width - cropBox.value.rightIndent
  })

  /**
   * Watch for changes in the selected color and reset the crop box
   */
  watch(selectedColor, (value) => {
    resetCropBox()
    selectedColor.value = value
  })

  /**
   * Watch for changes in the selected tool and tab to show or hide the crop box
   */
  watch(
    () => ({
      tool: editorStore.selectedToolKey,
      tab: editorStore.selectedTabPerTool[editorStore.selectedToolKey],
    }),
    (newVal) => {
      if (newVal.tool === 'smartCrop' && newVal.tab === 'manual') {
        editorStore.selectSubTool('isCropShown')
        isCropShown.value = true
      }

      if (newVal.tool === 'smartCrop' && newVal.tab === 'auto') {
        editorStore.selectSubTool('')
        isCropShown.value = false
      }
    },
  )

  /**
   * Reset the crop box to default values
   */
  const resetCropBox = () => {
    selectedColor.value = editorConfig.smartCropDefaultColor

    isCropShown.value = false

    topIndent.value = 0
    bottomIndent.value = 0
    leftIndent.value = 0
    rightIndent.value = 0

    cropBox.value.topIndent = 0
    cropBox.value.leftIndent = 0
    cropBox.value.rightIndent = 0
    cropBox.value.bottomIndent = 0
    cropBox.value.width = imageStore.fileDimensions.width
    cropBox.value.height = imageStore.fileDimensions.height

    editorStore.selectSubTool('')
  }

  /**
   * Apply the auto smart crop based on the selected color
   */
  const applyAutoSmartCrop = async () => {
    imageStore.addImageOperation({
      type: 'smartCrop',
      color: structuredClone(selectedColor.value),
      cropBox: JSON.parse(JSON.stringify(cropBox.value)),
    })

    applyAutoSmartCropRender()

    historyStore.push(imageStore.getSnapshot(t))
  }

  /**
   * Apply the auto smart crop render with the specified color
   * @param {string} color - The color to use for the smart crop
   */
  const applyAutoSmartCropRender = async (color) => {
    const newCropBox = calculateIndents(color || selectedColor.value)

    await applyCrop(newCropBox)
  }

  /**
   * Show or hide the auto smart crop tool
   */
  const showAutoSmartCrop = async () => {
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

    calculateIndents(selectedColor.value)
    isCropShown.value = !isCropShown.value

    if (isCropShown.value) {
      editorStore.selectSubTool('isCropShown')
    } else {
      editorStore.selectSubTool('')
    }
  }

  /**
   * Apply the manual smart crop with the current crop box values
   */
  const applyManualSmartCrop = async () => {
    await applyCrop(cropBox.value)

    historyStore.push(imageStore.getSnapshot(t))
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

    // Set cropBox values for display
    topIndent.value = top
    bottomIndent.value = height - bottom - 1
    leftIndent.value = left
    rightIndent.value = width - right - 1

    cropBox.value.width = imageStore.fileDimensions.width - leftIndent.value - rightIndent.value
    cropBox.value.height = imageStore.fileDimensions.height - topIndent.value - bottomIndent.value

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

      resetCropBox()
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

    resetCropBox()
  }

  return {
    isCropShown,
    selectedColor,
    topIndentMin,
    topIndentMax,
    rightIndentMin,
    rightIndentMax,
    bottomIndentMin,
    bottomIndentMax,
    leftIndentMin,
    leftIndentMax,
    topIndent,
    bottomIndent,
    leftIndent,
    rightIndent,
    cropBox,
    showAutoSmartCrop,
    applyAutoSmartCrop,
    applyAutoSmartCropRender,
    applyManualSmartCrop,
    calculateIndents,
  }
}
