/**
 * @file: rasterizePdfOperation.js
 * @author: Pavol Humeny
 * @date: 15.5.2026
 * @description: Rasterize PDF operation. This operation converts a PDF-based image into a pure raster image. It takes a source canvas, an optional overlay canvas, and optional PDF bytes. If PDF bytes are provided, it clones the source canvas and the overlay (if it exists) to create a new rasterized version of the image. The resulting rasterized canvas, modified overlay, null PDF bytes, and dimensions of the resulting image are returned as output.
 */

/**
 * Clone a canvas element
 * @param {HTMLCanvasElement} src source canvas
 * @returns {HTMLCanvasElement} cloned canvas
 */
const cloneCanvas = (src) => {
  const c = document.createElement('canvas')
  c.width = src.width
  c.height = src.height
  c.getContext('2d').drawImage(src, 0, 0)
  return c
}

/**
 * @param {Object} options - Operation options
 * @param {HTMLCanvasElement} options.srcCanvas - Source canvas to rasterize
 * @param {HTMLCanvasElement|null} options.srcOverlay - Optional source overlay canvas to include in the rasterization
 * @param {Uint8Array|null} options.srcPdfBytes - Optional PDF bytes to rasterize
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
