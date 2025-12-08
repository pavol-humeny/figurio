import { ref, computed, nextTick, watch } from 'vue'
import { useMath } from '../common/useMath'
import { editorConfig } from '@/config/editorConfig'
import { useConsole } from '@/composables/common/useConsole.js'
const { error } = useConsole()

/**
 * Visibility state of the export panel
 */
const isVisible = ref(false)

/**
 * Logic for the export panel, including preview, file name, format, and export action
 *
 * @param {object} imageStore - Store managing image state
 * @param {object} editorStore - Store managing editor state
 * @param {object} historyStore - Store managing undo/redo history
 * @param {Function} t - Translation function
 * @returns {object} Export tool settings logic
 */
export function useExportToolSettings(imageStore, editorStore, historyStore, t) {
  const { round } = useMath()

  /**
   * Ref to the file name input for managing focus
   */
  const inputFileNameRef = ref(null)

  /**
   * Reactive file name field used in the export panel
   */
  const fileName = ref('')

  // Initialize file name from the image store
  if (imageStore && imageStore.newFileName) {
    fileName.value = imageStore.newFileName
  }

  /**
   * Watch for changes in the file name from store and update local value
   */
  watch(
    () => imageStore?.newFileName,
    (newVal) => {
      fileName.value = newVal
    },
  )

  /**
   * Reactive file format field used in the export panel
   */
  const fileFormat = computed({
    get: () => imageStore.newFileFormat,
    set: (value) => (imageStore.newFileFormat = value),
  })

  /**
   * Reactive preview URL field used in the export panel
   */
  const previewUrl = computed(() => imageStore?.previewUrl || '')

  /**
   * Estimate the size of the preview image in kB
   */
  const expectedPreviewSize = computed(() => {
    if (!imageStore?.previewUrl) return 0
    return estimateDataURLSize(imageStore.previewUrl)
  })

  /**
   * Reactive dimensions of the new file to be exported
   */
  const fileDimensions = computed(() => imageStore.newFileDimensions)

  /**
   * Available file format options for export
   */
  const fileFormatOptions = [
    {
      label: 'PNG',
      value: 'png',
    },
    {
      label: 'JPEG',
      value: 'jpeg',
    },
    {
      label: 'WEBP',
      value: 'webp',
    },
    {
      label: 'PDF',
      value: 'pdf',
    },
  ]

  /**
   * Watch for changes in the file format and regenerate preview
   */
  watch(
    () => fileFormat.value,
    async () => {
      if (isVisible.value) {
        await imageStore.generatePreview(editorStore, historyStore, t)
      }
    },
  )

  /**
   * Update export image quality and regenerate preview
   *
   * @param {number} value - Quality value (0-100)
   */
  const updateQuality = async (value) => {
    imageStore.newFileDimensions.quality = value
    await imageStore.generatePreview(editorStore, historyStore, t)
  }

  /**
   * Save updated file name to store (without changing existing file)
   */
  const saveNewFileName = () => {
    // Cut new name to maximum limit
    fileName.value = fileName.value.slice(0, editorConfig.maxFileNameLength)

    const success = imageStore.setFileName({ name: fileName.value, t, setOnlyNewFileName: true })

    if (success) {
      nextTick(() => {
        inputFileNameRef.value?.blur()
      })
    }
  }

  /**
   * Open export settings and prepare preview dimensions, format and file name
   */
  const openExportToolSettings = async () => {
    editorStore.isExportModalOpen = true

    imageStore.newFileDimensions = { ...imageStore.fileDimensions }
    imageStore.newFileFormat = imageStore.fileFormat
    imageStore.newFileName = imageStore.fileName

    // Adjust dimensions based on frame
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

  /**
   * Close the export settings panel
   */
  const closeExportToolSettings = () => {
    editorStore.isExportModalOpen = false
    isVisible.value = false
  }

  /**
   * Trigger export using current settings
   */
  const exportFile = () => {
    if (!isVisible.value) return

    const success = imageStore.exportFile(editorStore, historyStore, t)
    if (!success) {
      error('Failed to export file')
      return
    }
    closeExportToolSettings()
  }

  /**
   * Copy rendered image preview to clipboard
   */
  const copyImageToClipboard = async () => {
    await imageStore.copyImageToClipboard(t)
  }

  /**
   * Estimate data URL size in kilobytes
   *
   * @param {string} dataUrl - Base64 image string
   * @returns {number} Estimated size in kB
   */
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
    fileFormatOptions,
  }
}
