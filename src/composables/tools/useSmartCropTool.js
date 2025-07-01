import { ref, watch } from 'vue'
import { useConfirmModal } from '../modals/useConfirmModal'
import { useMath } from '../common/useMath'
import { editorConfig } from '@/config/editorConfig'

const isCropShown = ref(false)

const selectedColor = ref(editorConfig.smartCropDefaultColor)

// Indents
const topIndent = ref(0)
const bottomIndent = ref(0)
const leftIndent = ref(0)
const rightIndent = ref(0)

// Limits
const topIndentMin = ref(0)
const topIndentMax = ref(1000)
const rightIndentMin = ref(0)
const rightIndentMax = ref(1000)
const bottomIndentMin = ref(0)
const bottomIndentMax = ref(1000)
const leftIndentMin = ref(0)
const leftIndentMax = ref(1000)

// Crop box values
const cropBox = ref({
  topIndent: 0,
  leftIndent: 0,
  rightIndent: 0,
  bottomIndent: 0,
  width: 0,
  height: 0,
})

export function useSmartCropTool(imageStore, historyStore, editorStore, t) {
  const { showConfirmModal } = useConfirmModal()
  const { clamp } = useMath()

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

  watch(
    () => imageStore.renderedImage,
    () => {
      resetCropBox()
    },
  )

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

  watch(topIndent, (value) => {
    cropBox.value.topIndent = clamp(value, topIndentMin.value, topIndentMax.value)
    cropBox.value.height =
      imageStore.fileDimensions.height - cropBox.value.topIndent - bottomIndent.value
    console.log('Top indent:', cropBox.value.topIndent, 'Height:', cropBox.value.height)

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

  watch(selectedColor, (value) => {
    resetCropBox()
    selectedColor.value = value
  })

  watch(
    () => ({
      tool: editorStore.selectedToolKey,
      tab: editorStore.selectedTabPerTool[editorStore.selectedToolKey],
    }),
    (newVal, oldVal) => {
      console.log('Zmena nástroja alebo tabu:')
      console.log('Stav predtým:', oldVal)
      console.log('Stav teraz:', newVal)

      if (newVal.tool === 'smartCrop' && newVal.tab === 'manual') {
        console.log('Manual smart crop tab selected')
        editorStore.selectSubTool('isCropShown')
        isCropShown.value = true
      }

      if (newVal.tool === 'smartCrop' && newVal.tab === 'auto') {
        console.log('Auto smart crop tab selected')
        editorStore.selectSubTool('')
        isCropShown.value = false
      }
    },
    { deep: false },
  )

  const applyAutoSmartCrop = async () => {
    if (imageStore.svgObjects.length > 0) {
      const confirmed = await showConfirmModal(
        t('tools.confirmNeedRasterization.title'),
        t('tools.confirmNeedRasterization.message'),
        t('tools.confirmNeedRasterization.cancel'),
        t('tools.confirmNeedRasterization.confirm'),
      )
      if (confirmed) {
        await imageStore.rasterize()
      } else {
        return
      }
    }

    const color = selectedColor.value

    imageStore.imageOperations.smartCrop.enabled = true
    imageStore.imageOperations.smartCrop.color = color
    // const newCrop = { ...cropBox.value }
    // const prevCrop = imageStore.imageOperations.smartCrop.cropBox
    // if (prevCrop) {
    //   newCrop.leftIndent += prevCrop.leftIndent || 0
    //   newCrop.topIndent += prevCrop.topIndent || 0
    // }
    imageStore.imageOperations.smartCrop.cropBox = cropBox.value

    applyAutoSmartCropRender(cropBox.value)

    historyStore.push(imageStore.getSnapshot())
  }

  const applyAutoSmartCropRender = async (cropBox) => {
    calculateIndents(selectedColor.value)
    await applyCrop(cropBox)
  }

  const showAutoSmartCrop = () => {
    calculateIndents(selectedColor.value)
    isCropShown.value = !isCropShown.value

    if (isCropShown.value) {
      editorStore.selectSubTool('isCropShown')
    } else {
      editorStore.selectSubTool('')
    }
  }

  const applyManualSmartCrop = async () => {
    console.log('Applying manual smart crop with crop box:', cropBox.value)
    await applyCrop(cropBox.value)

    historyStore.push(imageStore.getSnapshot())
  }

  const calculateIndents = (color) => {
    console.log('Calculating indents for color:', color)
    if (!imageStore.renderedImage) return

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = imageStore.renderedImage

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

    // Nastavenie hodnôt
    topIndent.value = top
    bottomIndent.value = height - bottom - 1
    leftIndent.value = left
    rightIndent.value = width - right - 1

    cropBox.value.width = imageStore.fileDimensions.width - leftIndent.value - rightIndent.value
    cropBox.value.height = imageStore.fileDimensions.height - topIndent.value - bottomIndent.value

    return cropBox.value
  }

  const applyCrop = async (cropBox) => {
    if (!imageStore.renderedImage) return

    // Create confirm modal to confirm rasterization if there are SVG objects
    if (imageStore.svgObjects.length > 0) {
      const confirmed = await showConfirmModal(
        t('tools.confirmNeedRasterization.title'),
        t('tools.confirmNeedRasterization.message'),
        t('tools.confirmNeedRasterization.cancel'),
        t('tools.confirmNeedRasterization.confirm'),
      )
      if (confirmed) {
        await imageStore.rasterize()
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
      imageStore.renderedImage,
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
    imageStore.renderedImage = canvas
    // imageStore.previewUrl = canvas.toDataURL()

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
