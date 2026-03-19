/**
 * @file: importFileService.js
 * @author: Pavol Humeny
 * @date: 15.5.2026
 * @description: Service for importing files into the application, handling validations and state management. Provides functionality to open a file input dialog, validate selected files (type, size, dimensions), and set the file in the image store for further processing. Supports both image and PDF files, with specific handling for multi-page PDFs.
 */
import { globalConfig } from '@/config/globalConfig'
import { useToastModal } from '@/composables/modals/useToastModal'
import { useConsole } from '@/composables/common/useConsole'
import { editorConfig } from '@/config/editorConfig'
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf'
import { PDFDocument } from 'pdf-lib'
import { useImageAnalysis } from '@/composables/tools/useImageAnalysis'
import { useGeneralModal } from '@/composables/modals/useGeneralModal'
import { useImagePipeline } from '@/composables/editor/useImagePipeline'
import { useImportModal } from '@/composables/modals/useImportModal'
pdfjsLib.GlobalWorkerOptions.workerSrc =
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js'
import { useApi } from '@/composables/common/useApi'

const { addUserEvent } = useApi()
const { log, warn } = useConsole()
const { showToastModal } = useToastModal()
const { showGeneralModal } = useGeneralModal()

/**
 * Service for importing files into the application, handling validations and state management
 * @param {ReturnType<typeof import('@/stores/userModeStore').useUserModeStore>} userModeStore - User mode store for feature access
 * @param {ReturnType<typeof import('@/stores/workspaceStore').useWorkspaceStore>} workspaceStore - Workspace store for tab management
 * @param {ReturnType<typeof import('@/stores/uiStore').useUiStore>} uiStore - UI store for loading state
 * @param {ReturnType<typeof import('@/stores/imageStore').useImageStore>} imageStore - Image store for image data
 * @param {ReturnType<typeof import('@/stores/viewportStore').useViewportStore>} viewportStore - Viewport store for view settings
 * @param {ReturnType<typeof import('@/stores/historyStore').useHistoryStore>} historyStore - History store for undo/redo functionality
 * @param {(key: string) => string} t - Translation function
 * @returns {Object} - Object containing the openFileInput function
 */
