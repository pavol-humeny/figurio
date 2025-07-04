import { useConfirmModal } from '../modals/useConfirmModal'
import { computed } from 'vue'

export function useGrayscaleTool(imageStore, historyStore, t) {
  const { showConfirmModal } = useConfirmModal()

  const isGrayscaleApplied = computed(() => {
    return imageStore.hasGrayscaleOperation()
  })

  const applyGrayscale = () => {
    imageStore.addImageOperation({
      type: 'grayscale',
      enabled: true,
    })

    applyGrayscaleRender()

    historyStore.push(imageStore.getSnapshot())
  }

  const applyGrayscaleRender = async () => {
    if (!imageStore.renderedImage) return

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

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = imageStore.renderedImage

    canvas.width = img.width
    canvas.height = img.height

    ctx.drawImage(img, 0, 0)
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]
      const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b)
      data[i] = data[i + 1] = data[i + 2] = gray
    }

    ctx.putImageData(imageData, 0, 0)

    imageStore.renderedImage = canvas
  }

  return {
    applyGrayscale,
    applyGrayscaleRender,
    isGrayscaleApplied,
  }
}
