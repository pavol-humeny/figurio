import { PDFDocument } from 'pdf-lib'

/**
 * Crop operation for canvas, overlay and PDF (pipeline-style)
 *
 * @param {object} ctx
 * @param {HTMLCanvasElement} ctx.srcCanvas source canvas
 * @param {Uint8Array|null} ctx.srcPdfBytes source PDF bytes
 * @param {HTMLCanvasElement|null} ctx.srcOverlay source overlay canvas
 * @param {{
 *   x: number,
 *   y: number,
 *   width: number,
 *   height: number
 * }} ctx.params crop parameters
 *
 * @returns {{
 *   canvas: HTMLCanvasElement,
 *   overlay: HTMLCanvasElement | null,
 *   pdfBytes: Uint8Array | null,
 *   dimensions: { width: number, height: number, fileAspectRatio: number }
 * }}
 */
export async function cropOperation({ srcCanvas, srcPdfBytes, srcOverlay, params }) {
  const { x, y, width, height } = params

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
