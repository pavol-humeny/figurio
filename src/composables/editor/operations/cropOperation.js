/**
 * @file: cropOperation.js
 * @author: Pavol Humeny
 * @date: 15.5.2026
 * @description: Crop operation for canvas, overlay and PDF. This operation takes a source canvas, an optional PDF byte array, and an optional overlay canvas, along with crop parameters (x, y, width, height). It returns a new cropped canvas, a cropped overlay if it exists, and a cropped PDF byte array if it exists. The operation ensures that the cropping is applied consistently across the image, overlay, and PDF while maintaining the aspect ratio and dimensions of the cropped area.
 */
import { PDFDocument } from 'pdf-lib'

/**
 * Crop operation for canvas, overlay and PDF
 *
 * @param {object} ctx - Operation context
 * @param {HTMLCanvasElement} ctx.srcCanvas - Source canvas
 * @param {Uint8Array|null} ctx.srcPdfBytes - Source PDF bytes
 * @param {HTMLCanvasElement|null} ctx.srcOverlay - Source overlay canvas
 * @param {{
 *   x: number,
 *   y: number,
 *   width: number,
 *   height: number
 * }} ctx.params - Crop parameters
 * @returns {Promise<{
 *   canvas: HTMLCanvasElement,
 *   overlay: HTMLCanvasElement|null,
 *   pdfBytes: Uint8Array|null,
 *   dimensions: { width:number, height:number, fileAspectRatio:number }
 * }>} - Cropped canvas, overlay and PDF bytes with dimensions
 */
export async function cropOperation({ srcCanvas, srcPdfBytes, srcOverlay, params }) {
  const { x, y, width, height } = params

  // PDF
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

  // Canvas
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height

  const ctx = canvas.getContext('2d')
  ctx.drawImage(srcCanvas, x, y, width, height, 0, 0, width, height)

  // Overlay
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
