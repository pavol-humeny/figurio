import { useMath } from '@/composables/common/useMath'
import { computed, ref, nextTick, watch } from 'vue'

export function useCropTool(imageStore, viewportStore, freeCropBox) {
  const { clamp } = useMath()

  const maxCropPositionX = computed(() => {
    return imageStore.fileDimensions.width - freeCropBox.value.width
  })
  const maxCropPositionY = computed(() => {
    return imageStore.fileDimensions.height - freeCropBox.value.height
  })
  const cropPositionX = computed({
    get: () => freeCropBox.value.x,
    set: (value) => {
      freeCropBox.value.x = Math.round(clamp(value, 0, maxCropPositionX.value))
    },
  })

  const cropPositionY = computed({
    get: () => freeCropBox.value.y,
    set: (value) => {
      freeCropBox.value.y = Math.round(clamp(value, 0, maxCropPositionY.value))
    },
  })

  const widthInputRef = ref(null)
  const heightInputRef = ref(null)
  const PositionXInputRef = ref(null)
  const PositionYInputRef = ref(null)

  const isDimensionsLinked = ref(false)

  const maxCropWidth = computed(() => {
    return imageStore.fileDimensions.width - freeCropBox.value.x
  })
  const maxCropHeight = computed(() => {
    return imageStore.fileDimensions.height - freeCropBox.value.y
  })

  const cropWidth = computed({
    get: () => freeCropBox.value.width,
    set: (value) => {
      freeCropBox.value.width = Math.round(clamp(value, 0, maxCropWidth.value))
    },
  })

  const cropHeight = computed({
    get: () => freeCropBox.value.height,
    set: (value) => {
      freeCropBox.value.height = Math.round(clamp(value, 0, maxCropHeight.value))
    },
  })

  const tmpCropWidth = ref(freeCropBox.value.width)
  const tmpCropHeight = ref(freeCropBox.value.height)

  watch(
    () => freeCropBox.value.width,
    (val) => {
      tmpCropWidth.value = val
    },
  )

  watch(
    () => freeCropBox.value.height,
    (val) => {
      tmpCropHeight.value = val
    },
  )

  const updateDimension = (key, value) => {
    const originalWidth = freeCropBox.value.width
    const originalHeight = freeCropBox.value.height

    if (key === 'width') {
      const clampedWidth = Math.round(clamp(value, 0, maxCropWidth.value))

      if (isDimensionsLinked.value && originalWidth > 0) {
        const aspectRatio = originalHeight / originalWidth
        freeCropBox.value.width = clampedWidth
        freeCropBox.value.height = Math.round(
          clamp(clampedWidth * aspectRatio, 0, maxCropHeight.value),
        )
      } else {
        freeCropBox.value.width = clampedWidth
      }
    } else if (key === 'height') {
      const clampedHeight = Math.round(clamp(value, 0, maxCropHeight.value))

      if (isDimensionsLinked.value && originalHeight > 0) {
        const aspectRatio = originalWidth / originalHeight
        freeCropBox.value.height = clampedHeight
        freeCropBox.value.width = Math.round(
          clamp(clampedHeight * aspectRatio, 0, maxCropWidth.value),
        )
      } else {
        freeCropBox.value.height = clampedHeight
      }
    }
    nextTick(() => {
      heightInputRef.value.value = cropHeight.value
      widthInputRef.value.value = cropWidth.value
    })
  }

  const updatePosition = (key, value) => {
    if (key === 'x') {
      freeCropBox.value.x = Math.round(clamp(value, 0, maxCropPositionX.value))
    } else if (key === 'y') {
      freeCropBox.value.y = Math.round(clamp(value, 0, maxCropPositionY.value))
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
      freeCropBox.value.dragging = true
      freeCropBox.value.startX = event.clientX
      freeCropBox.value.startY = event.clientY

      const onMouseMove = (e) => {
        const dx = e.clientX - freeCropBox.value.startX
        const dy = e.clientY - freeCropBox.value.startY
        freeCropBox.value.x = Math.round(
          clamp(
            freeCropBox.value.x + dx / viewportStore.realZoomLevel,
            0,
            imageStore.fileDimensions.width - freeCropBox.value.width,
          ),
        )
        freeCropBox.value.y = Math.round(
          clamp(
            freeCropBox.value.y + dy / viewportStore.realZoomLevel,
            0,
            imageStore.fileDimensions.height - freeCropBox.value.height,
          ),
        )
        freeCropBox.value.startX = e.clientX
        freeCropBox.value.startY = e.clientY
      }

      const onMouseUp = () => {
        freeCropBox.value.dragging = false
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
    freeCropBox.value.resizing = true
    freeCropBox.value.resizeDir = direction
    freeCropBox.value.startX = e.clientX
    freeCropBox.value.startY = e.clientY

    const onMouseMove = (ev) => {
      const dx = ev.clientX - freeCropBox.value.startX
      const dy = ev.clientY - freeCropBox.value.startY

      if (direction.includes('right')) {
        freeCropBox.value.width = Math.round(
          clamp(
            freeCropBox.value.width + dx / viewportStore.realZoomLevel,
            0,
            imageStore.fileDimensions.width - freeCropBox.value.x,
          ),
        )
      }
      if (direction.includes('left')) {
        if (freeCropBox.value.width > 0) {
          freeCropBox.value.x = Math.round(
            clamp(
              freeCropBox.value.x + dx / viewportStore.realZoomLevel,
              0,
              imageStore.fileDimensions.width - freeCropBox.value.width,
            ),
          )
        }
        if (freeCropBox.value.x > 0 || dx > 0) {
          freeCropBox.value.width = Math.round(
            clamp(
              freeCropBox.value.width - dx / viewportStore.realZoomLevel,
              0,
              imageStore.fileDimensions.width - freeCropBox.value.x,
            ),
          )
        }
      }
      if (direction.includes('bottom')) {
        freeCropBox.value.height = Math.round(
          clamp(
            freeCropBox.value.height + dy / viewportStore.realZoomLevel,
            0,
            imageStore.fileDimensions.height - freeCropBox.value.y,
          ),
        )
      }
      if (direction.includes('top')) {
        if (freeCropBox.value.height > 0) {
          freeCropBox.value.y = Math.round(
            clamp(
              freeCropBox.value.y + dy / viewportStore.realZoomLevel,
              0,
              imageStore.fileDimensions.height - freeCropBox.value.height,
            ),
          )
        }
        if (freeCropBox.value.y > 0 || dy > 0) {
          freeCropBox.value.height = Math.round(
            clamp(
              freeCropBox.value.height - dy / viewportStore.realZoomLevel,
              0,
              imageStore.fileDimensions.height - freeCropBox.value.y,
            ),
          )
        }
      }

      freeCropBox.value.startX = ev.clientX
      freeCropBox.value.startY = ev.clientY
    }

    const onMouseUp = () => {
      freeCropBox.value.resizing = false
      freeCropBox.value.resizeDir = ''
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
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
  }
}
