import { useConfirmModal } from '../modals/useConfirmModal'
import { computed } from 'vue'
import { useSendEvent } from '@/composables/common/useSendEvent'
import { useMath } from '../common/useMath'
/**
 * Logic for applying grayscale
 *
 * @param {object} imageStore - Store containing image data and operations
 * @param {object} historyStore - Store for undo/redo history
 * @param {Function} t - Translation function from vue-i18n
 * @returns {object} Grayscale tool methods and state
 */
export function useGrayscaleTool(imageStore, historyStore, t) {
  const { showConfirmModal } = useConfirmModal()
  const { round } = useMath()

  /**
   * Check if grayscale operation is already applied
   */
  const isGrayscaleApplied = computed(() => {
    return imageStore.hasGrayscaleOperation()
  })

  /**
   * Apply grayscale operation and push to history
   * Prompts rasterization if vector elements are present
   */
  const applyGrayscale = async () => {
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

    imageStore.addImageOperation({
      type: 'grayscale',
      enabled: true,
    })

    useSendEvent().sendEvent('toolSettings', 'grayscale', 'create', {
      settings: { grayscale: true },
    })

    applyGrayscaleRender()

    historyStore.push(imageStore.getSnapshot(t))
  }

  /**
   * Convert the current rendered image to grayscale
   * using luminosity method on pixel data
   */
  const applyGrayscaleRender = () => {
    if (!imageStore.getRenderedImage({ t, renderCall: false })) return

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = imageStore.getRenderedImage({ t, renderCall: false })

    canvas.width = img.width
    canvas.height = img.height

    ctx.drawImage(img, 0, 0)
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]
      const gray = round(0.299 * r + 0.587 * g + 0.114 * b)
      data[i] = data[i + 1] = data[i + 2] = gray
    }

    ctx.putImageData(imageData, 0, 0)

    imageStore.setRenderedImage(canvas)
  }

  return {
    applyGrayscale,
    applyGrayscaleRender,
    isGrayscaleApplied,
  }
}
