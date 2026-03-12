/**
 * @file: rasterizeOperation.js
 * @author: Pavol Humeny
 * @date: 15.5.2026
 */
/**
 * Rasterize operation – editor mode
 * Bakes SVG/blur objects into bitmap overlay
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
 * @param {Object} options
 * @param {HTMLCanvasElement} options.srcCanvas source canvas
 * @param {Object} options.params operation parameters
 * @param {HTMLCanvasElement} [options.params.overlay] overlay canvas to use
 * @returns {Promise<{canvas: HTMLCanvasElement, overlay: HTMLCanvasElement|null}>} result canvases
 */
export async function rasterizeOperation({ srcCanvas, params }) {
  const { overlay } = params
  return {
    canvas: srcCanvas,
    overlay: overlay ? cloneCanvas(overlay) : null,
  }
}
