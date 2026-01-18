// grayscale.worker.js

self.onmessage = (e) => {
  console.warn('Grayscale worker started processing')

  const { bitmap, grayscaleType } = e.data

  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height)
  const ctx = canvas.getContext('2d')

  ctx.drawImage(bitmap, 0, 0)

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const data = imageData.data

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

  ctx.putImageData(imageData, 0, 0)

  const resultBitmap = canvas.transferToImageBitmap()
  self.postMessage(resultBitmap, [resultBitmap])

  console.warn('Grayscale worker finished processing')
}
