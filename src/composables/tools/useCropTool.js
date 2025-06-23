import { useMath } from '@/composables/common/useMath'
import { computed, ref, nextTick, watch, onMounted } from 'vue'

const cropRatio = ref(null)

const cropBox = ref({
  x: 0,
  y: 0,
  width: 100,
  height: 100,
  dragging: false,
  resizing: false,
  resizeDir: '',
  startX: 0,
  startY: 0,
})

export function useCropTool(imageStore, viewportStore, editorStore, t) {
  const { clamp } = useMath()

  watch(
    () => imageStore.fileDimensions,
    (fileDimensions) => {
      if (fileDimensions.width && fileDimensions.height) {
        cropBox.value.width = fileDimensions.width
        cropBox.value.height = fileDimensions.height
        cropBox.value.x = 0
        cropBox.value.y = 0
      }
    },
    { immediate: true, deep: true },
  )

  const maxCropPositionX = computed(() => {
    return imageStore.fileDimensions.width - cropBox.value.width
  })
  const maxCropPositionY = computed(() => {
    return imageStore.fileDimensions.height - cropBox.value.height
  })
  const cropPositionX = computed({
    get: () => cropBox.value.x,
    set: (value) => {
      cropBox.value.x = Math.round(clamp(value, 0, maxCropPositionX.value))
    },
  })

  const cropPositionY = computed({
    get: () => cropBox.value.y,
    set: (value) => {
      cropBox.value.y = Math.round(clamp(value, 0, maxCropPositionY.value))
    },
  })

  const widthInputRef = ref(null)
  const heightInputRef = ref(null)
  const PositionXInputRef = ref(null)
  const PositionYInputRef = ref(null)

  const isDimensionsLinked = ref(false)

  const maxCropWidth = computed(() => {
    return imageStore.fileDimensions.width - cropBox.value.x
  })
  const maxCropHeight = computed(() => {
    return imageStore.fileDimensions.height - cropBox.value.y
  })

  const cropWidth = computed({
    get: () => cropBox.value.width,
    set: (value) => {
      cropBox.value.width = Math.round(clamp(value, 0, maxCropWidth.value))
    },
  })

  const cropHeight = computed({
    get: () => cropBox.value.height,
    set: (value) => {
      cropBox.value.height = Math.round(clamp(value, 0, maxCropHeight.value))
    },
  })

  const tmpCropWidth = ref(cropBox.value.width)
  const tmpCropHeight = ref(cropBox.value.height)

  watch(
    () => cropBox.value.width,
    (val) => {
      tmpCropWidth.value = val
    },
  )

  watch(
    () => cropBox.value.height,
    (val) => {
      tmpCropHeight.value = val
    },
  )

  const updateDimension = (key, value) => {
    const originalWidth = cropBox.value.width
    const originalHeight = cropBox.value.height

    if (key === 'width') {
      const clampedWidth = Math.round(clamp(value, 0, maxCropWidth.value))

      // Crop ratio is set
      if (cropRatio.value !== null) {
        cropBox.value.width = clampedWidth
        cropBox.value.height = Math.round(
          clamp(clampedWidth / cropRatio.value, 0, maxCropHeight.value),
        )
        if (cropBox.value.height === maxCropHeight.value) {
          cropBox.value.width = cropBox.value.height
        }
      }
      // Dimensions are linked
      else if (isDimensionsLinked.value && originalWidth > 0) {
        const aspectRatio = originalHeight / originalWidth
        cropBox.value.width = clampedWidth
        cropBox.value.height = Math.round(clamp(clampedWidth * aspectRatio, 0, maxCropHeight.value))
      }
      // Free crop
      else {
        cropBox.value.width = clampedWidth
      }
    } else if (key === 'height') {
      const clampedHeight = Math.round(clamp(value, 0, maxCropHeight.value))

      if (cropRatio.value !== 0) {
        cropBox.value.height = clampedHeight
        cropBox.value.width = Math.round(
          clamp(clampedHeight / cropRatio.value, 0, maxCropWidth.value),
        )
        if (cropBox.value.width === maxCropWidth.value) {
          cropBox.value.height = cropBox.value.width
        }
      }
      // Dimensions are linked
      else if (isDimensionsLinked.value && originalHeight > 0) {
        const aspectRatio = originalWidth / originalHeight
        cropBox.value.height = clampedHeight
        cropBox.value.width = Math.round(clamp(clampedHeight * aspectRatio, 0, maxCropWidth.value))
      }
      // Free crop
      else {
        cropBox.value.height = clampedHeight
      }
    }
    nextTick(() => {
      heightInputRef.value.value = cropHeight.value
      widthInputRef.value.value = cropWidth.value
    })
  }

  const updatePosition = (key, value) => {
    if (key === 'x') {
      cropBox.value.x = Math.round(clamp(value, 0, maxCropPositionX.value))
    } else if (key === 'y') {
      cropBox.value.y = Math.round(clamp(value, 0, maxCropPositionY.value))
    }
    nextTick(() => {
      PositionXInputRef.value.value = cropPositionX.value
      PositionYInputRef.value.value = cropPositionY.value
    })
  }

  // Drag
  const startPan = (event) => {
    if (event.button !== 1) {
      event.preventDefault()
      cropBox.value.dragging = true
      cropBox.value.startX = event.clientX
      cropBox.value.startY = event.clientY

      const onMouseMove = (e) => {
        const dx = e.clientX - cropBox.value.startX
        const dy = e.clientY - cropBox.value.startY
        cropBox.value.x = Math.round(
          clamp(
            cropBox.value.x + dx / viewportStore.realZoomLevel,
            0,
            imageStore.fileDimensions.width - cropBox.value.width,
          ),
        )
        cropBox.value.y = Math.round(
          clamp(
            cropBox.value.y + dy / viewportStore.realZoomLevel,
            0,
            imageStore.fileDimensions.height - cropBox.value.height,
          ),
        )
        cropBox.value.startX = e.clientX
        cropBox.value.startY = e.clientY
      }

      const onMouseUp = () => {
        cropBox.value.dragging = false
        document.removeEventListener('mousemove', onMouseMove)
        document.removeEventListener('mouseup', onMouseUp)
      }

      document.addEventListener('mousemove', onMouseMove)
      document.addEventListener('mouseup', onMouseUp)
    }
  }

  // Resize
  const startResize = (e, direction) => {
    e.preventDefault()
    e.stopPropagation()
    cropBox.value.resizing = true
    cropBox.value.resizeDir = direction
    cropBox.value.startX = e.clientX
    cropBox.value.startY = e.clientY

    // Ulož pôvodný pomer strán len raz
    let originalAspectRatio = cropBox.value.width / cropBox.value.height

    const onMouseMove = (ev) => {
      const dx = ev.clientX - cropBox.value.startX
      const dy = ev.clientY - cropBox.value.startY
      const dxNorm = dx / viewportStore.realZoomLevel
      const dyNorm = dy / viewportStore.realZoomLevel
      const isShiftPressed = ev.shiftKey

      const getActiveRatio = () => {
        if (cropRatio.value !== null) return cropRatio.value
        if (isShiftPressed) return originalAspectRatio
        return null
      }

      const ratio = getActiveRatio()

      if (direction.includes('right')) {
        if (ratio !== null) {
          const maxWidth = Math.min(
            imageStore.fileDimensions.width - cropBox.value.x,
            (imageStore.fileDimensions.height - cropBox.value.y) * ratio,
          )
          const newWidth = clamp(cropBox.value.width + dxNorm, 0, maxWidth)
          cropBox.value.width = Math.round(newWidth)
          cropBox.value.height = Math.round(newWidth / ratio)
        } else {
          cropBox.value.width = Math.round(
            clamp(
              cropBox.value.width + dxNorm,
              0,
              imageStore.fileDimensions.width - cropBox.value.x,
            ),
          )
        }
      }

      if (direction.includes('left')) {
        if (ratio !== null) {
          const newWidth = clamp(
            cropBox.value.width - dxNorm,
            0,
            Math.min(
              cropBox.value.x + cropBox.value.width,
              (imageStore.fileDimensions.height - cropBox.value.y) * ratio,
            ),
          )
          const newHeight = newWidth / ratio
          const maxX = cropBox.value.x + cropBox.value.width

          cropBox.value.width = Math.round(newWidth)
          cropBox.value.height = Math.round(newHeight)
          cropBox.value.x = Math.round(
            clamp(maxX - cropBox.value.width, 0, imageStore.fileDimensions.width),
          )
        } else {
          if (cropBox.value.width > 0) {
            cropBox.value.x = Math.round(
              clamp(
                cropBox.value.x + dxNorm,
                0,
                imageStore.fileDimensions.width - cropBox.value.width,
              ),
            )
          }
          if (cropBox.value.x > 0 || dx > 0) {
            cropBox.value.width = Math.round(
              clamp(
                cropBox.value.width - dxNorm,
                0,
                imageStore.fileDimensions.width - cropBox.value.x,
              ),
            )
          }
        }
      }

      if (direction.includes('bottom')) {
        if (ratio !== null) {
          const maxHeight = Math.min(
            imageStore.fileDimensions.height - cropBox.value.y,
            (imageStore.fileDimensions.width - cropBox.value.x) / ratio,
          )
          const newHeight = clamp(cropBox.value.height + dyNorm, 0, maxHeight)
          cropBox.value.height = Math.round(newHeight)
          cropBox.value.width = Math.round(newHeight * ratio)
        } else {
          cropBox.value.height = Math.round(
            clamp(
              cropBox.value.height + dyNorm,
              0,
              imageStore.fileDimensions.height - cropBox.value.y,
            ),
          )
        }
      }

      if (direction.includes('top')) {
        if (ratio !== null) {
          const newHeight = clamp(
            cropBox.value.height - dyNorm,
            0,
            Math.min(
              cropBox.value.y + cropBox.value.height,
              (imageStore.fileDimensions.width - cropBox.value.x) / ratio,
            ),
          )
          const newWidth = newHeight * ratio
          const maxY = cropBox.value.y + cropBox.value.height

          cropBox.value.height = Math.round(newHeight)
          cropBox.value.width = Math.round(newWidth)
          cropBox.value.y = Math.round(
            clamp(maxY - cropBox.value.height, 0, imageStore.fileDimensions.height),
          )
        } else {
          if (cropBox.value.height > 0) {
            cropBox.value.y = Math.round(
              clamp(
                cropBox.value.y + dyNorm,
                0,
                imageStore.fileDimensions.height - cropBox.value.height,
              ),
            )
          }
          if (cropBox.value.y > 0 || dy > 0) {
            cropBox.value.height = Math.round(
              clamp(
                cropBox.value.height - dyNorm,
                0,
                imageStore.fileDimensions.height - cropBox.value.y,
              ),
            )
          }
        }
      }

      cropBox.value.startX = ev.clientX
      cropBox.value.startY = ev.clientY
    }

    const onMouseUp = () => {
      cropBox.value.resizing = false
      cropBox.value.resizeDir = ''
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }

  // Set default sub-tool on mount
  onMounted(() => {
    editorStore.selectSubTool('cropFree')
  })

  // Select type of crop
  const selectSubTool = (subTool) => {
    editorStore.selectSubTool(subTool)
    cropBox.value.x = 0
    cropBox.value.y = 0

    const { width: fileWidth, height: fileHeight } = imageStore.fileDimensions

    let cropWidth = fileWidth
    let cropHeight = fileHeight

    switch (subTool) {
      case 'cropFree':
        cropRatio.value = null
        cropBox.value.width = fileWidth
        cropBox.value.height = fileHeight
        break

      case 'crop11':
        cropRatio.value = 1
        if (fileWidth >= fileHeight) {
          cropHeight = fileHeight
          cropWidth = fileHeight
        } else {
          cropWidth = fileWidth
          cropHeight = fileWidth
        }
        break

      case 'crop43':
        cropRatio.value = 4 / 3
        if (fileWidth / fileHeight >= cropRatio.value) {
          cropHeight = fileHeight
          cropWidth = fileHeight * cropRatio.value
        } else {
          cropWidth = fileWidth
          cropHeight = fileWidth / cropRatio.value
        }
        break

      case 'crop34':
        cropRatio.value = 3 / 4
        if (fileWidth / fileHeight >= cropRatio.value) {
          cropHeight = fileHeight
          cropWidth = fileHeight * cropRatio.value
        } else {
          cropWidth = fileWidth
          cropHeight = fileWidth / cropRatio.value
        }
        break

      case 'crop169':
        cropRatio.value = 16 / 9
        if (fileWidth / fileHeight >= cropRatio.value) {
          cropHeight = fileHeight
          cropWidth = fileHeight * cropRatio.value
        } else {
          cropWidth = fileWidth
          cropHeight = fileWidth / cropRatio.value
        }
        break

      case 'crop916':
        cropRatio.value = 9 / 16
        if (fileWidth / fileHeight >= cropRatio.value) {
          cropHeight = fileHeight
          cropWidth = fileHeight * cropRatio.value
        } else {
          cropWidth = fileWidth
          cropHeight = fileWidth / cropRatio.value
        }
        break
    }

    // Set crop box dimensions
    cropBox.value.width = Math.round(cropWidth)
    cropBox.value.height = Math.round(cropHeight)

    // Set crop box position to center
    cropBox.value.x = Math.round((fileWidth - cropBox.value.width) / 2)
    cropBox.value.y = Math.round((fileHeight - cropBox.value.height) / 2)
  }

  const applyCrop = () => {
    imageStore.applyCrop(cropBox.value, t)
  }

  return {
    startPan,
    startResize,
    cropWidth,
    maxCropWidth,
    widthInputRef,
    tmpCropWidth,
    cropHeight,
    maxCropHeight,
    heightInputRef,
    tmpCropHeight,
    updateDimension,
    isDimensionsLinked,
    cropPositionX,
    cropPositionY,
    maxCropPositionX,
    maxCropPositionY,
    updatePosition,
    PositionXInputRef,
    PositionYInputRef,
    selectSubTool,
    cropRatio,
    cropBox,
    applyCrop,
  }
}
