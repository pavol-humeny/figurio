import { PDFDocument } from 'pdf-lib'

/**
 * Resize operation for canvas, overlay and PDF (pipeline-style)
 *
 * IMPORTANT:
 * Resize is absolute – it must always be computed from the original base canvas,
 * not from already resized intermediate results.
 *
 * @param {object} ctx
 * @param {HTMLCanvasElement} ctx.srcCanvas current pipeline canvas (ignored)
 * @param {HTMLCanvasElement} ctx.baseCanvas original base canvas
 * @param {Uint8Array|null} ctx.srcPdfBytes
 * @param {HTMLCanvasElement|null} ctx.srcOverlay
 * @param {{ width:number, height:number }} ctx.params
 */
export async function resizeOperation({ baseCanvas, srcPdfBytes, srcOverlay, params }) {
  const { width, height } = params

  console.warn('resizeOperation called with params:', params)
  console.warn('Base canvas size:', baseCanvas.width, baseCanvas.height)

  // 🔹 ALWAYS resize from original image
  const outCanvas = document.createElement('canvas')
  outCanvas.width = width
  outCanvas.height = height
  outCanvas.getContext('2d').drawImage(baseCanvas, 0, 0, width, height)

  // Overlay (scale from base overlay if exists)
  let overlay = null
  if (srcOverlay) {
    overlay = document.createElement('canvas')
    overlay.width = width
    overlay.height = height
    overlay.getContext('2d').drawImage(srcOverlay, 0, 0, width, height)
  }

  // PDF
  let pdfBytes = srcPdfBytes ?? null
  if (pdfBytes) {
    const pdf = await PDFDocument.load(pdfBytes)
    const oldPage = pdf.getPage(0)
    const newPdf = await PDFDocument.create()
    const page = newPdf.addPage([width, height])
    const [embedded] = await newPdf.embedPages([oldPage])
    page.drawPage(embedded, { x: 0, y: 0, width, height })
    pdfBytes = await newPdf.save()
  }

  return {
    canvas: outCanvas,
    overlay,
    pdfBytes,
    dimensions: {
      width,
      height,
      fileAspectRatio: width / height || 1,
    },
  }
}
