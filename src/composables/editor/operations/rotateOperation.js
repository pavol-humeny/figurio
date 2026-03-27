/**
 * @file: rotateOperation.js
 * @author: Pavol Humeny
 * @date: 15.5.2026
 * @description: Rotate operation for canvas + overlay + pdfBytes (worker-based). This operation takes a source canvas, an optional PDF byte array, and an optional overlay canvas, along with a rotation angle. It returns a new rotated canvas, a rotated overlay if it exists, and a rotated PDF byte array if it exists. The operation uses a Web Worker to perform the rotation. The resulting rotated canvas, modified overlay, original PDF bytes, and dimensions of the resulting image are returned as output.
 */

/**
 * Rotate operation via Web Worker
 *
 * @param {HTMLCanvasElement} srcCanvas - Source canvas to rotate
 * @param {HTMLCanvasElement|null} srcOverlay - Optional source overlay canvas to rotate
 * @param {Uint8Array|null} srcPdfBytes - Optional source PDF bytes to rotate
 * @param {number} angle - Rotation angle in degrees
 *
 * @returns {Promise<{
 *   canvas: HTMLCanvasElement,
 *   overlay: HTMLCanvasElement|null,
 *   pdfBytes: Uint8Array|null,
 *   dimensions: { width:number, height:number, fileAspectRatio:number }
 * }>}
 */
const rotateViaWorker = async (srcCanvas, srcOverlay, srcPdfBytes, angle) => {
  const worker = new Worker(new URL('@/composables/worker/rotate.worker.js', import.meta.url), {
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
        angle,
      },
      [canvasBitmap, ...(overlayBitmap ? [overlayBitmap] : [])],
    )
  })
}

/**
 * Rotate operation for canvas + overlay + pdfBytes (worker-based)
 *
 * @param {object} ctx - Operation context
 * @param {HTMLCanvasElement} ctx.srcCanvas - Source canvas to rotate
 * @param {Uint8Array|null} ctx.srcPdfBytes - Optional source PDF bytes to rotate
 * @param {HTMLCanvasElement|null} ctx.srcOverlay - Optional source overlay canvas to rotate
 * @param {{ angle: number }} ctx.params - Rotation angle in degrees
 *
 * @returns {{
 *   canvas: HTMLCanvasElement,
 *   overlay: HTMLCanvasElement|null,
 *   pdfBytes: Uint8Array|null,
 *   dimensions: { width:number, height:number, fileAspectRatio:number }
 * }}
 */
export async function rotateOperation({ srcCanvas, srcPdfBytes, srcOverlay, params }) {
  const { angle } = params

  return rotateViaWorker(srcCanvas, srcOverlay, srcPdfBytes, angle)
}
