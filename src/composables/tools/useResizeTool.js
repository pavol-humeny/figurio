import { ref, nextTick, watch } from 'vue'
import { useToastModal } from '../modals/useToastModal'

export function useResizeTool(imageStore, historyStore, t) {
  const { showToastModal } = useToastModal()
  const isUpdatingFromStore = ref(false)
  const maxFileDimensionWidth = ref(10000)
  const maxFileDimensionHeight = ref(10000)

  const isFileDimensionsLinked = ref(true)

  const fileDimensionWidth = ref(imageStore.fileDimensions.width)
  const fileDimensionHeight = ref(imageStore.fileDimensions.height)

  let originalAspectRatio = imageStore.fileDimensions.width / imageStore.fileDimensions.height

  watch(
    () => imageStore.fileDimensions,
    (newVal) => {
      isUpdatingFromStore.value = true

      fileDimensionWidth.value = newVal.width
      fileDimensionHeight.value = newVal.height

      originalAspectRatio = newVal.width / newVal.height

      nextTick(() => {
        FileDimensionWidthInputRef.value?.setValue(fileDimensionWidth.value)
        FileDimensionHeightInputRef.value?.setValue(fileDimensionHeight.value)

        isUpdatingFromStore.value = false
      })
    },
    { immediate: true, deep: true },
  )

  const FileDimensionWidthInputRef = ref(null)
  const FileDimensionHeightInputRef = ref(null)

  const updateFileDimension = (key, value) => {
    if (isUpdatingFromStore.value) return

    if (isNaN(value) || value <= 0) return

    if (key === 'width') {
      if (value > maxFileDimensionWidth.value) {
        value = maxFileDimensionWidth.value
      } else if (value < 1) {
        value = 1
      }

      fileDimensionWidth.value = value
      if (isFileDimensionsLinked.value) {
        const newHeight = Math.round(value / originalAspectRatio)
        if (newHeight < 1) {
          fileDimensionHeight.value = 1
        } else if (newHeight > maxFileDimensionHeight.value) {
          fileDimensionHeight.value = maxFileDimensionHeight.value
        } else {
          fileDimensionHeight.value = newHeight
        }
      }
    } else if (key === 'height') {
      if (value > maxFileDimensionHeight.value) {
        value = maxFileDimensionHeight.value
      } else if (value < 1) {
        value = 1
      }

      fileDimensionHeight.value = value
      if (isFileDimensionsLinked.value) {
        const newWidth = Math.round(value * originalAspectRatio)
        if (newWidth < 1) {
          fileDimensionWidth.value = 1
        } else if (newWidth > maxFileDimensionWidth.value) {
          fileDimensionWidth.value = maxFileDimensionWidth.value
        } else {
          fileDimensionWidth.value = newWidth
        }
      }
    }

    nextTick(() => {
      FileDimensionWidthInputRef.value?.setValue(fileDimensionWidth.value)
      FileDimensionHeightInputRef.value?.setValue(fileDimensionHeight.value)
    })

    applyResize()
  }

  const applyResize = () => {
    console.log('Applying resize with dimensions:', {
      width: fileDimensionWidth.value,
      height: fileDimensionHeight.value,
    })
    imageStore.addImageOperation({
      type: 'resize',
      resizeDimensions: {
        width: fileDimensionWidth.value,
        height: fileDimensionHeight.value,
      },
    })

    applyResizeRender(fileDimensionWidth.value, fileDimensionHeight.value)

    historyStore.push(imageStore.getSnapshot())
  }

  const applyResizeRender = (width, height) => {
    if (width <= 0 || height <= 0) {
      showToastModal(
        'error',
        t('tools.transform.settings.resize.invalidResizeDimensions.title'),
        t('tools.transform.settings.resize.invalidResizeDimensions.message'),
      )
      return
    }

    console.log('Applying resize render with dimensions:', { width, height })

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
