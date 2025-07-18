import { ref, computed, nextTick, watch, onMounted, onBeforeUnmount } from 'vue'

const isVisible = ref(false)

export function useExportToolSettings(imageStore, editorStore, historyStore, t) {
  const inputFileNameRef = ref(null)
  // const isDimensionsLinked = ref(true)

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

  watch(
    () => fileFormat.value,
    async () => {
      if (isVisible.value) {
        await imageStore.generatePreview(editorStore, historyStore, t)
      }
    },
  )

  const fileDimensions = computed(() => imageStore.newFileDimensions)

  const updateQuality = async (value) => {
    imageStore.newFileDimensions.quality = value
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
    imageStore.newFileDimensions = { ...imageStore.fileDimensions }
    imageStore.newFileFormat = imageStore.fileFormat
    imageStore.newFileName = imageStore.fileName

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

    await imageStore.generatePreview(editorStore, historyStore, t)

    isVisible.value = true
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

  const copyImageToClipboard = async () => {
    await imageStore.copyImageToClipboard(t)
  }

  const handleKeydown = (e) => {
    if (e.key === 'Escape' && isVisible.value) {
      e.preventDefault()
      closeExportToolSettings()
    }
  }

  onMounted(() => {
    window.addEventListener('keydown', handleKeydown)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('keydown', handleKeydown)
  })

  return {
    isVisible,
    inputFileNameRef,
    fileName,
    fileFormat,
    fileDimensions,
    updateQuality,
    saveNewFileName,
    openExportToolSettings,
    closeExportToolSettings,
    exportFile,
    previewUrl,
    copyImageToClipboard,
  }
}
