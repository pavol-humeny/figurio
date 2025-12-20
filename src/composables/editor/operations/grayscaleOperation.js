/**
 * Grayscale operation for canvas
 *
 * @param {object} ctx
 * @param {HTMLCanvasElement} ctx.srcCanvas
 * @param {HTMLCanvasElement|null} ctx.srcOverlay
 * @param {{ grayscaleType: 'luminance'|'average'|'lightness' }} ctx.params
 *
 * @returns {{
 *   canvas: HTMLCanvasElement,
 *   overlay: HTMLCanvasElement|null,
 *   pdfBytes: null,
 *   dimensions: { width:number, height:number, fileAspectRatio:number }
 * }}
 */
export async function grayscaleOperation({ srcCanvas, srcOverlay, params }) {
  const { grayscaleType = 'luminance' } = params

  const width = srcCanvas.width
  const height = srcCanvas.height

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')

  ctx.drawImage(srcCanvas, 0, 0)

  const imageData = ctx.getImageData(0, 0, width, height)
  const data = imageData.data

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]

    let gray = 0

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

  ctx.putImageData(imageData, 0, 0)

  return {
    canvas,
    overlay: srcOverlay ?? null,
    pdfBytes: null,
    dimensions: {
      width,
      height,
      fileAspectRatio: width / height || 1,
    },
  }
}
