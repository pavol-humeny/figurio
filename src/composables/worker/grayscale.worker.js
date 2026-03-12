/**
 * @file: grayscale.worker.js
 * @author: Pavol Humeny
 * @date: 15.5.2026
 */
// grayscale.worker.js

self.onmessage = (e) => {
  const tStart = performance.now()

  const { bitmap, grayscaleType } = e.data

  let tSetup = 0
  let tLoop = 0
  let tFinalize = 0

  /* =========================
   * SETUP (draw + getImageData)
   * ========================= */
  {
    const t0 = performance.now()

    const canvas = new OffscreenCanvas(bitmap.width, bitmap.height)
    const ctx = canvas.getContext('2d')

    ctx.drawImage(bitmap, 0, 0)

    var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    var data = imageData.data

    tSetup = performance.now() - t0
  }

  /* =========================
   * PIXEL LOOP
   * ========================= */
  {
    const t0 = performance.now()

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]

      let gray
      switch (grayscaleType) {
        case 'average':
          gray = (r + g + b) / 3
          break

        case 'lightness':
          gray = (Math.max(r, g, b) + Math.min(r, g, b)) / 2
          break

        case 'luminance':
        default:
          gray = 0.299 * r + 0.587 * g + 0.114 * b
          break
      }

      data[i] = data[i + 1] = data[i + 2] = gray
    }

    tLoop = performance.now() - t0
  }

  /* =========================
   * FINALIZE (putImageData + transfer)
   * ========================= */
  {
    const t0 = performance.now()

    const ctx =
      imageData && imageData.data
        ? (() => {
            const c = new OffscreenCanvas(bitmap.width, bitmap.height)
            const cctx = c.getContext('2d')
            cctx.putImageData(imageData, 0, 0)
            return c
          })()
        : null

    var resultBitmap = ctx.transferToImageBitmap()

    tFinalize = performance.now() - t0
  }

  const tTotal = performance.now() - tStart

  // Log timing information (visible in DevTools → Workers)
  console.log(
    `[grayscale.worker] total=${tTotal.toFixed(1)}ms | ` +
      `setup=${tSetup.toFixed(1)}ms | ` +
      `loop=${tLoop.toFixed(1)}ms | ` +
      `finalize=${tFinalize.toFixed(1)}ms`,
  )

  self.postMessage(resultBitmap, [resultBitmap])
}
