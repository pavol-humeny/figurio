/**
 * Apply grayscale effect using a web worker
 *
 * @param {HTMLCanvasElement} sourceCanvas Source canvas to apply the effect on
 * @param {'luminance'|'average'|'lightness'} grayscaleType Type of grayscale effect
 * @returns {Promise<HTMLCanvasElement>} Promise resolving to the processed canvas
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
 * @param {object} ctx
 * @param {HTMLCanvasElement} ctx.srcCanvas
 * @param {HTMLCanvasElement|null} ctx.srcOverlay
 * @param {{ grayscaleType: 'luminance'|'average'|'lightness' }} ctx.params
 *
 * @returns {{
 *   canvas: HTMLCanvasElement,
 *   overlay: HTMLCanvasElement|null,
 *   pdfBytes: null,
 *   dimensions: { width:number, height:number, fileAspectRatio:number }
 * }}
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
