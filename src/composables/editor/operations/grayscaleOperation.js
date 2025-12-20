/**
 * Grayscale operation for canvas + overlay
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

  const applyGrayscale = (sourceCanvas) => {
    const canvas = document.createElement('canvas')
    canvas.width = sourceCanvas.width
    canvas.height = sourceCanvas.height

    const ctx = canvas.getContext('2d')
    ctx.drawImage(sourceCanvas, 0, 0)

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]
      // alpha (data[i + 3]) stays untouched

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

    ctx.putImageData(imageData, 0, 0)
    return canvas
  }

  const canvas = applyGrayscale(srcCanvas)
  const overlay = srcOverlay ? applyGrayscale(srcOverlay) : null

  return {
    canvas,
    overlay,
    pdfBytes: null,
    dimensions: {
      width: canvas.width,
      height: canvas.height,
      fileAspectRatio: canvas.width / canvas.height || 1,
    },
  }
}
