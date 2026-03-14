/**
 * @file: useRotateTool.js
 * @author: Pavol Humeny
 * @date: 15.5.2026
 */
import { useConfirmModal } from '../modals/useConfirmModal'
import { useApi } from '@/composables/common/useApi'
const { addUserEvent } = useApi()
import { useImagePipeline } from '../editor/useImagePipeline'

/**
 * Logic for the rotate tool including confirmation, operation registration, and canvas rendering
 *
 * @param {ReturnType<typeof useImageStore>} imageStore - Image store instance
 * @param {ReturnType<typeof useHistoryStore>} historyStore - History store instance
 * @param {Function} t - Translation function
 * @returns {{
 *   applyRotation: (angle: number) => Promise<void>,
 *   applyRotationRender: (angle: number) => void,
 * }}
 */
export function useRotateTool(imageStore, historyStore, uiStore, viewportStore, t) {
  const { showConfirmModal } = useConfirmModal()
  const { renderUpTo } = useImagePipeline(imageStore, uiStore)

  /**
   * Apply rotation to the image
   *
   * @param {number} angle - Angle to rotate in degrees
   * @returns {Promise<void>}
   */
  const applyRotation = async (angle) => {
    // Show confirmation if SVG objects need to be rasterized first
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

    // Register operation in the operation list
    imageStore.addImageOperation({
      type: 'rotate',
      params: { angle },
      cost: 'high',
      affectsGeometry: true,
    })

    addUserEvent('applyOperation', {
      tool: 'rotate',
      settings: { angle: angle },
    })

    await renderUpTo(imageStore.renderPipeline.currentOpIndex + 1, { t, imageStore })

    // Push to undo history
    historyStore.push(imageStore.getSnapshot(t))

    // Center image after rotation
    viewportStore.shouldFitToScreen = true
  }

  return {
    applyRotation,
  }
}
