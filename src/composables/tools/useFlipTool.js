import { useConfirmModal } from '../modals/useConfirmModal'
import { useSendEvent } from '@/composables/common/useSendEvent'

/**
 * Logic for flipping the image and associated SVG elements
 *
 * @param {object} imageStore - Store containing image data and operations
 * @param {object} historyStore - Store for undo/redo history
 * @returns {object} Flip tool methods
 */
export function useFlipTool(imageStore, historyStore, t) {
  const { showConfirmModal } = useConfirmModal()

  /**
   * Add flip operation, apply transformation and push to history
   *
   * @param {'horizontal' | 'vertical'} direction - Flip direction
   */
  const applyFlip = (direction) => {
    if (direction === 'horizontal') {
      imageStore.addImageOperation({
        type: 'flip',
        direction: 'horizontal',
      })
    } else if (direction === 'vertical') {
      imageStore.addImageOperation({
        type: 'flip',
        direction: 'vertical',
      })
    }

    useSendEvent().sendEvent('toolSettings', 'flip', null, {
      settings: { direction },
    })

    applyFlipRender(direction)

    historyStore.push(imageStore.getSnapshot(t))
  }

  /**
   * Apply visual flip to rendered image and update SVG object positions
   *
   * @param {'horizontal' | 'vertical'} direction - Flip direction
   */
  const applyFlipRender = async (direction) => {
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

    const width = imageStore.getRenderedImage({ t, renderCall: false }).width
    const height = imageStore.getRenderedImage({ t, renderCall: false }).height

    // Flip raster
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height

    const ctx = canvas.getContext('2d')
    ctx.save()

    if (direction === 'horizontal') {
      ctx.translate(0, height)
      ctx.scale(1, -1)
    } else if (direction === 'vertical') {
      ctx.translate(width, 0)
      ctx.scale(-1, 1)
    }

    ctx.drawImage(imageStore.getRenderedImage({ t, renderCall: false }), 0, 0)
    ctx.restore()

    imageStore.setRenderedImage(canvas)
  }

  return {
    applyFlip,
    applyFlipRender,
  }
}
