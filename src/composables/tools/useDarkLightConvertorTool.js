import { useConfirmModal } from '../modals/useConfirmModal'
import { useApi } from '@/composables/common/useApi'
const { addUserEvent } = useApi()
import { useImagePipeline } from '../editor/useImagePipeline.js'

export function useDarkLightConvertorTool(imageStore, editorStore, uiStore, historyStore, t) {
  const { showConfirmModal } = useConfirmModal()
  const { renderUpTo } = useImagePipeline(imageStore, uiStore)

  const applyDarkLightConvertor = async () => {
    if (imageStore.fileType === 'pdf') {
      const confirmed = await showConfirmModal(
        t('tools.confirmNeedBaseImageRasterization.title'),
        t('tools.confirmNeedBaseImageRasterization.message'),
        t('tools.confirmNeedBaseImageRasterization.cancel'),
        t('tools.confirmNeedBaseImageRasterization.confirm'),
      )
      if (!confirmed) return

      // await imageStore.rasterizeBaseImage(t)

      imageStore.addImageOperation({
        type: 'rasterizePdf',
        params: {},
        cost: 'high',
        affectsGeometry: false,
      })

      addUserEvent('applyOperation', {
        tool: 'rasterizePdf',
        settings: {},
      })

      await renderUpTo(imageStore.renderPipeline.currentOpIndex + 1, { t, imageStore })
    }

    if (imageStore.needRasterization) {
      const confirmed = await showConfirmModal(
        t('tools.confirmNeedRasterization.title'),
        t('tools.confirmNeedRasterization.message'),
        t('tools.confirmNeedRasterization.cancel'),
        t('tools.confirmNeedRasterization.confirm'),
      )
      if (confirmed) {
        const result = await imageStore.rasterize('editor', {}, t)

        imageStore.addImageOperation({
          type: 'rasterize',
          params: {
            overlay: result.overlay,
          },
          cost: 'high',
          affectsGeometry: true,
        })

        addUserEvent('applyOperation', {
          tool: 'rasterize',
          settings: {},
        })

        await renderUpTo(imageStore.renderPipeline.currentOpIndex + 1, { t, imageStore })
      } else {
        return
      }
    }

    // if (imageStore.needMergeOverlay) {
    //   imageStore.mergeOverlayIntoImage()
    //   showToastModal(
    //     'info',
    //     t('tools.infoOverlayWasMerged.title'),
    //     t('tools.infoOverlayWasMerged.message'),
    //   )
    // }

    imageStore.addImageOperation({
      type: 'darkLightConvertor',
    })

    addUserEvent('applyOperation', {
      tool: 'darkLightConvertor',
      settings: {},
    })

    applyDarkLightConvertorRender()

    historyStore.push(imageStore.getSnapshot(t))
  }

  // --- Compute dominant color from entire image ---
  const getDominantColor = (imageData) => {
    const histR = new Array(256).fill(0)
    const histG = new Array(256).fill(0)
    const histB = new Array(256).fill(0)
    const data = imageData.data

    for (let i = 0; i < data.length; i += 4) {
      histR[data[i]]++
      histG[data[i + 1]]++
      histB[data[i + 2]]++
    }

    const dominantR = histR.indexOf(Math.max(...histR))
    const dominantG = histG.indexOf(Math.max(...histG))
    const dominantB = histB.indexOf(Math.max(...histB))

    return { r: dominantR, g: dominantG, b: dominantB }
  }

  // --- Replace dark/background pixels with light color ---
  const applyBackgroundReplacement = (imageData, threshold, replColor) => {
    const data = imageData.data
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i],
        g = data[i + 1],
        b = data[i + 2]
      const L = 0.299 * r + 0.587 * g + 0.114 * b

      if (L < threshold) {
        data[i] = replColor.r
        data[i + 1] = replColor.g
        data[i + 2] = replColor.b
      }
    }
  }

  // --- Unblend / brighten text pixels ---
  const applyUnblend = (imageData, dominantColor, replColor) => {
    const data = imageData.data
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i],
        g = data[i + 1],
        b = data[i + 2]
      const ar = 1 - Math.abs(r - dominantColor.r) / 255
      const ag = 1 - Math.abs(g - dominantColor.g) / 255
      const ab = 1 - Math.abs(b - dominantColor.b) / 255
      const alpha = Math.max(0, Math.min(1, Math.max(ar, ag, ab)))

      if (alpha < 0.05) continue

      let tr = (r - dominantColor.r * (1 - alpha)) / alpha
      let tg = (g - dominantColor.g * (1 - alpha)) / alpha
      let tb = (b - dominantColor.b * (1 - alpha)) / alpha

      tr = Math.min(255, Math.max(0, tr))
      tg = Math.min(255, Math.max(0, tg))
      tb = Math.min(255, Math.max(0, tb))

      data[i] = tr * alpha + replColor.r * (1 - alpha)
      data[i + 1] = tg * alpha + replColor.g * (1 - alpha)
      data[i + 2] = tb * alpha + replColor.b * (1 - alpha)
    }
  }

  const lightenDarkPixels = (imageData) => {
    const data = imageData.data
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i],
        g = data[i + 1],
        b = data[i + 2]
      const L = 0.299 * r + 0.587 * g + 0.114 * b

      if (L < 50) {
        // Linear lighten: move pixel towards white
        const lightenFactor1 = 0.9
        data[i] = r + (255 - r) * lightenFactor1
        data[i + 1] = g + (255 - g) * lightenFactor1
        data[i + 2] = b + (255 - b) * lightenFactor1
        // Add transparency effect
        data[i + 3] = data[i + 3] * 0.7
      } else if (L < 100) {
        const lightenFactor2 = 0.6
        data[i] = r + (255 - r) * lightenFactor2
        data[i + 1] = g + (255 - g) * lightenFactor2
        data[i + 2] = b + (255 - b) * lightenFactor2
        // Add transparency effect
        data[i + 3] = data[i + 3] * 0.85
      } else if (L < 150) {
        const lightenFactor3 = 0.1
        data[i] = r + (255 - r) * lightenFactor3
        data[i + 1] = g + (255 - g) * lightenFactor3
        data[i + 2] = b + (255 - b) * lightenFactor3
      }

      // Make too light pixels darker
      if (L > 220 && L <= 235) {
        const darkenFactor = 0.8
        data[i] = r * darkenFactor
        data[i + 1] = g * darkenFactor
        data[i + 2] = b * darkenFactor
      }
    }
  }

  // --- Main render function ---
  const applyDarkLightConvertorRender = async () => {
    const img = imageStore.getRenderedImage({ t, renderCall: false })
    if (!img) return

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    canvas.width = img.width
    canvas.height = img.height

    ctx.drawImage(img, 0, 0)
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

    uiStore.isApplying = true
    try {
      const dominantColor = getDominantColor(imageData)
      const bgL = 0.299 * dominantColor.r + 0.587 * dominantColor.g + 0.114 * dominantColor.b
      const threshold = bgL + 15

      const replColor = { r: 245, g: 245, b: 245 }

      // --- Replace dark/background pixels ---
      applyBackgroundReplacement(imageData, threshold, replColor)

      // console.log('Dominant Color:', dominantColor)
      // console.log('Background Luminance:', bgL)
      // console.log('Threshold:', threshold)

      // // invert pixels pod threshold
      lightenDarkPixels(imageData)

      // --- Unblend text pixels (still commented) ---
      // applyUnblend(imageData, dominantColor, replColor)

      ctx.putImageData(imageData, 0, 0)
      imageStore.setRenderedImage(canvas)
    } finally {
      uiStore.isApplying = false
    }
  }

  return {
    applyDarkLightConvertor,
    applyDarkLightConvertorRender,
  }
}
