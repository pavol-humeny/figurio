import { degrees, PDFDocument } from 'pdf-lib'

/**
 * Rotate operation for image and PDF
 * @param {object} params parameters
 * @param {HTMLCanvasElement} params.srcCanvas source canvas
 * @param {Uint8Array|null} params.srcPdfBytes source PDF bytes
 * @param {HTMLCanvasElement|null} params.srcOverlay source overlay canvas
 * @param {number} params.angle rotation angle in degrees
 * @param {function} params.round function to round numbers
 * @returns {{ canvas: HTMLCanvasElement, pdfBytes: Uint8Array|null, overlay: HTMLCanvasElement|null, dimensions: { width: number, height: number, fileAspectRatio: number } }} result
 */
export async function rotateOperation({ srcCanvas, srcPdfBytes, srcOverlay, angle, round }) {
  const radians = (angle * Math.PI) / 180

  let pdfBytes = srcPdfBytes ?? null
  let overlay = srcOverlay ?? null

  // ------------------------------------------------
  // PDF rotation
  // ------------------------------------------------
  if (pdfBytes) {
    const existingPdf = await PDFDocument.load(pdfBytes)
    const oldPage = existingPdf.getPage(0)

    const oldWidth = oldPage.getWidth()
    const oldHeight = oldPage.getHeight()

    const newPdf = await PDFDocument.create()

    let newWidth = oldWidth
    let newHeight = oldHeight
    const normalizedAngle = ((-angle % 360) + 360) % 360

    if (normalizedAngle === 90 || normalizedAngle === 270) {
      newWidth = oldHeight
      newHeight = oldWidth
    }

    const newPage = newPdf.addPage([newWidth, newHeight])
    const [embeddedPage] = await newPdf.embedPages([oldPage])

    let x = 0
    let y = 0
    let rotate = degrees(0)

    switch (normalizedAngle) {
      case 90:
        x = newWidth
        rotate = degrees(90)
        break
      case 180:
        x = newWidth
        y = newHeight
        rotate = degrees(180)
        break
      case 270:
        y = newHeight
        rotate = degrees(270)
        break
    }

    newPage.drawPage(embeddedPage, {
      x,
      y,
      width: oldWidth,
      height: oldHeight,
      rotate,
    })

    pdfBytes = await newPdf.save()
  }

  // ------------------------------------------------
  // Canvas rotation
  // ------------------------------------------------
  const oldWidth = srcCanvas.width
  const oldHeight = srcCanvas.height

  const sin = Math.abs(Math.sin(radians))
  const cos = Math.abs(Math.cos(radians))

  const newWidth = round(oldWidth * cos + oldHeight * sin)
  const newHeight = round(oldWidth * sin + oldHeight * cos)

  const canvas = document.createElement('canvas')
  canvas.width = newWidth
  canvas.height = newHeight

  const ctx = canvas.getContext('2d')
  ctx.translate(newWidth / 2, newHeight / 2)
  ctx.rotate(radians)
  ctx.drawImage(srcCanvas, -oldWidth / 2, -oldHeight / 2)

  // ------------------------------------------------
  // Overlay rotation
  // ------------------------------------------------
  if (overlay) {
    const overlayCanvas = document.createElement('canvas')
    overlayCanvas.width = newWidth
    overlayCanvas.height = newHeight

    const octx = overlayCanvas.getContext('2d')
    octx.translate(newWidth / 2, newHeight / 2)
    octx.rotate(radians)
    octx.drawImage(overlay, -overlay.width / 2, -overlay.height / 2)

    overlay = overlayCanvas
  }

  return {
    canvas,
    pdfBytes,
    overlay,
    dimensions: {
      width: newWidth,
      height: newHeight,
      fileAspectRatio: newWidth / newHeight || 1,
    },
  }
}
