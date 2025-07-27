import { useConfirmModal } from '../modals/useConfirmModal'

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
export function useRotateTool(imageStore, historyStore, t) {
  const { showConfirmModal } = useConfirmModal()

  /**
   * Apply rotation to the image
   *
   * @param {number} angle - Angle to rotate in degrees
   * @returns {Promise<void>}
   */
  const applyRotation = async (angle) => {
    // Show confirmation if SVG objects need to be rasterized first
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

    // Register operation in the operation list
    imageStore.addImageOperation({
      type: 'rotation',
      angle: angle,
    })

    applyRotationRender(angle)

    // Push to undo history
    historyStore.push(imageStore.getSnapshot(t))
  }

  /**
   * Rotate the canvas image by the specified angle
   *
   * @param {number} angle - Angle in degrees
   */
  const applyRotationRender = (angle) => {
    if (!imageStore.getRenderedImage({ t, renderCall: false }) || !angle) return

    const radians = (angle * Math.PI) / 180

    const oldCanvas = imageStore.getRenderedImage({ t, renderCall: false })
    const oldWidth = oldCanvas.width
    const oldHeight = oldCanvas.height

    const sin = Math.abs(Math.sin(radians))
    const cos = Math.abs(Math.cos(radians))

    const rotatedWidth = Math.round(oldWidth * cos + oldHeight * sin)
    const rotatedHeight = Math.round(oldWidth * sin + oldHeight * cos)

    const canvas = document.createElement('canvas')
    canvas.width = rotatedWidth
    canvas.height = rotatedHeight
    const tempCtx = canvas.getContext('2d')

    tempCtx.translate(rotatedWidth / 2, rotatedHeight / 2)
    tempCtx.rotate(radians)
    tempCtx.drawImage(oldCanvas, -oldWidth / 2, -oldHeight / 2)

    imageStore.setRenderedImage(canvas)
    imageStore.fileDimensions.width = rotatedWidth
    imageStore.fileDimensions.height = rotatedHeight
    imageStore.fileDimensions.fileAspectRatio = rotatedWidth / rotatedHeight || 1
    imageStore.newFileDimensions = { ...imageStore.fileDimensions }
  }

  return {
    applyRotation,
    applyRotationRender,
  }
}
