import { ref, computed, nextTick, watch } from 'vue'

const isVisible = ref(false)

export function useExportToolSettings(imageStore, t) {
  const inputFileNameRef = ref(null)
  const isDimensionsLinked = ref(true)

  const previewUrl = computed(() => imageStore?.previewUrl || '')

  const fileName = ref('')

  if (imageStore && imageStore.newFileName) {
    fileName.value = imageStore.newFileName
  }
  watch(
    () => imageStore?.newFileName,
    (newVal) => {
      fileName.value = newVal
    },
  )

  const fileFormat = computed({
    get: () => imageStore.newFileFormat,
    set: (value) => (imageStore.newFileFormat = value),
  })

  const fileDimensions = computed(() => imageStore.newFileDimensions)

  const updateDimension = (type, value) => {
    if (!value || value <= 0) return

    if (type === 'width') {
      imageStore.newFileDimensions.width = value

      if (isDimensionsLinked.value) {
        const ratio = imageStore.newFileDimensions.fileAspectRatio
        imageStore.newFileDimensions.height = Math.round(value / ratio)
      }
    }

    if (type === 'height') {
      imageStore.newFileDimensions.height = value

      if (isDimensionsLinked.value) {
        const ratio = imageStore.newFileDimensions.fileAspectRatio
        imageStore.newFileDimensions.width = Math.round(value * ratio)
      }
    }

    if (type === 'quality') {
      imageStore.newFileDimensions.quality = value
    }

    const width = imageStore.newFileDimensions.width
    const height = imageStore.newFileDimensions.height
    if (width > 0 && height > 0) {
      imageStore.newFileDimensions.fileAspectRatio = Math.round((width / height) * 100) / 100
    }
  }

  const saveNewFileName = () => {
    const success = imageStore.setFileName(fileName.value, t, true)

    if (success) {
      nextTick(() => {
        inputFileNameRef.value?.blur()
      })
    }
  }

  const openExportToolSettings = async () => {
    await imageStore.generatePreviewWithFrame()

    isVisible.value = true

    if (imageStore.imageOperations.frame?.enabled) {
      imageStore.newFileDimensions = {
        width: imageStore.imageOperations.frame.width * 2 + imageStore.fileDimensions.width,
        height: imageStore.imageOperations.frame.height * 2 + imageStore.fileDimensions.height,
        fileAspectRatio:
          (imageStore.imageOperations.frame.width * 2 + imageStore.fileDimensions.width) /
            (imageStore.imageOperations.frame.height * 2 + imageStore.fileDimensions.height) || 1,
      }
    } else {
      imageStore.newFileDimensions = { ...imageStore.fileDimensions }
    }
  }

  const closeExportToolSettings = () => {
    isVisible.value = false
  }

  const exportFile = () => {
    const success = imageStore.exportFile(t)
    if (!success) {
      console.error('Failed to export file')
      return
    }
    isVisible.value = false
  }

  const resetFileDimensions = () => {
    imageStore.newFileDimensions = {
      width: imageStore.fileDimensions.width,
      height: imageStore.fileDimensions.height,
      fileAspectRatio: imageStore.fileDimensions.fileAspectRatio,
    }
    isDimensionsLinked.value = true
  }

  return {
    isVisible,
    inputFileNameRef,
    fileName,
    fileFormat,
    fileDimensions,
    updateDimension,
    saveNewFileName,
    resetFileDimensions,
    openExportToolSettings,
    closeExportToolSettings,
    exportFile,
    isDimensionsLinked,
    previewUrl,
  }
}
