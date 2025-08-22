import { useConfirmModal } from '../modals/useConfirmModal'
import { useSendEvent } from '@/composables/common/useSendEvent'
import { useMath } from '../common/useMath'
import { degrees, PDFDocument } from 'pdf-lib'

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

  const { round } = useMath()

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

    useSendEvent().sendEvent('toolSettings', 'rotate', null, {
      settings: {
        angle: angle,
      },
    })

    await applyRotationRender(angle)

    // Push to undo history
    historyStore.push(imageStore.getSnapshot(t))
  }

  /**
   * Rotate the canvas image by the specified angle
   *
   * @param {number} angle - Angle in degrees
   */
  const applyRotationRender = async (angle) => {
    if (!imageStore.getRenderedImage({ t, renderCall: false }) || !angle) return

    if (imageStore.fileType === 'pdf' && imageStore.pdfPageBytes) {
      try {
        const existingPdf = await PDFDocument.load(imageStore.pdfPageBytes)
        const oldPage = existingPdf.getPage(0)

        const oldWidth = oldPage.getWidth()
        const oldHeight = oldPage.getHeight()

        // Create new pdf
        const newPdf = await PDFDocument.create()

        // Create new page with correct dimensions (for 90/270 swap width/height)
        let newWidth = oldWidth
        let newHeight = oldHeight
        const normalizedAngle = ((-angle % 360) + 360) % 360
        if (normalizedAngle === 90 || normalizedAngle === 270) {
          newWidth = oldHeight
          newHeight = oldWidth
        }
        const newPage = newPdf.addPage([newWidth, newHeight])

        // Embed old page
        const [embeddedPage] = await newPdf.embedPages([oldPage])

        // Calculate transformation for physical rotation
        let x = 0
        let y = 0
        let rotate = degrees(0)
        switch (normalizedAngle) {
          case 0:
            x = 0
            y = 0
            rotate = degrees(0)
            break
          case 90:
            x = newWidth
            y = 0
            rotate = degrees(90)
            break
          case 180:
            x = newWidth
            y = newHeight
            rotate = degrees(180)
            break
          case 270:
            x = 0
            y = newHeight
            rotate = degrees(270)
            break
        }

        // Draw embedded page with transformation
        newPage.drawPage(embeddedPage, {
          x,
          y,
          width: oldWidth,
          height: oldHeight,
          rotate,
        })

        imageStore.pdfPageBytes = await newPdf.save()
        console.log('PDF rotated physically to', normalizedAngle, 'degrees')
      } catch (e) {
        console.error('Error rotating PDF:', e)
      }
    }

    const radians = (angle * Math.PI) / 180

    const oldCanvas = imageStore.getRenderedImage({ t, renderCall: false })
    const oldWidth = oldCanvas.width
    const oldHeight = oldCanvas.height

    const sin = Math.abs(Math.sin(radians))
    const cos = Math.abs(Math.cos(radians))

    const rotatedWidth = round(oldWidth * cos + oldHeight * sin)
    const rotatedHeight = round(oldWidth * sin + oldHeight * cos)

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
