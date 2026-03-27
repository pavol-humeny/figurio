/**
 * @file: resize.worker.js
 * @author: Pavol Humeny
 * @date: 15.5.2026
 * @description: Web Worker for resizing canvas and overlay bitmaps and PDF pages in the editor, allowing for off-main-thread image manipulation to keep the UI responsive during resize operations.
 */

import { PDFDocument } from 'pdf-lib'
import { useConsole } from '@/composables/common/useConsole'
const { log } = useConsole()

self.onmessage = async (e) => {
  const tStart = performance.now()

  const { baseCanvasBitmap, overlayBitmap, pdfBytes, width, height } = e.data

  let outPdfBytes = pdfBytes ?? null
  let outOverlayBitmap = null

  let tPdf = 0
  let tCanvas = 0
  let tOverlay = 0

  // ------------------------
  // PDF RESIZE
  // ------------------------
  if (pdfBytes) {
    const t0 = performance.now()

    const pdf = await PDFDocument.load(pdfBytes)
    const oldPage = pdf.getPage(0)

    const newPdf = await PDFDocument.create()
    const page = newPdf.addPage([width, height])
    const [embedded] = await newPdf.embedPages([oldPage])

    page.drawPage(embedded, {
      x: 0,
      y: 0,
      width,
      height,
    })

    outPdfBytes = await newPdf.save()
    tPdf = performance.now() - t0
  }

  //------------------------
  // CANVAS RESIZE
  //------------------------
  const t1 = performance.now()

  const canvas = new OffscreenCanvas(width, height)
  const ctx = canvas.getContext('2d')
  ctx.drawImage(baseCanvasBitmap, 0, 0, width, height)

  const outCanvasBitmap = canvas.transferToImageBitmap()
  tCanvas = performance.now() - t1

  // ------------------------
  // OVERLAY RESIZE
  // ------------------------
  if (overlayBitmap) {
    const t2 = performance.now()

    const oc = new OffscreenCanvas(width, height)
    const octx = oc.getContext('2d')
    octx.drawImage(overlayBitmap, 0, 0, width, height)

    outOverlayBitmap = oc.transferToImageBitmap()
    tOverlay = performance.now() - t2
  }

  const tTotal = performance.now() - tStart

  // Log timing information
  log(
    `[resize.worker] total=${tTotal.toFixed(1)}ms | ` +
      `pdf=${tPdf.toFixed(1)}ms | ` +
      `canvas=${tCanvas.toFixed(1)}ms | ` +
      `overlay=${tOverlay.toFixed(1)}ms`,
  )

  self.postMessage(
    {
      canvasBitmap: outCanvasBitmap,
      overlayBitmap: outOverlayBitmap,
      pdfBytes: outPdfBytes,
      dimensions: {
        width,
        height,
        fileAspectRatio: width / height || 1,
      },
    },
    [outCanvasBitmap, ...(outOverlayBitmap ? [outOverlayBitmap] : [])],
  )
}
