/**
 * @file: removeNoise.worker.js
 * @author: Pavol Humeny
 * @date: 15.5.2026
 */
import { useConsole } from '@/composables/common/useConsole'
const { log } = useConsole()

self.onmessage = (e) => {
  const tStart = performance.now()

  const { bitmap, params } = e.data
  const { maskBuffer, width, height, replaceColor } = params

  const mask = new Uint8Array(maskBuffer)

  let tSetup = 0
  let tLoop = 0
  let tFinalize = 0

  /* =========================
   * SETUP (draw + getImageData)
   * ========================= */
  let imageData, data
  {
    const t0 = performance.now()

    const canvas = new OffscreenCanvas(bitmap.width, bitmap.height)
    const ctx = canvas.getContext('2d')

    ctx.drawImage(bitmap, 0, 0)

    imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    data = imageData.data

    tSetup = performance.now() - t0
  }

  /* =========================
   * PIXEL LOOP
   * ========================= */
  {
    const t0 = performance.now()

    const idx = (x, y) => (y * width + x) * 4

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const p = y * width + x
        if (!mask[p]) continue

        const i = idx(x, y)

        data[i] = replaceColor.r
        data[i + 1] = replaceColor.g
        data[i + 2] = replaceColor.b
      }
    }

    tLoop = performance.now() - t0
  }

  /* =========================
   * FINALIZE (putImageData + transfer)
   * ========================= */
  let resultBitmap
  {
    const t0 = performance.now()

    const outCanvas = new OffscreenCanvas(bitmap.width, bitmap.height)
    const outCtx = outCanvas.getContext('2d')
    outCtx.putImageData(imageData, 0, 0)

    resultBitmap = outCanvas.transferToImageBitmap()

    tFinalize = performance.now() - t0
  }

  const tTotal = performance.now() - tStart

  // Log timing information (visible in DevTools Workers)
  log(
    `[removeNoise.worker] total=${tTotal.toFixed(1)}ms | ` +
      `setup=${tSetup.toFixed(1)}ms | ` +
      `loop=${tLoop.toFixed(1)}ms | ` +
      `finalize=${tFinalize.toFixed(1)}ms`,
  )

  self.postMessage(resultBitmap, [resultBitmap])
}
