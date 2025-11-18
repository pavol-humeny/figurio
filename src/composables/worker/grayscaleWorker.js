// grayscaleWorker.js
self.onmessage = async (e) => {
  const { data, type } = e.data

  // wait 30s
  await new Promise((resolve) => setTimeout(resolve, 10000))

  const calculateGrayscale = (r, g, b) => {
    switch (type) {
      case 'average':
        return Math.round((r + g + b) / 3)
      case 'lightness':
        return Math.round((Math.max(r, g, b) + Math.min(r, g, b)) / 2)
      case 'luminance':
      default:
        return Math.round(0.299 * r + 0.587 * g + 0.114 * b)
    }
  }

  for (let i = 0; i < data.length; i += 4) {
    const gray = calculateGrayscale(data[i], data[i + 1], data[i + 2])
    data[i] = data[i + 1] = data[i + 2] = gray
  }

  self.postMessage(data)
}
