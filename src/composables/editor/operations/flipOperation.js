/**
 * @file: flipOperation.js
 * @author: Pavol Humeny
 * @date: 15.5.2026
 * @description: Flip operation for canvas + overlay + pdfBytes (worker-based). This operation takes a source canvas, an optional PDF byte array, and an optional overlay canvas, along with flip parameters (direction). It returns a new flipped canvas, a flipped overlay if it exists, and a flipped PDF byte array if it exists. The operation uses a Web Worker to perform the flipping. The resulting flipped canvas, modified overlay, and original PDF bytes are returned as output.
 */
/**
 * Flip operation via Web Worker
 *
 * @param {HTMLCanvasElement} srcCanvas - Source canvas to flip
 * @param {HTMLCanvasElement|null} srcOverlay - Optional source overlay canvas to flip
 * @param {Uint8Array|null} srcPdfBytes - Optional source PDF bytes to flip
 * @param {'horizontal' | 'vertical'} direction - Flip direction
 *
 * @returns {Promise<{
 *   canvas: HTMLCanvasElement,
 *   overlay: HTMLCanvasElement|null,
 *   pdfBytes: Uint8Array|null,
 *   dimensions: { width:number, height:number, fileAspectRatio:number }
 * }>}
 */
const flipViaWorker = async (srcCanvas, srcOverlay, srcPdfBytes, direction) => {
  const worker = new Worker(new URL('@/composables/worker/flip.worker.js', import.meta.url), {
    type: 'module',
  })

  const canvasBitmap = await createImageBitmap(srcCanvas)
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
        canvasBitmap,
        overlayBitmap,
        pdfBytes: srcPdfBytes ?? null,
        direction,
      },
      [canvasBitmap, ...(overlayBitmap ? [overlayBitmap] : [])],
    )
  })
}

/**
 * Flip operation for canvas + overlay + pdfBytes (worker-based)
 *
 * @param {object} ctx
 * @param {HTMLCanvasElement} ctx.srcCanvas
 * @param {Uint8Array|null} ctx.srcPdfBytes
 * @param {HTMLCanvasElement|null} ctx.srcOverlay
 * @param {{ direction: 'horizontal' | 'vertical' }} ctx.params
 *
 * @returns {{
 *   canvas: HTMLCanvasElement,
 *   overlay: HTMLCanvasElement|null,
 *   pdfBytes: Uint8Array|null,
 *   dimensions: { width:number, height:number, fileAspectRatio:number }
 * }}
 */
export async function flipOperation({ srcCanvas, srcPdfBytes, srcOverlay, params }) {
  const { direction } = params

  return flipViaWorker(srcCanvas, srcOverlay, srcPdfBytes, direction)
}
