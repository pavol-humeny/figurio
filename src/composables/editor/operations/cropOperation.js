import { PDFDocument } from 'pdf-lib'

/**
 * Crop operation for canvas, overlay and PDF
 */
export async function cropOperation({ srcCanvas, srcPdfBytes, srcOverlay, cropBox, round }) {
  const { x, y, width, height } = cropBox

  // ---------------------------
  // PDF
  // ---------------------------
  let pdfBytes = srcPdfBytes ?? null
  if (pdfBytes) {
    const pdf = await PDFDocument.load(pdfBytes)
    const oldPage = pdf.getPage(0)

    const newPdf = await PDFDocument.create()
    const [embedded] = await newPdf.embedPages([oldPage])

    const pageHeight = embedded.height
    const pdfY = pageHeight - (y + height)

    const page = newPdf.addPage([width, height])
    page.drawPage(embedded, {
      x: -x,
      y: -pdfY,
      width: embedded.width,
      height: embedded.height,
    })

    pdfBytes = await newPdf.save()
  }

  // ---------------------------
  // Canvas
  // ---------------------------
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height

  const ctx = canvas.getContext('2d')
  ctx.drawImage(srcCanvas, x, y, width, height, 0, 0, width, height)

  // ---------------------------
  // Overlay
  // ---------------------------
  let overlay = null
  if (srcOverlay) {
    overlay = document.createElement('canvas')
    overlay.width = width
    overlay.height = height

    overlay.getContext('2d').drawImage(srcOverlay, x, y, width, height, 0, 0, width, height)
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
