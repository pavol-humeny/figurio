/**
 * @file: grayscaleOperation.js
 * @author: Pavol Humeny
 * @date: 15.5.2026
 * @description: Grayscale operation for canvas + overlay (worker-based). This operation takes a source canvas, an optional overlay canvas, and parameters for the grayscale effect. It applies the grayscale effect to both the canvas and the overlay using a Web Worker. The resulting grayscale canvas, modified overlay, and null PDF bytes are returned as output, along with the dimensions of the resulting image.
 */

/**
 * Apply grayscale effect using a web worker
 *
 * @param {HTMLCanvasElement} sourceCanvas Source canvas to apply the effect on
 * @param {'luminance'|'average'|'lightness'} grayscaleType Type of grayscale effect
 * @returns {Promise<HTMLCanvasElement>} A promise that resolves to the resulting canvas with the grayscale effect applied
 */
const applyGrayscaleViaWorker = async (sourceCanvas, grayscaleType) => {
  const worker = new Worker(new URL('@/composables/worker/grayscale.worker.js', import.meta.url), {
    type: 'module',
  })

  const bitmap = await createImageBitmap(sourceCanvas)

  return new Promise((resolve) => {
    worker.onmessage = (e) => {
      const resultBitmap = e.data

      const canvas = document.createElement('canvas')
      canvas.width = resultBitmap.width
      canvas.height = resultBitmap.height

      const ctx = canvas.getContext('2d')
      ctx.drawImage(resultBitmap, 0, 0)

      worker.terminate()
      resolve(canvas)
    }

    worker.postMessage(
      { bitmap, grayscaleType },
      [bitmap], // transfer ownership (zero-copy)
    )
  })
}

/**
 * Grayscale operation for canvas + overlay (worker-based)
 *
 * @param {object} ctx - Operation context
 * @param {HTMLCanvasElement} ctx.srcCanvas - Source canvas to apply the grayscale effect on
 * @param {HTMLCanvasElement|null} ctx.srcOverlay - Optional source overlay canvas to apply the grayscale effect on
 * @param {{ grayscaleType: 'luminance'|'average'|'lightness' }} ctx.params - Parameters for the grayscale effect, including the type of grayscale to apply
 *
 * @returns {Promise<{
 *   canvas: HTMLCanvasElement,
 *   overlay: HTMLCanvasElement|null,
 *   pdfBytes: null,
 *   dimensions: { width:number, height:number, fileAspectRatio:number }
 * }>} - An object containing the resulting grayscale canvas, the modified overlay if it exists, null PDF bytes, and the dimensions of the resulting image.
 */
export async function grayscaleOperation({ srcCanvas, srcOverlay, params }) {
  const { grayscaleType = 'luminance' } = params

  const canvas = await applyGrayscaleViaWorker(srcCanvas, grayscaleType)
  const overlay = srcOverlay ? await applyGrayscaleViaWorker(srcOverlay, grayscaleType) : null

  return {
    canvas,
    overlay,
    pdfBytes: null,
    dimensions: {
      width: canvas.width,
      height: canvas.height,
      fileAspectRatio: canvas.width / canvas.height || 1,
    },
  }
}
