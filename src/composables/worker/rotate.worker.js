import { degrees, PDFDocument } from 'pdf-lib'

self.onmessage = async (e) => {
  const { canvasBitmap, overlayBitmap, pdfBytes, angle } = e.data

  const radians = (angle * Math.PI) / 180
  const sin = Math.abs(Math.sin(radians))
  const cos = Math.abs(Math.cos(radians))

  let outPdfBytes = pdfBytes ?? null
  let outOverlayBitmap = null

  /* PDF ROTATION */
  if (pdfBytes) {
    const existingPdf = await PDFDocument.load(pdfBytes)
    const oldPage = existingPdf.getPage(0)

    const oldWidth = oldPage.getWidth()
    const oldHeight = oldPage.getHeight()

    let newWidth = oldWidth
    let newHeight = oldHeight
    const normalizedAngle = ((-angle % 360) + 360) % 360

    if (normalizedAngle === 90 || normalizedAngle === 270) {
      newWidth = oldHeight
      newHeight = oldWidth
    }

    const newPdf = await PDFDocument.create()
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

    outPdfBytes = await newPdf.save()
  }

  /* CANVAS ROTATION */
  const oldWidth = canvasBitmap.width
  const oldHeight = canvasBitmap.height

  const newWidth = Math.round(oldWidth * cos + oldHeight * sin)
  const newHeight = Math.round(oldWidth * sin + oldHeight * cos)

  const canvas = new OffscreenCanvas(newWidth, newHeight)
  const ctx = canvas.getContext('2d')

  ctx.translate(newWidth / 2, newHeight / 2)
  ctx.rotate(radians)
  ctx.drawImage(canvasBitmap, -oldWidth / 2, -oldHeight / 2)

  const outCanvasBitmap = canvas.transferToImageBitmap()

  /* OVERLAY ROTATION */
  if (overlayBitmap) {
    const oc = new OffscreenCanvas(newWidth, newHeight)
    const octx = oc.getContext('2d')

    octx.translate(newWidth / 2, newHeight / 2)
    octx.rotate(radians)
    octx.drawImage(overlayBitmap, -overlayBitmap.width / 2, -overlayBitmap.height / 2)

    outOverlayBitmap = oc.transferToImageBitmap()
  }

  self.postMessage(
    {
      canvasBitmap: outCanvasBitmap,
      overlayBitmap: outOverlayBitmap,
      pdfBytes: outPdfBytes,
      dimensions: {
        width: newWidth,
        height: newHeight,
        fileAspectRatio: newWidth / newHeight || 1,
      },
    },
    [outCanvasBitmap, ...(outOverlayBitmap ? [outOverlayBitmap] : [])],
  )
}
