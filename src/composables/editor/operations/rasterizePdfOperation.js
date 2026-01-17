/**
 * Rasterize PDF operation
 * Converts PDF-based image into pure raster image
 */

const cloneCanvas = (src) => {
  const c = document.createElement('canvas')
  c.width = src.width
  c.height = src.height
  c.getContext('2d').drawImage(src, 0, 0)
  return c
}

/**
 * @param {Object} options
 * @param {HTMLCanvasElement} options.srcCanvas
 * @param {HTMLCanvasElement|null} options.srcOverlay
 * @param {Uint8Array|null} options.srcPdfBytes
 * @returns {Promise<{canvas, overlay, pdfBytes, dimensions}>}
 */
export async function rasterizePdfOperation({ srcCanvas, srcOverlay, srcPdfBytes }) {
  // Nothing to rasterize if it's already an image
  if (!srcPdfBytes) {
    return {
      canvas: srcCanvas,
      overlay: srcOverlay,
      pdfBytes: null,
    }
  }

  return {
    canvas: cloneCanvas(srcCanvas),
    overlay: srcOverlay ? cloneCanvas(srcOverlay) : null,
    pdfBytes: null,
  }
}
