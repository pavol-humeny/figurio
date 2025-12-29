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

    await renderUpTo(imageStore.renderPipeline.currentOpIndex + 1, { t, imageStore })

    historyStore.push(imageStore.getSnapshot(t))
  }

  return {
    applyFlip,
  }
}
