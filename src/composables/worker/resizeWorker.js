// resizeWorker.js
self.onmessage = async (e) => {
  const { imageData, width, height, oldWidth, oldHeight } = e.data

  // Create an offscreen canvas for resizing
  const offscreen = new OffscreenCanvas(width, height)
  const ctx = offscreen.getContext('2d')

  // Put original data into a temporary canvas
  const tmp = new OffscreenCanvas(oldWidth, oldHeight)
  const tctx = tmp.getContext('2d')
  tctx.putImageData(imageData, 0, 0)

  // Draw scaled
  ctx.drawImage(tmp, 0, 0, oldWidth, oldHeight, 0, 0, width, height)

  const resized = ctx.getImageData(0, 0, width, height)

  self.postMessage(resized, [resized.data.buffer])
}
