import { useConfirmModal } from '../modals/useConfirmModal'
import { useApi } from '@/composables/common/useApi'
const { addUserEvent } = useApi()
import { useImagePipeline } from '../editor/useImagePipeline'

/**
 * Logic for flipping the image and associated SVG elements
 *
 * @param {object} imageStore - Store containing image data and operations
 * @param {object} historyStore - Store for undo/redo history
 * @returns {object} Flip tool methods
 */
export function useFlipTool(imageStore, historyStore, uiStore, t) {
  const { showConfirmModal } = useConfirmModal()
  const { renderUpTo } = useImagePipeline(imageStore, uiStore)

  /**
   * Add flip operation, apply transformation and push to history
   *
   * @param {'horizontal' | 'vertical'} direction - Flip direction
   */
  const applyFlip = async (direction) => {
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

    imageStore.addImageOperation({
      type: 'flip',
      params: { direction },
      cost: 'high',
      affectsGeometry: false,
    })

    addUserEvent('applyOperation', {
      tool: 'flip',
      settings: { direction },
    })

    await renderUpTo(imageStore.renderPipeline.currentOpIndex + 1)

    historyStore.push(imageStore.getSnapshot(t))
  }

  /**
   * Apply visual flip to rendered image and update SVG object positions
   *
   * @param {'horizontal' | 'vertical'} direction - Flip direction
   */
  const applyFlipRender = async (direction) => {
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
