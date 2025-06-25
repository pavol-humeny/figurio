import { ref } from 'vue'

export function useFrameTool(imageStore, historyStore, editorStore, t) {
  const frameColor = ref('#000000')
  const frameWidth = ref(0)
  const frameWidthRef = ref(null)

  const setFrameWidth = (width) => {
    if (width < 0) {
      width = 0
    }
    frameWidth.value = width

    frameWidthRef.value.setValue(width)

    applyFrame()
  }

  const applyFrame = () => {
    const sourceCanvas = imageStore.renderedImage
    if (!sourceCanvas || frameWidth.value <= 0) return

    const fw = frameWidth.value
    const newWidth = sourceCanvas.width + fw * 2
    const newHeight = sourceCanvas.height + fw * 2

    const canvas = document.createElement('canvas')
    canvas.width = newWidth
    canvas.height = newHeight

    const ctx = canvas.getContext('2d')

    // Draw frame
    ctx.fillStyle = frameColor.value
    ctx.fillRect(0, 0, newWidth, newHeight)

    // Draw the original image in the center
    ctx.drawImage(sourceCanvas, fw, fw)

    // Update store
    imageStore.renderedImage = canvas
    imageStore.previewUrl = canvas.toDataURL()

    imageStore.fileDimensions.width = newWidth
    imageStore.fileDimensions.height = newHeight
    imageStore.fileDimensions.fileAspectRatio = newWidth / newHeight
    imageStore.newFileDimensions = { ...imageStore.fileDimensions }

    historyStore.push(imageStore.getSnapshot())
  }

  return {
    frameColor,
    frameWidthRef,
    frameWidth,
    setFrameWidth,
  }
}