export function importFileService(
  userModeStore,
  workspaceStore,
  uiStore,
  imageStore,
  viewportStore,
  historyStore,
  editorStore,
  t,
) {
  const { initPipeline, renderUpTo } = useImagePipeline(imageStore, uiStore)
  const { closeImportModal } = useImportModal()

  /**
   * Opens a file input dialog for the user to select files and processes them
   * @param {import('vue-router').Router} router - Vue router instance
   */
  const openFileInput = (router) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.png, .jpg, .jpeg, .pdf, .webp'
    input.multiple =
      globalConfig.maxNumberOfOpenFiles > 1 ||
      userModeStore.hasUserAccessToFeature('maxNumberOfOpenFiles')
    input.style.display = 'none'

    input.addEventListener('change', async () => {
      if (!input.files || input.files.length === 0) return

      const currentNumberOfTabs = workspaceStore.numberOfTabs

      if (!userModeStore.hasUserAccessToFeature('maxNumberOfOpenFiles')) {
        if (currentNumberOfTabs + input.files.length > globalConfig.maxNumberOfOpenFiles) {
          showToastModal(
            'error',
            t('imageStore.toast.errorMaxNumberOfOpenFiles.title'),
            t('imageStore.toast.errorMaxNumberOfOpenFiles.message', {
              maxFiles: globalConfig.maxNumberOfOpenFiles,
            }),
          )
          return
        }
      }

      const filesArray = Array.from(input.files)
      // const hasPdf = filesArray.some((file) => file.type === 'application/pdf')

      // Only one PDF file allowed
      // if (hasPdf && filesArray.length > 1) {
      //   showToastModal(
      //     'error',
      //     t('imageStore.toast.errorPdfMultipleFiles.title'),
      //     t('imageStore.toast.errorPdfMultipleFiles.message'),
      //   )
      //   return
      // }

      // Limit number of files if no PDF is present
      if (!userModeStore.hasUserAccessToFeature('maxNumberOfFilesToUploadSimultaneously')) {
        if (!filesArray.length > globalConfig.maxNumberOfFilesToUploadSimultaneously) {
          showToastModal(
            'error',
            t('imageStore.toast.errorMultipleFiles.title'),
            t('imageStore.toast.errorMultipleFiles.message', {
              maxFiles: globalConfig.maxNumberOfFilesToUploadSimultaneously,
            }),
          )
          return
        }
      }

      editorStore.numberOfCurrentlyOpeningFiles = filesArray.length

      // Process files
      if (
        globalConfig.maxNumberOfOpenFiles > 1 ||
        userModeStore.hasUserAccessToFeature('maxNumberOfOpenFiles')
      ) {
        for (const file of filesArray) {
          await loadFile(file, router)
          await new Promise((resolve) => setTimeout(resolve, 200)) // Small delay to ensure UI updates
        }
      } else {
        await loadFile(filesArray[0], router)
      }
    })

    document.body.appendChild(input)
    input.click()
    document.body.removeChild(input)
  }

  /**
   * Loads and processes the selected file
   * @param {File} file - File to load

   * @param {import('vue-router').Router} router - Vue router instance
   */
  const loadFile = async (file, router) => {
    if (globalConfig.featureFlags.enableImageLoad === false) return

    if (!file) return

    if (!checkFileSize(file.size, file.type)) {
      showToastModal(
        'error',
        t('imageStore.toast.errorFileTooLargeSize.title'),
        t('imageStore.toast.errorFileTooLargeSize.message', {
          maxSize: editorConfig.maxFileSize,
        }),
      )
    } else if (!(await checkFileType(file))) {
      showToastModal(
        'error',
        t('imageStore.toast.errorUnsupportedFileType.title'),
        t('imageStore.toast.errorUnsupportedFileType.message', { fileType: file.type }),
      )
    } else {
      if (router.currentRoute.value.name !== 'editor') {
        await router.replace({ name: 'editor' })
        await router.isReady()

        if (viewportStore.zoomMode === 'physical') {
          // If windows size is different than the one saved during calibration, show toast
          const savedWindowSize = viewportStore.getWindowSize()
          if (savedWindowSize) {
            const { width, height } = savedWindowSize
            if (window.screen.width !== width || window.screen.height !== height) {
              showToastModal(
                'info',
                t('topPanel.zoomControl.needCalibration.title'),
                t('topPanel.zoomControl.needCalibration.message'),
              )
            }
          }
        }
      } else {
        // Close import modal if open
        closeImportModal()
      }

      await setFile(file)
    }
  }

  /**
   * Detects the file type based on its binary signature
   * @param {File} file - File to analyze
   * @returns {Promise<string>} - Detected file type ('jpeg', 'png', 'webp', 'pdf', or 'unknown')
   */
  const detectFileType = async (file) => {
    const buffer = await file.slice(0, 12).arrayBuffer()
    const bytes = new Uint8Array(buffer)

    if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'jpeg'
    if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47)
      return 'png'

    if (
      bytes[0] === 0x52 &&
      bytes[1] === 0x49 &&
      bytes[2] === 0x46 &&
      bytes[3] === 0x46 &&
      bytes[8] === 0x57 &&
      bytes[9] === 0x45 &&
      bytes[10] === 0x42 &&
      bytes[11] === 0x50
    )
      return 'webp'

    if (bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46)
      return 'pdf'

    return 'unknown'
  }

  /**
   * Checks if the file type is supported
   * @param {File} file - File to check
   * @returns {Promise<boolean>} - True if supported, false otherwise
   */
  const checkFileType = async (file) => {
    const supportedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf', 'image/webp']

    if (!supportedTypes.includes(file.type)) return false

    const detectedType = await detectFileType(file)
    const realType =
      file.type.startsWith('image/') || file.type.startsWith('application/')
        ? file.type.split('/')[1]
        : file.type

    log(realType === detectedType, 'realType:', realType, 'detectedType:', detectedType)

    return (
      realType === detectedType ||
      detectedType === 'png' ||
      detectedType === 'jpeg' ||
      detectedType === 'jpg' ||
      detectedType === 'webp'
    )
  }

  /**
   * Checks if the image dimensions exceed the maximum allowed width/height
   * @param {number} width - Width of the image
   * @param {number} height - Height of the image
   * @param {string} fileName - File name (for error message)
   * @returns {boolean} - True if dimensions are within limits
   */
  const checkFileDimensions = (width, height) => {
    // Skip detection
    if (userModeStore.hasUserAccessToFeature('fileDimensions')) {
      return true
    }

    const MAX_WIDTH = editorConfig.maxFileDimensionWidth
    const MAX_HEIGHT = editorConfig.maxFileDimensionHeight
    const MIN_WIDTH = editorConfig.minFileDimensionWidth
    const MIN_HEIGHT = editorConfig.minFileDimensionHeight

    if (width > MAX_WIDTH || height > MAX_HEIGHT || width < MIN_WIDTH || height < MIN_HEIGHT) {
      showToastModal(
        'error',
        t('imageStore.toast.errorInvalidFileDimensions.title'),
        t('imageStore.toast.errorInvalidFileDimensions.message', {
          maxWidth: MAX_WIDTH,
          maxHeight: MAX_HEIGHT,
          minWidth: MIN_WIDTH,
          minHeight: MIN_HEIGHT,
        }),
      )
      return false
    }
    return true
  }

  /**
   * Checks whether the file size is within allowed limits
   * @param {number} fileSize - Size of the file in bytes
   * @param {string} [fileType] - Type of the file
   * @returns {boolean} - True if within limits, false otherwise
   */
  const checkFileSize = (fileSize, fileType) => {
    // Skip detection
    if (userModeStore.hasUserAccessToFeature('fileSize')) {
      return true
    }

    if (fileType === 'application/pdf') {
      // PDF max size in MB
      if (fileSize / 1024 / 1024 > editorConfig.maxPdfFileSize) {
        return false
      }
      return true
    } else {
      // Check if file size exceeds the maximum allowed size in MB
      if (fileSize / 1024 / 1024 > editorConfig.maxFileSize) {
        return false
      }

      return true
    }
  }

  /**
   * Sets the selected file in the image store and processes it
   * @param {File} file - File to set
   */
  const setFile = async (file) => {
    uiStore.isLoading = true

    const previousTabIndex = workspaceStore.activeTabIndex

    try {
      resetForNewFile()

      imageStore.file = file
      imageStore.setFileName({
        name: file.name,
        t,
        updateInWorkspace: false,
        openingNewFile: true,
      })

      imageStore.fileFormat = file.name.split('.').pop().toLowerCase()
      imageStore.newFileFormat = imageStore.fileFormat

      let success = false

      if (file.type.startsWith('image/')) {
        success = await setImageFile(file)
      } else if (file.type === 'application/pdf') {
        success = await setPdfFile(file)
      }

      if (!success) {
        // Rollback to previous tab
        if (previousTabIndex !== -1) {
          // Use switchToTab so activeTabIndex + restore is consistent everywhere
          await workspaceStore.switchToTab(previousTabIndex)

          // Re-render restored state (same as when user clicks a tab)
          await renderUpTo(imageStore.renderPipeline.currentOpIndex, { t, imageStore })

          // If overlay-canvas-artifacts was hide somewhere, ensure it is visible
          const overlayCanvas = document.querySelector('.overlay-canvas-artifacts')
          if (overlayCanvas) overlayCanvas.style.display = ''
        } else {
          // No previous tab - just close file state
          imageStore.closeFile()
        }
        return
      }

      // Save initial state to history if empty
      if (historyStore.history.length === 0) {
        historyStore.push(imageStore.getSnapshot(t))
      }

      // Tutorial check for first time
      if (uiStore.tutorialStep === -1) {
        uiStore.tutorialShouldBeStartedForFirstTime = true
      }

      addUserEvent('uploadImage', {
        fileFormat: imageStore.fileFormat,
        fileName: imageStore.fileName,
        fileSize: imageStore.fileDimensions.size,
        fileWidth: imageStore.fileDimensions.width,
        fileHeight: imageStore.fileDimensions.height,
      })

      imageStore.imageNeedToBeRendered = true
    } catch (e) {
      console.error(e)
    } finally {
      viewportStore.shouldFitToScreen = true
      uiStore.isLoading = false
      workspaceStore.newTabWasAdded = false
    }
  }

  /**
   * Sets a PDF file in the image store, allowing page selection if multiple pages exist
   * @param {File} file - PDF file to set
   * @returns {Promise<boolean>} - True if successful, false otherwise
   */
  const setPdfFile = async (file) => {
    log('Loading PDF file:', file.name)

    const buffer = await readAsArrayBuffer(file)
    const typedArray = new Uint8Array(buffer)

    const pdf = await pdfjsLib.getDocument({ data: typedArray }).promise

    log('PDF loaded with', pdf.numPages, 'pages')

    let pageNumber = 1
    if (pdf.numPages > 1) {
      uiStore.blockClicks = false

      const result = await showGeneralModal(
        t('imageStore.modal.selectPdfPage.cancel'),
        t('imageStore.modal.selectPdfPage.confirm'),
        { numberOfPages: pdf.numPages, selectedPage: 1 }, // payload
        'selectPdfPage', // modal type
        false, // If it can be closed by clicking outside (false)
      )

      if (!result?.selectedPage) {
        log('User cancelled PDF page selection: ', result)
        uiStore.isLoading = false

        if (workspaceStore.activeTabIndex === -1) {
          imageStore.closeFile()
        } else {
          workspaceStore.switchToTab(workspaceStore.activeTabIndex)
        }
        return false
      }

      pageNumber = result.selectedPage

      uiStore.blockClicks = true
    }

    log('Selected PDF page number:', pageNumber)

    const pageBytes = await extractPdfPageBytes(typedArray, pageNumber)

    imageStore.fileType = 'pdf'
    imageStore.pdfPageBytes = pageBytes

    // const pdfFile = await PDFDocument.load(pageBytes)
    // const pageWidth = pdfFile.getPage(0).getWidth()
    // const pageHeight = pdfFile.getPage(0).getHeight()

    const page = await pdf.getPage(pageNumber)
    const viewport = page.getViewport({ scale: 1 })

    // Create a canvas to render the PDF page
    const canvas = document.createElement('canvas')
    canvas.width = viewport.width
    canvas.height = viewport.height
    await page.render({
      canvasContext: canvas.getContext('2d'),
      viewport,
    }).promise

    // Check dimensions
    if (!checkFileDimensions(viewport.width, viewport.height)) {
      imageStore.closeFile()
      return false
    }

    imageStore.fileDimensions.width = canvas.width
    imageStore.fileDimensions.height = canvas.height
    imageStore.fileDimensions.fileAspectRatio = canvas.width / canvas.height || 1

    imageStore.newFileDimensions = { ...imageStore.fileDimensions }
    imageStore.originalFileDimensions = { ...imageStore.fileDimensions }

    initPipeline(canvas)

    imageStore.setRenderedImage(canvas)
    imageStore.originalImage = canvas
    // imageStore.previewUrl = canvas.toDataURL()

    workspaceStore.addNewTab(imageStore.fileName, imageStore.fileFormat, t)

    return true
  }

  /**
   * Sets an image file in the image store and processes it
   * @param {File} file - Image file to set
   * @returns {Promise<boolean>} - True if successful, false otherwise
   */
  const setImageFile = async (file) => {
    log('Loading image file:', file.name)

    const dataUrl = await readAsDataURL(file)

    const img = new Image()
    img.src = dataUrl
    await img.decode()

    // Set image store properties
    imageStore.fileType = 'image'
    imageStore.file = file

    // Check dimensions
    if (!checkFileDimensions(img.width, img.height)) {
      imageStore.closeFile()
      return false
    }

    imageStore.fileDimensions.width = img.width
    imageStore.fileDimensions.height = img.height
    imageStore.fileDimensions.fileAspectRatio = img.width / img.height || 1

    imageStore.newFileDimensions = { ...imageStore.fileDimensions }
    imageStore.originalFileDimensions = { ...imageStore.fileDimensions }

    // Canvas
    const canvas = document.createElement('canvas')
    canvas.width = img.width
    canvas.height = img.height
    canvas.getContext('2d').drawImage(img, 0, 0)

    // Initialize render pipeline
    initPipeline(canvas)
    // -----------------

    imageStore.setRenderedImage(canvas)
    imageStore.originalImage = canvas
    // imageStore.previewUrl = canvas.toDataURL()

    // Workspace tab
    workspaceStore.addNewTab(imageStore.fileName, imageStore.fileFormat, t)

    if (editorStore.numberOfCurrentlyOpeningFiles === 1) {
      warn('calculateArtifacts called from setFile - image loaded')

      // Calculate image artifacts (noise)
      const { calculateArtifacts } = useImageAnalysis(
        imageStore,
        viewportStore,
        uiStore,
        historyStore,
        editorStore,
        workspaceStore,
        t,
      )

      await calculateArtifacts()
    }

    return true
  }

  /**
   * Resets the stores for loading a new file
   */
  const resetForNewFile = () => {
    workspaceStore.updateCurrentTabState(t)
    historyStore.reset()
    viewportStore.reset()
    imageStore.resetImageStoreForNewFile()

    const canvas = document.getElementById('removalCanvas')
    if (canvas) {
      const ctx = canvas.getContext('2d')
      ctx.clearRect(0, 0, canvas.width, canvas.height)
    }
  }

  /**
   * Reads a file as a Data URL
   * @param {File} file - File to read
   * @returns {Promise<string>} - Data URL of the file
   */
  const readAsDataURL = (file) =>
    new Promise((resolve, reject) => {
      const r = new FileReader()
      r.onload = () => resolve(r.result)
      r.onerror = reject
      r.readAsDataURL(file)
    })

  /**
   * Reads a file as an ArrayBuffer
   * @param {File} file - File to read
   * @returns {Promise<ArrayBuffer>} - ArrayBuffer of the file
   */
  const readAsArrayBuffer = (file) =>
    new Promise((resolve, reject) => {
      const r = new FileReader()
      r.onload = () => resolve(r.result)
      r.onerror = reject
      r.readAsArrayBuffer(file)
    })

  /**
   * Extracts a specific page from a PDF file and returns it as a new PDF byte array
   * @param {Uint8Array} pdfBytes - Original PDF file bytes
   * @param {number} pageNumber - Page number to extract (1-based index)
   * @returns {Promise<Uint8Array>} - Byte array of the new PDF containing only the extracted page
   */
  const extractPdfPageBytes = async (pdfBytes, pageNumber) => {
    const srcPdf = await PDFDocument.load(pdfBytes)
    const newPdf = await PDFDocument.create()
    const [page] = await newPdf.copyPages(srcPdf, [pageNumber - 1])
    newPdf.addPage(page)
    return await newPdf.save()
  }

  return {
    openFileInput,
    loadFile,
  }
}
