/**
 * @file: canvasWorker.js
 * @author: Pavol Humeny
 * @date: 15.5.2026
 * @description: Web Worker for processing canvas image data in the editor, allowing for off-main-thread image manipulation to keep the UI responsive.
 */

self.onmessage = (event) => {
  const { width, height, imageDataBuffer } = event.data
  const pixels = new Uint8ClampedArray(imageDataBuffer)

  // Length MUST be exactly width * height * 4
  if (pixels.length !== width * height * 4) {
    return
  }

  const imageData = new ImageData(pixels, width, height)
  self.postMessage({ imageData }, [imageData.data.buffer])
}
