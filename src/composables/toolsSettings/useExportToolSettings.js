import { ref, computed, nextTick, watch, onMounted, onBeforeUnmount } from 'vue'
import { useMath } from '../common/useMath'

const isVisible = ref(false)

export function useExportToolSettings(imageStore, editorStore, historyStore, t) {
  const { round } = useMath()

  const inputFileNameRef = ref(null)
  // const isDimensionsLinked = ref(true)

  const previewUrl = computed(() => imageStore?.previewUrl || '')

  const expectedPreviewSize = computed(() => {
    if (!imageStore?.previewUrl) return 0
    return estimateDataURLSize(imageStore.previewUrl)
  })

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
    const success = imageStore.setFileName({ name: fileName.value, t, setOnlyNewFileName: true })

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
    } else if (e.key === 'Enter' && isVisible.value) {
      e.preventDefault()
      exportFile()
    }
  }

  onMounted(() => {
    window.addEventListener('keydown', handleKeydown)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('keydown', handleKeydown)
  })

  const estimateDataURLSize = (dataUrl) => {
    const base64String = dataUrl.split(',')[1] // Remove prefix "data:image/png;base64,"
    const base64Length = base64String.length

    // Base64 increases size by 4/3, so reverse calculation:
    const byteLength = Math.floor((base64Length * 3) / 4)

    return round(byteLength / 1024, 1) // in kB
  }

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
    expectedPreviewSize,
  }
}
