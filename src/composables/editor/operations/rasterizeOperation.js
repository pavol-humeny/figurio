/**
 * @file: rasterizeOperation.js
 * @author: Pavol Humeny
 * @date: 15.5.2026
 * @description: Rasterize operation – editor mode. This operation bakes SVG/blur/magnify objects into a bitmap overlay. It takes a source canvas and parameters that may include an overlay canvas. The operation clones the overlay canvas if it exists and returns the original source canvas along with the cloned overlay.
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
 * Perform rasterization operation
 * @param {object} ctx - Operation context
 * @param {HTMLCanvasElement} ctx.srcCanvas - Source canvas to rasterize
 * @param {{
 *   overlay: HTMLCanvasElement|null
 * }} ctx.params - Parameters for the rasterization operation, including an optional overlay canvas
 *
 * @returns {Promise<{
 *   canvas: HTMLCanvasElement,
 *   overlay: HTMLCanvasElement|null,
 *   pdfBytes: null,
 *   dimensions: { width:number, height:number, fileAspectRatio:number }
 * }>} - An object containing the original source canvas, the cloned overlay if it exists, null PDF bytes, and the dimensions of the resulting image.
 */
export async function rasterizeOperation({ srcCanvas, params }) {
  const { overlay } = params
  return {
    canvas: srcCanvas,
    overlay: overlay ? cloneCanvas(overlay) : null,
  }
}
