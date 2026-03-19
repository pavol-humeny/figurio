/**
 * @file: flip.worker.js
 * @author: Pavol Humeny
 * @date: 15.5.2026
 */
import { useConsole } from '@/composables/common/useConsole'
const { log } = useConsole()

self.onmessage = (e) => {
  const tStart = performance.now()

  const { canvasBitmap, overlayBitmap, pdfBytes, direction } = e.data

  const width = canvasBitmap.width
  const height = canvasBitmap.height

  let tCanvas = 0
  let tOverlay = 0

  /* =========================
   * CANVAS FLIP
   * ========================= */
  {
    const t0 = performance.now()

    const canvas = new OffscreenCanvas(width, height)
    const ctx = canvas.getContext('2d')

    ctx.save()

    if (direction === 'horizontal') {
      ctx.translate(0, height)
      ctx.scale(1, -1)
    } else if (direction === 'vertical') {
      ctx.translate(width, 0)
      ctx.scale(-1, 1)
    }

    ctx.drawImage(canvasBitmap, 0, 0)
    ctx.restore()

    var outCanvasBitmap = canvas.transferToImageBitmap()

    tCanvas = performance.now() - t0
  }

  /* =========================
   * OVERLAY FLIP
   * ========================= */
  let outOverlayBitmap = null

  if (overlayBitmap) {
    const t0 = performance.now()

    const oc = new OffscreenCanvas(width, height)
    const octx = oc.getContext('2d')

    octx.save()

    if (direction === 'horizontal') {
      octx.translate(0, height)
      octx.scale(1, -1)
    } else if (direction === 'vertical') {
      octx.translate(width, 0)
      octx.scale(-1, 1)
    }

    octx.drawImage(overlayBitmap, 0, 0)
    octx.restore()

    outOverlayBitmap = oc.transferToImageBitmap()

    tOverlay = performance.now() - t0
  }

  const tTotal = performance.now() - tStart

  // Log timing information (visible in DevTools Workers)
  log(
    `[flip.worker] total=${tTotal.toFixed(1)}ms | ` +
      `canvas=${tCanvas.toFixed(1)}ms | ` +
      `overlay=${tOverlay.toFixed(1)}ms`,
  )

  self.postMessage(
    {
      canvasBitmap: outCanvasBitmap,
      overlayBitmap: outOverlayBitmap,
      pdfBytes: pdfBytes ?? null,
      dimensions: {
        width,
        height,
        fileAspectRatio: width / height || 1,
      },
    },
    [outCanvasBitmap, ...(outOverlayBitmap ? [outOverlayBitmap] : [])],
  )
}
