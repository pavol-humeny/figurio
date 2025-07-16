import { ref, nextTick } from 'vue'

export function useResizeTool(imageStore, historyStore, t) {
  const maxFileDimensionWidth = ref(10000)
  const maxFileDimensionHeight = ref(10000)

  const isFileDimensionsLinked = ref(false)

  const fileDimensionWidth = ref(imageStore.fileDimensions.width)
  const fileDimensionHeight = ref(imageStore.fileDimensions.height)

  const originalAspectRatio = imageStore.fileDimensions.width / imageStore.fileDimensions.height

  const FileDimensionWidthInputRef = ref(null)
  const FileDimensionHeightInputRef = ref(null)

  const updateFileDimension = (key, value) => {
    console.log(`Updating file dimension: ${key} = ${value}`)
    if (isNaN(value) || value <= 0) return

    if (key === 'width') {
      if (value > maxFileDimensionWidth.value) {
        value = maxFileDimensionWidth.value
      } else if (value < 1) {
        value = 1
      }

      fileDimensionWidth.value = value
      if (isFileDimensionsLinked.value) {
        fileDimensionHeight.value = Math.round(value / originalAspectRatio)
      }
    } else if (key === 'height') {
      if (value > maxFileDimensionHeight.value) {
        value = maxFileDimensionHeight.value
      } else if (value < 1) {
        value = 1
      }

      fileDimensionHeight.value = value
      if (isFileDimensionsLinked.value) {
        fileDimensionWidth.value = Math.round(value * originalAspectRatio)
      }
    }

    nextTick(() => {
      FileDimensionWidthInputRef.value?.setValue(fileDimensionWidth.value)
      FileDimensionHeightInputRef.value?.setValue(fileDimensionHeight.value)
    })

    applyResize()
  }

  const applyResize = () => {
    imageStore.addImageOperation({
      type: 'resize',
      dimensions: {
        width: fileDimensionWidth.value,
        height: fileDimensionHeight.value,
      },
    })

    applyResizeRender(fileDimensionWidth.value, fileDimensionHeight.value)

    historyStore.push(imageStore.getSnapshot())
  }

  const applyResizeRender = (width, height) => {
    const oldImage = imageStore.getRenderedImage()
    if (!oldImage) return

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    canvas.width = width
    canvas.height = height

    ctx.drawImage(oldImage, 0, 0, width, height)

    imageStore.setRenderedImage(canvas)

    imageStore.fileDimensions = {
      width,
      height,
      fileAspectRatio: width / height || 1,
    }
  }

  return {
    fileDimensionWidth,
    fileDimensionHeight,
    maxFileDimensionWidth,
    maxFileDimensionHeight,
    isFileDimensionsLinked,
    FileDimensionWidthInputRef,
    FileDimensionHeightInputRef,
    updateFileDimension,
    applyResize,
    applyResizeRender,
  }
}
