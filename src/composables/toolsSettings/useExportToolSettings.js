import { ref, computed, nextTick, watch } from 'vue'

const isVisible = ref(false)

export function useExportToolSettings(imageStore, t) {
  const inputFileNameRef = ref(null)
  
  const fileName = ref('')
  if (imageStore && imageStore.fileName) {
    fileName.value = imageStore.fileName
  }
  watch(() => imageStore?.fileName, (newVal) => {
    fileName.value = newVal
  })

  const fileFormat = computed({
    get: () => imageStore.newFileFormat,
    set: (value) => imageStore.newFileFormat = value
  })
  const fileDimensions = computed({
    get: () => imageStore.newFileDimensions,
    set: (value) => {
      imageStore.newFileDimensions.width = value.width
      imageStore.newFileDimensions.height = value.height
    }
  })

  const saveNewFileName = () => {
    imageStore.setFileName(fileName.value, t)
    nextTick(() => {
      inputFileNameRef.value?.blur()
    })
  }

  const openExportToolSettings = () => {
    isVisible.value = true
  }

  const closeExportToolSettings = () => {
    isVisible.value = false
  }

  return {
    isVisible,
    inputFileNameRef,
    fileName,
    fileFormat,
    fileDimensions,
    saveNewFileName,
    openExportToolSettings,
    closeExportToolSettings
  }
}
