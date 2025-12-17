import { PDFDocument, degrees } from 'pdf-lib'

/**
 * Flip operation for canvas, overlay and PDF
 *
 * @param {object} params
 * @param {HTMLCanvasElement} params.srcCanvas
 * @param {Uint8Array|null} params.srcPdfBytes
 * @param {HTMLCanvasElement|null} params.srcOverlay
 * @param {'horizontal'|'vertical'} params.direction
 * @param {(n:number)=>number} params.round
 */
export async function flipOperation({ srcCanvas, srcPdfBytes, srcOverlay, direction }) {
  console.warn('flipOperation called with direction:', direction)

  let pdfBytes = srcPdfBytes ?? null
  let overlay = srcOverlay ?? null

  const width = srcCanvas.width
  const height = srcCanvas.height

  // ------------------------------------------------
  // PDF flip
  // ------------------------------------------------
  if (pdfBytes) {
    const existingPdf = await PDFDocument.load(pdfBytes)
    const oldPage = existingPdf.getPage(0)

    const newPdf = await PDFDocument.create()
    const newPage = newPdf.addPage([width, height])
    const [embeddedPage] = await newPdf.embedPages([oldPage])

    let x = 0
    let y = 0
    let rotate = degrees(0)
    let scaleX = 1
    let scaleY = 1

    if (direction === 'horizontal') {
      scaleY = -1
      y = height
    } else if (direction === 'vertical') {
      scaleX = -1
      x = width
    }

    newPage.drawPage(embeddedPage, {
      x,
      y,
      xScale: scaleX,
      yScale: scaleY,
      rotate,
    })

    pdfBytes = await newPdf.save()
  }

  // ------------------------------------------------
  // Canvas flip
  // ------------------------------------------------
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

  ctx.drawImage(srcCanvas, 0, 0)
  ctx.restore()

  // ------------------------------------------------
  // Overlay flip
  // ------------------------------------------------
  if (overlay) {
    const overlayCanvas = document.createElement('canvas')
    overlayCanvas.width = width
    overlayCanvas.height = height

    const octx = overlayCanvas.getContext('2d')
    octx.save()

    if (direction === 'horizontal') {
      octx.translate(0, height)
      octx.scale(1, -1)
    } else if (direction === 'vertical') {
      octx.translate(width, 0)
      octx.scale(-1, 1)
    }

    octx.drawImage(overlay, 0, 0)
    octx.restore()

    overlay = overlayCanvas
  }

  return {
    canvas,
    overlay,
    pdfBytes,
    dimensions: {
      width,
      height,
      fileAspectRatio: width / height || 1,
    },
  }
}
