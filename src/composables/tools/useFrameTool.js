import { ref, watch } from 'vue'

export function useFrameTool(imageStore, historyStore, editorStore, t) {
  const frameColor = ref(imageStore.imageOperations.frame.color || '#000000')
  const frameWidth = ref(imageStore.imageOperations.frame.width || 0)
  const frameWidthRef = ref(null)

  // watch color
  watch(frameColor, (newColor) => {
    if (newColor) {
      if (frameWidth.value <= 0) {
        resetFrame()
      } else {
        applyFrame()
      }
    }
  })

  const setFrameWidth = (width) => {
    if (width <= 0) {
      resetFrame()
      width = 0
      frameWidthRef.value.setValue(width)
    } else {
      frameWidth.value = width
      frameWidthRef.value.setValue(width)
      applyFrame()
    }
  }

  const applyFrame = () => {
    const width = frameWidth.value
    const color = frameColor.value
    imageStore.imageOperations.frame.color = color
    imageStore.imageOperations.frame.width = width
    imageStore.imageOperations.frame.enabled = true

    historyStore.push(imageStore.getSnapshot())
  }

  const resetFrame = () => {
    console.log('Resetting frame tool')
    imageStore.imageOperations.frame.enabled = false
  }

  const applyFrameRender = () => {
    const sourceCanvas = imageStore.renderedImage
    if (!sourceCanvas) return

    const fw = imageStore.imageOperations.frame.width
    const newWidth = imageStore.fileDimensions.width + fw * 2
    const newHeight = imageStore.fileDimensions.height + fw * 2

    const canvas = document.createElement('canvas')
    canvas.width = newWidth
    canvas.height = newHeight

    const ctx = canvas.getContext('2d')

    // Draw frame
    ctx.fillStyle = imageStore.imageOperations.frame.color
    ctx.fillRect(0, 0, newWidth, newHeight)

    // Draw the original image in the center
    ctx.drawImage(sourceCanvas, fw, fw)

    // Update store
    imageStore.renderedImage = canvas
    // imageStore.previewUrl = canvas.toDataURL()

    // imageStore.imageOperations.frame.frameFileDimensions = {
    //   fileAspectRatio: newWidth / newHeight,
    //   width: newWidth,
    //   height: newHeight,
    //   quality: 100,
    // }

    // imageStore.fileDimensions.width = newWidth
    // imageStore.fileDimensions.height = newHeight
    // imageStore.fileDimensions.fileAspectRatio = newWidth / newHeight
    // imageStore.newFileDimensions = { ...imageStore.fileDimensions }
  }

  return {
    frameColor,
    frameWidthRef,
    frameWidth,
    setFrameWidth,
    applyFrameRender,
  }
}
