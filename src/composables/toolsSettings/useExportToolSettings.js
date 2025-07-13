import { ref, computed, nextTick, watch } from 'vue'

const isVisible = ref(false)

export function useExportToolSettings(imageStore, editorStore, historyStore, t) {
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

  const updateDimension = async (type, value) => {
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

    await imageStore.generatePreview(editorStore, historyStore, t)
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
    await imageStore.generatePreview(editorStore, historyStore, t)

    isVisible.value = true

    if (imageStore.frame?.enabled) {
      imageStore.newFileDimensions.width =
        imageStore.fileDimensions.width + imageStore.frame.width * 2
      if (imageStore.frame.headerSize > 0) {
        imageStore.newFileDimensions.height =
          imageStore.fileDimensions.height + imageStore.frame.height + imageStore.frame.headerSize
      } else if (imageStore.frame.footerSize > 0) {
        imageStore.newFileDimensions.height =
          imageStore.fileDimensions.height + imageStore.frame.height + imageStore.frame.footerSize
      } else {
        imageStore.newFileDimensions.height =
          imageStore.fileDimensions.height + imageStore.frame.height * 2
      }
    } else {
      imageStore.newFileDimensions = { ...imageStore.fileDimensions }
    }
  }

  const closeExportToolSettings = () => {
    isVisible.value = false
  }

  const exportFile = () => {
    const success = imageStore.exportFile(editorStore, historyStore, t)
    if (!success) {
      console.error('Failed to export file')
      return
    }
    isVisible.value = false
  }

  const resetFileDimensions = async () => {
    imageStore.newFileDimensions = {
      width: imageStore.fileDimensions.width,
      height: imageStore.fileDimensions.height,
      fileAspectRatio: imageStore.fileDimensions.fileAspectRatio,
    }
    isDimensionsLinked.value = true

    await imageStore.generatePreview(editorStore, historyStore, t)
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
