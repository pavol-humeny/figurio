/**
 * Rotate operation via Web Worker
 *
 * @param {HTMLCanvasElement} srcCanvas
 * @param {HTMLCanvasElement|null} srcOverlay
 * @param {Uint8Array|null} srcPdfBytes
 * @param {number} angle
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
 * @param {object} ctx
 * @param {HTMLCanvasElement} ctx.srcCanvas
 * @param {Uint8Array|null} ctx.srcPdfBytes
 * @param {HTMLCanvasElement|null} ctx.srcOverlay
 * @param {{ angle: number }} ctx.params
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
