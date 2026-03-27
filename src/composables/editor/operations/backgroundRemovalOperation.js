/**
 * @file: backgroundRemovalOperation.js
 * @author: Pavol Humeny
 * @date: 15.5.2026
 * @description: This file defines the background removal operation for the image editor. It takes an input canvas, an optional overlay, and an optional PDF byte array, along with parameters for the background removal process. The operation applies a mask to remove the background from the image while preserving the overlay and PDF if they exist. The resulting canvas, modified overlay, and original PDF bytes are returned as output.
 */
/**
 * Background removal pipeline operation
 * Raster-only operation – preserves overlay and PDF
 *
 * @param {object} ctx - Operation context
 * @param {HTMLCanvasElement} ctx.srcCanvas - Source canvas containing the image to process
 * @param {HTMLCanvasElement|null} ctx.srcOverlay - Optional source canvas containing the overlay to preserve
 * @param {Uint8Array|null} ctx.srcPdfBytes - Optional PDF byte array to preserve
 * @param {{
 *   mask: Uint8ClampedArray,
 *   bgColor: { r:number, g:number, b:number, a:number }
 * }} ctx.params - Parameters for the background removal operation, including the mask and background color
 * @return {Promise<{
 *   canvas: HTMLCanvasElement,
 *   overlay: HTMLCanvasElement|null,
 *   pdfBytes: Uint8Array|null,
 *   dimensions: { width:number, height:number, fileAspectRatio:number }
 * }>} - An object containing the resulting canvas with the background removed, the modified overlay if it exists, the original PDF bytes if they exist, and the dimensions of the resulting image.
 */
export async function backgroundRemovalOperation({ srcCanvas, srcOverlay, srcPdfBytes, params }) {
  const { mask, bgColor } = params

  // BASE IMAGE
  const canvas = document.createElement('canvas')
  canvas.width = srcCanvas.width
  canvas.height = srcCanvas.height

  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  ctx.drawImage(srcCanvas, 0, 0)

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const data = imageData.data

  for (let i = 0; i < data.length; i += 4) {
    const alpha = mask[i + 3] / 255
    if (alpha === 0) continue

    data[i] = data[i] * (1 - alpha) + bgColor.r * alpha
    data[i + 1] = data[i + 1] * (1 - alpha) + bgColor.g * alpha
    data[i + 2] = data[i + 2] * (1 - alpha) + bgColor.b * alpha
    data[i + 3] = data[i + 3] * (1 - alpha) + bgColor.a * alpha
  }

  ctx.putImageData(imageData, 0, 0)

  // OVERLAY
  let overlay = srcOverlay

  if (overlay) {
    const oCanvas = document.createElement('canvas')
    oCanvas.width = overlay.width
    oCanvas.height = overlay.height

    const octx = oCanvas.getContext('2d', { willReadFrequently: true })
    octx.drawImage(overlay, 0, 0)

    const oImageData = octx.getImageData(0, 0, oCanvas.width, oCanvas.height)
    const oData = oImageData.data

    for (let i = 0; i < oData.length; i += 4) {
      const maskAlpha = mask[i + 3] / 255
      if (maskAlpha === 0) continue

      oData[i + 3] = oData[i + 3] * (1 - maskAlpha)
    }

    octx.putImageData(oImageData, 0, 0)
    overlay = oCanvas
  }

  return {
    canvas,
    overlay,
    pdfBytes: srcPdfBytes,
    dimensions: {
      width: canvas.width,
      height: canvas.height,
      fileAspectRatio: canvas.width / canvas.height || 1,
    },
  }
}
