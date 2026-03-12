/**
 * @file: resizeOperation.js
 * @author: Pavol Humeny
 * @date: 15.5.2026
 */
/**
 * Resize operation via Web Worker
 *
 * @param {HTMLCanvasElement} baseCanvas
 * @param {HTMLCanvasElement|null} srcOverlay
 * @param {Uint8Array|null} srcPdfBytes
 * @param {number} width
 * @param {number} height
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
 * @param {object} ctx
 * @param {HTMLCanvasElement} ctx.baseCanvas
 * @param {Uint8Array|null} ctx.srcPdfBytes
 * @param {HTMLCanvasElement|null} ctx.srcOverlay
 * @param {{ width:number, height:number }} ctx.params
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
