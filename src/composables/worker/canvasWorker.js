// Worker
self.onmessage = (event) => {
  const { width, height, imageDataBuffer } = event.data
  const pixels = new Uint8ClampedArray(imageDataBuffer)

  // length MUST be exactly width * height * 4
  if (pixels.length !== width * height * 4) {
    console.error('Invalid ImageData length', pixels.length, width, height)
    return
  }

  const imageData = new ImageData(pixels, width, height)
  self.postMessage({ imageData }, [imageData.data.buffer])
}
