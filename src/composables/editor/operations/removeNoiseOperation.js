/**
 * @file: removeNoiseOperation.js
 * @author: Pavol Humeny
 * @date: 15.5.2026
 */
/**
 * Apply remove-noise effect using a web worker
 *
 * @param {HTMLCanvasElement} sourceCanvas Source canvas to apply the effect on
 * @param {{ mask:Uint8Array, width:number, height:number }} params
 * @returns {Promise<HTMLCanvasElement>} Promise resolving to the processed canvas
 */
const applyRemoveNoiseViaWorker = async (sourceCanvas, params) => {
  const worker = new Worker(
    new URL('@/composables/worker/removeNoise.worker.js', import.meta.url),
    { type: 'module' },
  )

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

    // Clone mask for worker so store keeps original buffer
    const workerMask = params.mask.slice()

    const rc =
      params.replaceColor && typeof params.replaceColor.r === 'number'
        ? {
            r: params.replaceColor.r | 0,
            g: params.replaceColor.g | 0,
            b: params.replaceColor.b | 0,
          }
        : { r: 255, g: 255, b: 255 }

    worker.postMessage(
      {
        bitmap,
        params: {
          width: params.width,
          height: params.height,
          maskBuffer: workerMask.buffer,
          replaceColor: rc,
        },
      },
      [bitmap, workerMask.buffer],
    )
  })
}

/**
 * Remove-noise operation for canvas + overlay (worker-based)
 *
 * @param {object} ctx
 * @param {HTMLCanvasElement} ctx.srcCanvas
 * @param {HTMLCanvasElement|null} ctx.srcOverlay
 * @param {{ mask:Uint8Array, width:number, height:number }} ctx.params
 *
 * @returns {{
 *   canvas: HTMLCanvasElement,
 *   overlay: HTMLCanvasElement|null,
 *   pdfBytes: null,
 *   dimensions: { width:number, height:number, fileAspectRatio:number }
 * }}
 */
export async function removeNoiseOperation({ srcCanvas, srcOverlay, params }) {
  const canvas = await applyRemoveNoiseViaWorker(srcCanvas, params)

  return {
    canvas,
    overlay: srcOverlay,
    pdfBytes: null,
    dimensions: {
      width: canvas.width,
      height: canvas.height,
      fileAspectRatio: canvas.width / canvas.height || 1,
    },
  }
}
