import { useConfirmModal } from '../modals/useConfirmModal'

export function useRotateTool(imageStore, historyStore, t) {
  const { showConfirmModal } = useConfirmModal()

  // function normalizeAngle(angle) {
  //   angle = ((((angle + 180) % 360) + 360) % 360) - 180
  //   return angle
  // }

  const applyRotation = async (angle) => {
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

    imageStore.addImageOperation({
      type: 'rotation',
      angle: angle,
    })

    applyRotationRender(angle)

    historyStore.push(imageStore.getSnapshot())
  }

  const applyRotationRender = (angle) => {
    if (!imageStore.renderedImage || !angle) return

    const radians = (angle * Math.PI) / 180

    const oldCanvas = imageStore.renderedImage
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
    // imageStore.previewUrl = imageStore.renderedImage.toDataURL()
  }

  return {
    applyRotation,
    applyRotationRender,
  }
}
