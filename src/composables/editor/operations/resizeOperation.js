/**
 * @file: resizeOperation.js
 * @author: Pavol Humeny
 * @date: 15.5.2026
 * @description: Resize operation for canvas + overlay + pdfBytes (worker-based). This operation takes a source canvas, an optional PDF byte array, and an optional overlay canvas, along with new dimensions (width and height). It returns a new resized canvas, a resized overlay if it exists, and a resized PDF byte array if it exists. The operation uses a Web Worker to perform the resizing. The resulting resized canvas, modified overlay, original PDF bytes, and dimensions of the resulting image are returned as output.
 */

/**
 * Resize operation via Web Worker
 *
 * @param {HTMLCanvasElement} baseCanvas - Source canvas to resize
 * @param {HTMLCanvasElement|null} srcOverlay - Optional source overlay canvas to resize
 * @param {Uint8Array|null} srcPdfBytes - Optional source PDF bytes to resize
 * @param {number} width - New width for the resized canvas
 * @param {number} height - New height for the resized canvas
 *
 * @returns {Promise<{
 *   canvas: HTMLCanvasElement,
 *   overlay: HTMLCanvasElement|null,
 *   pdfBytes: Uint8Array|null,
 *   dimensions: { width:number, height:number, fileAspectRatio:number }
 * }>}
 */
const resizeViaWorker = async (baseCanvas, srcOverlay, srcPdfBytes, width, height) => {
  const worker = new Worker(new URL('@/composables/worker/resize.worker.js', import.meta.url), {
    type: 'module',
  })

  const baseCanvasBitmap = await createImageBitmap(baseCanvas)
  const overlayBitmap = srcOverlay ? await createImageBitmap(srcOverlay) : null

  return new Promise((resolve) => {
    worker.onmessage = (e) => {
      const { canvasBitmap, overlayBitmap, pdfBytes, dimensions } = e.data

      const canvas = document.createElement('canvas')
      canvas.width = canvasBitmap.width
      canvas.height = canvasBitmap.height
      canvas.getContext('2d').drawImage(canvasBitmap, 0, 0)

      let overlay = null
      if (overlayBitmap) {
        overlay = document.createElement('canvas')
        overlay.width = overlayBitmap.width
        overlay.height = overlayBitmap.height
        overlay.getContext('2d').drawImage(overlayBitmap, 0, 0)
      }

      worker.terminate()

      resolve({
        canvas,
        overlay,
        pdfBytes,
        dimensions,
      })
    }

    worker.postMessage(
      {
        baseCanvasBitmap,
        overlayBitmap,
        pdfBytes: srcPdfBytes ?? null,
        width,
        height,
      },
      [baseCanvasBitmap, ...(overlayBitmap ? [overlayBitmap] : [])],
    )
  })
}

/**
 * Resize operation for canvas + overlay + pdfBytes (worker-based)
 *
 * @param {object} ctx - Operation context
 * @param {HTMLCanvasElement} ctx.baseCanvas - Source canvas to resize
 * @param {Uint8Array|null} ctx.srcPdfBytes - Optional source PDF bytes to resize
 * @param {HTMLCanvasElement|null} ctx.srcOverlay - Optional source overlay canvas to resize
 * @param {{ width:number, height:number }} ctx.params - New dimensions for the resized canvas
 *
 * @returns {{
 *   canvas: HTMLCanvasElement,
 *   overlay: HTMLCanvasElement|null,
 *   pdfBytes: Uint8Array|null,
 *   dimensions: { width:number, height:number, fileAspectRatio:number }
 * }}
 */
export async function resizeOperation({ baseCanvas, srcPdfBytes, srcOverlay, params }) {
  const { width, height } = params

  return resizeViaWorker(baseCanvas, srcOverlay, srcPdfBytes, width, height)
}
