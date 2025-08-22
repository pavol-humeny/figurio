import jsPDF from 'jspdf'
import { svg2pdf } from 'svg2pdf.js'
import { defineStore } from 'pinia'
import { useToastModal } from '@/composables/modals/useToastModal'
import { nextTick } from 'vue'
import { useHistoryStore } from './historyStore'
import { useFrameTool } from '@/composables/tools/useFrameTool'
import { useWorkspaceStore } from './workspaceStore'
import { useUiStore } from './uiStore'
import { editorConfig } from '@/config/editorConfig'
// import { useConfirmModal } from '@/composables/modals/useConfirmModal'

import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf'
// import pdfjsWorker from 'pdfjs-dist/legacy/build/pdf.worker?url'
import { useViewportStore } from './viewportStore'
import { useEditorStore } from './editorStore'
import { globalConfig } from '@/config/globalConfig'
import { useGeneralModal } from '@/composables/modals/useGeneralModal'
import { useSendEvent } from '@/composables/common/useSendEvent'

import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib'

// import { SVGGraphics } from 'pdfjs-dist/legacy/build/pdf'

pdfjsLib.GlobalWorkerOptions.workerSrc =
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js'

const { showToastModal } = useToastModal()
// const { showConfirmModal } = useConfirmModal()
const { showGeneralModal } = useGeneralModal()

/**
 * Checks if a file name is valid by ensuring it does not contain invalid characters.
 *
 * @param {string} name - The file name to validate.
 */
const isValidFileName = (name) => {
  // Invalid characters: \ / : * ? " < > |
  return !/[\\/:*?"<>|]/.test(name)
}

/**
 * Store managing image-related data and operations
 */
export const useImageStore = defineStore('imageStore', {
  state: () => ({
    /** The currently loaded image file */
    file: null,
    /** Type of the loaded file */
    fileType: '', // 'image' or 'pdf'

    /** Name of the loaded file */
    fileName: '', // UndoRedo
    /** Format of the loaded file */
    fileFormat: '', // 'png', 'jpg', 'jpeg', 'pdf'
    /** Dimensions of the loaded file */
    fileDimensions: {
      fileAspectRatio: 1,
      width: 0,
      height: 0,
      quality: 100,
    }, // UndoRedo

    /** New file name for export */
    newFileName: '',
    /** New file format for export */
    newFileFormat: '', // 'png', 'jpg', 'jpeg', 'pdf'
    /** New file dimensions for export */
    newFileDimensions: {
      fileAspectRatio: 1,
      width: 0,
      height: 0,
      quality: 100,
    },

    /** Preview URL for the image */
    previewUrl: '', // UndoRedo

    /** Original image */
    originalImage: null,
    originalFileDimensions: {
      fileAspectRatio: 1,
      width: 0,
      height: 0,
      quality: 100,
    },

    // Value for raster image rendering
    /** Rendered image - showed image in canvas */
    renderedImage: null, // UndoRedo
    /** Temporary rendered image - used for saving canvas if frame with rounded corners is applied */
    tmpRenderedImage: null,

    /** New rendered image - used for rasterizing SVG objects before export */
    newRenderedImage: null,

    /** Array of SVG objects to render on the image */
    svgObjects: [
      // {
      //   id: 1755702935146,
      //   class: 'shape',
      //   tag: 'rect',
      //   attrs: {
      //     fill: '#af2323',
      //     height: 140,
      //     opacity: 0.5,
      //     stroke: '#17e83a',
      //     'stroke-width': 8,
      //     transform: 'rotate(-23, 327, 261)',
      //     width: 206,
      //     x: 224,
      //     y: 191,
      //   },
      // },
    ],

    /** ID of the currently selected SVG object */
    selectedSvgObjectId: null,
    /** ID of the SVG object that was just created */
    justCreatedSvgObjectId: null,
    /** Array of selected SVG object IDs for multi-selection */
    selectedSvgObjectIds: [],
    /** Dynamic SVG definitions */
    svgDefs: [],
    /** SVG object copied to clipboard */
    clipboardSvgObject: null,

    /** Array of image operations to apply */
    imageOperations: [],
    // imageOperations: [
    // {'grayscale': {'enabled': true}},
    // {'crop': {'x': 50, 'y': 50, 'width': 200, 'height': 200}}
    // ]

    /** Image frame */
    frame: {
      enabled: false,
      type: 'none',
      width: 0,
      height: 0,
      color: '#000000',
      headerSize: 0, // Size of the header for browser frames
      footerSize: 0, // Size of the footer for windows frame
      outlineEnabled: false, // Whether to draw an outline around the frame
      phoneHeaderEnabled: true, // Whether to draw a header for phone frames
      phoneHeaderTimeInMinutes: 610, // Default time for phone header (10:10)
      phoneHeaderTextColor: '#000000', // Default text color for phone header
      phoneHeaderBackgroundColor: '#ffffff', // Default background color for phone header
      headerFooterMultiplier: 1, // Multiplier for header/footer size
    },
    /** Raw SVG frame for vector export */
    frameSvg: '',

    /** Flag to prevent showing multiple phone buttons can not be drawn toast */
    phoneButtonsCanNotBeDrawnToastFlag: false,

    /** Whether any artifacts are visible */
    isArtifactsVisible: false,

    // PDF
    pdfPage: null,

    pdfFile: null,

    /** PDF page bytes */
    pdfPageBytes: null,

    /** Total PDF crop box */
    totalPdfCropBox: {
      x: 0,
      y: 0,
    },
  }),
  getters: {
    /**
     * Returns true if an image or PDF file is currently loaded
     * @returns {boolean}
     */
    isImageLoaded: (state) => {
      return state.file !== null
    },
  },
  actions: {
    // Setters
    /**
     * Sets the current rendered image and optionally updates the temporary rendered image
     * @param {HTMLCanvasElement} image - The image to set
     * @param {boolean} [onlyOriginal=false] - Whether to skip updating the temporary image
     */
    setRenderedImage(image, onlyOriginal = false) {
      this.renderedImage = image
      if (!onlyOriginal) {
        this.tmpRenderedImage = image
      }
    },

    // Getters
    /**
     * Returns the appropriate rendered image based on the rendering context and frame type
     * @param {boolean} [renderCall=false] - Whether the call is part of a render operation
     * @returns {HTMLCanvasElement|null}
     */
    getRenderedImage({ t, renderCall }) {
      if (renderCall) {
        const imageStore = this
        const editorStore = useEditorStore()
        const historyStore = useHistoryStore()
        if (
          this.frame.enabled &&
          useFrameTool(imageStore, historyStore, editorStore, t).isPhoneFrame(this.frame.type)
        ) {
          return this.renderedImage
        } else {
          return this.tmpRenderedImage
        }
      } else {
        return this.tmpRenderedImage
      }
    },

    /**
     * Returns the larger dimension (width or height) of the current file dimensions
     * @returns {number} - The larger dimension of the image
     */
    getBiggerImageDimension() {
      if (this.fileDimensions.width > this.fileDimensions.height) {
        return this.fileDimensions.width
      } else {
        return this.fileDimensions.height
      }
    },

    /**
     * Returns the smaller dimension (width or height) of the current file dimensions
     * @returns {number} - The smaller dimension (width or height) of the current file dimensions
     */
    getSmallerImageDimension() {
      if (this.fileDimensions.width < this.fileDimensions.height) {
        return this.fileDimensions.width
      } else {
        return this.fileDimensions.height
      }
    },

    /**
     * Resets the rendered image to the original image and restores original dimensions
     */
    resetRenderedImageToOriginal() {
      if (this.originalImage) {
        this.setRenderedImage(this.originalImage)
        this.fileDimensions = { ...this.originalFileDimensions }
      }
    },

    /**
     * Checks whether a grayscale operation is applied
     * @returns {boolean}
     */
    hasGrayscaleOperation() {
      return this.imageOperations.some((op) => op.type === 'grayscale')
    },

    /**
     * Adds a deep copy of a new image operation to the operations list
     * @param {Object} operation - The image operation to add
     */
    addImageOperation(operation) {
      this.imageOperations.push(structuredClone(operation))
    },

    /**
     * Returns a deep copy of all image operations
     * @returns {Array<Object>}
     */
    getImageOperations() {
      return JSON.parse(JSON.stringify(this.imageOperations))
    },

    /**
     * Returns a deep copy of the current image frame configuration
     * @returns {Object}
     */
    getImageFrame() {
      return JSON.parse(JSON.stringify(this.frame))
    },

    /**
     * Resets the image operations array to an empty state
     */
    resetImageOperations() {
      this.imageOperations = []
    },

    /**
     * Resets the SVG objects and their selection state
     */
    resetSvgObject() {
      this.svgObjects = []
      this.selectedSvgObjectId = null
      this.justCreatedSvgObjectId = null
      this.selectedSvgObjectIds = []
      this.svgDefs = []
      this.clipboardSvgObject = null
    },

    /**
     * Resets the image frame configuration to default values
     */
    resetFrame() {
      this.frame = {
        enabled: false,
        type: 'none',
        width: 0,
        height: 0,
        color: '#000000',
        headerSize: 0, // Size of the header for browser frames
        footerSize: 0, // Size of the footer for windows frame
        outlineEnabled: false, // Whether to draw an outline around the frame
        phoneHeaderEnabled: true, // Whether to draw a header for phone frames
        phoneHeaderTimeInMinutes: 610, // Default time for phone header (10:10)
        phoneHeaderTextColor: '#000000', // Default text color for phone header
        phoneHeaderBackgroundColor: '#ffffff', // Default background color for phone header
        headerFooterMultiplier: 1, // Multiplier for header/footer size
      }
    },

    /**
     * Sets and validates the file name, optionally updating the workspace tab name
     * @param {Object} options
     * @param {string} options.name - New file name
     * @param {Function} options.t - i18n translation function
     * @param {boolean} [options.setOnlyNewFileName=false] - Whether to update only `newFileName`
     * @param {boolean} [options.updateInWorkspace=true] - Whether to update the workspace tab name
     * @param {boolean} [options.openingNewFile=false] - Whether the file is being opened newly (skip toast)
     * @returns {boolean} - Whether the name was successfully set
     */
    setFileName({
      name,
      t,
      setOnlyNewFileName = false,
      updateInWorkspace = true,
      openingNewFile = false,
    }) {
      let trimmedName = name.trim()

      // Empty name
      if (trimmedName === '') {
        if (this.file !== null) {
          showToastModal(
            'error',
            t('imageStore.toast.errorEmptyName.title'),
            t('imageStore.toast.errorEmptyName.message'),
          )
        }
        const tmp = this.fileName
        this.fileName = ''
        this.newFileName = ''
        nextTick(() => {
          this.fileName = tmp // Reset to previous name
          this.newFileName = tmp
        })
        return false
      }

      // Invalid characters
      if (!isValidFileName(trimmedName)) {
        if (this.file !== null) {
          showToastModal(
            'error',
            t('imageStore.toast.errorInvalidCharacters.title'),
            t('imageStore.toast.errorInvalidCharacters.message'),
          )
        }
        const tmp = this.fileName
        this.fileName = ''
        this.newFileName = ''
        nextTick(() => {
          this.fileName = tmp // Reset to previous name
          this.newFileName = tmp
        })
        return false
      }

      if (
        trimmedName !== this.fileName &&
        this.fileName !== '' &&
        !setOnlyNewFileName &&
        !openingNewFile
      ) {
        showToastModal(
          'success',
          t('imageStore.toast.successFileNameUpdated.title'),
          t('imageStore.toast.successFileNameUpdated.message'),
        )
      }

      // Remove file extension
      const lastDotIndex = trimmedName.lastIndexOf('.')
      if (lastDotIndex !== -1) {
        trimmedName = trimmedName.slice(0, lastDotIndex)
      }

      // Update file name
      if (setOnlyNewFileName) {
        this.newFileName = trimmedName
      } else {
        this.fileName = trimmedName
        this.newFileName = trimmedName
      }

      if (updateInWorkspace) {
        const workspaceStore = useWorkspaceStore()
        workspaceStore.updateCurrentTabName(this.fileName)
      }

      return true
    },

    /**
     * Resets the image store to a clean state for a new file
     */
    resetImageStoreForNewFile() {
      // this.svgObjects = []
      // this.selectedSvgObjectId = null

      this.resetImageOperations()

      this.resetFrame()
      this.frameSvg = ''

      this.phoneButtonsCanNotBeDrawnToastFlag = false

      this.isArtifactsVisible = false

      this.resetSvgObject()

      // Also reset rendered images
      this.setRenderedImage(null)
    },

    /**
     * Closes the current file and resets all image-related state
     */
    closeFile() {
      this.file = null
      this.fileType = ''

      this.fileName = ''
      this.fileFormat = ''
      this.fileDimensions = {
        fileAspectRatio: 1,
        width: 0,
        height: 0,
        quality: 100,
      }

      this.newFileName = ''
      this.newFileFormat = ''
      this.newFileDimensions = {
        fileAspectRatio: 1,
        width: 0,
        height: 0,
        quality: 100,
      }

      this.previewUrl = ''

      this.renderedImage = null
      this.originalFileDimensions = {
        fileAspectRatio: 1,
        width: 0,
        height: 0,
        quality: 100,
      }

      this.renderedImage = null
      this.tmpRenderedImage = null

      this.newRenderedImage = null

      this.resetSvgObject()

      this.resetImageStoreForNewFile()
    },

    /**
     * Checks if the file size exceeds the maximum allowed size
     * @param {number} fileSize - Size of the file in bytes
     * @param {string} fileName - Name of the file
     * @param {Function} t - i18n translation function
     * @returns {boolean} - True if the file size is within limits, false otherwise
     */
    checkFileSize(fileSize, fileName, t) {
      // Check if file size exceeds the maximum allowed size in MB
      if (fileSize / 1024 / 1024 > editorConfig.maxFileSize) {
        showToastModal(
          'error',
          t('imageStore.toast.errorFileTooLargeSize.title'),
          t('imageStore.toast.errorFileTooLargeSize.message', {
            fileName: fileName,
            maxSize: editorConfig.maxFileSize,
          }),
        )
        this.file = null
        return false
      }
      return true
    },

    /**
     * Checks if the image dimensions exceed the maximum allowed width/height
     * @param {number} width - Width of the image
     * @param {number} height - Height of the image
     * @param {string} fileName - File name (for error message)
     * @param {Function} t - i18n translation function
     * @returns {boolean} - True if dimensions are within limits
     */
    checkFileDimensions(width, height, fileName, t) {
      const MAX_WIDTH = editorConfig.maxFileDimensionWidth
      const MAX_HEIGHT = editorConfig.maxFileDimensionHeight

      if (width > MAX_WIDTH || height > MAX_HEIGHT) {
        showToastModal(
          'error',
          t('imageStore.toast.errorFileTooLargeDimensions.title'),
          t('imageStore.toast.errorFileTooLargeDimensions.message', {
            fileName,
            maxWidth: MAX_WIDTH,
            maxHeight: MAX_HEIGHT,
          }),
        )
        this.file = null
        return false
      }
      return true
    },

    async extractPdfPageBytes(pdfBytes, pageNumber) {
      // Načítaj pôvodný PDF dokument
      const srcPdf = await PDFDocument.load(pdfBytes)

      // Vytvor nový PDF dokument
      const newPdf = await PDFDocument.create()

      // Skopíruj konkrétnu stránku do nového dokumentu
      const [copiedPage] = await newPdf.copyPages(srcPdf, [pageNumber - 1])
      newPdf.addPage(copiedPage)

      // Vygeneruj byty nového PDF
      const newPdfBytes = await newPdf.save()
      return newPdfBytes
    },

    /**
     * Loads a file, determines its type, and initializes the state
     * @param {File} file - File object selected by the user
     * @param {Function} t - i18n translation function
     */
    async setFile(file, t) {
      const workspaceStore = useWorkspaceStore()
      const uiStore = useUiStore()
      const historyStore = useHistoryStore()
      const viewportStore = useViewportStore()

      // Reset state for new file (update current tab state)
      if (file !== null) {
        workspaceStore.updateCurrentTabState(t)

        // Reset history store for new file
        historyStore.reset()

        // Reset viewport store for new file
        viewportStore.reset()

        // Reset image store for new file
        this.resetImageStoreForNewFile()
      }

      this.file = file

      if (!this.checkFileSize(file.size, file.name, t)) {
        return
      }

      this.setFileName({ name: file.name, t, updateInWorkspace: false, openingNewFile: true }) // Set file name without updating workspace because there might not be a tab yet
      this.fileFormat = file.name.split('.').pop().toLowerCase()
      this.newFileFormat = this.fileFormat

      // Set loading new file state
      uiStore.isLoading = true

      if (this.file.type.startsWith('image')) {
        console.log('Loading image file:', file.name)
        this.fileType = 'image'
        const reader = new FileReader()
        reader.onload = (event) => {
          const img = new Image()
          img.onload = async () => {
            await new Promise((resolve) => setTimeout(resolve, 10))

            // Check image dimensions
            if (!this.checkFileDimensions(img.width, img.height, file.name, t)) {
              uiStore.isLoading = false
              return
            }

            this.fileDimensions.width = img.width
            this.fileDimensions.height = img.height
            this.fileDimensions.fileAspectRatio = img.width / img.height || 1
            this.newFileDimensions = { ...this.fileDimensions }
            this.originalFileDimensions = { ...this.fileDimensions }

            // Create a canvas to render the image
            const canvas = document.createElement('canvas')
            canvas.width = img.width
            canvas.height = img.height

            const ctx = canvas.getContext('2d')
            ctx.drawImage(img, 0, 0)

            this.setRenderedImage(canvas)
            this.originalImage = canvas
            this.previewUrl = canvas.toDataURL() // Fallback for export

            // Add new tab in workspace
            workspaceStore.addNewTab(this.fileName, this.fileFormat, t)

            uiStore.isLoading = false

            showToastModal(
              'success',
              t('imageStore.toast.successFileUploaded.title'),
              t('imageStore.toast.successFileUploaded.message', { fileName: file.name }),
            )
          }

          img.src = event.target.result
        }

        reader.readAsDataURL(file)
      } else if (this.file.type === 'application/pdf') {
        console.log('Loading PDF file:', file.name)
        this.fileType = 'pdf'

        const reader = new FileReader()
        reader.onload = async (event) => {
          const typedArray = new Uint8Array(event.target.result)

          try {
            const pdf = await pdfjsLib.getDocument({ data: typedArray }).promise

            // Select page
            let pdfPageNumber = 1
            if (pdf.numPages > 1) {
              uiStore.blockClicks = false

              const result = await showGeneralModal(
                t('imageStore.modal.selectPdfPage.title'),
                t('imageStore.modal.selectPdfPage.cancel'),
                t('imageStore.modal.selectPdfPage.confirm'),
                { numberOfPages: pdf.numPages }, // payload
              )

              if (!result || !result.selectedPage) {
                uiStore.isLoading = false
                this.closeFile() // Reset image store if user cancels
                return
              }

              pdfPageNumber = result.selectedPage.value

              uiStore.blockClicks = true
            }

            // Save pdf page bytes
            const pageBytes = await this.extractPdfPageBytes(typedArray, pdfPageNumber)
            this.pdfPageBytes = pageBytes

            const pdfFile = await PDFDocument.load(pageBytes)
            const pageWidth = pdfFile.getPage(0).getWidth()
            const pageHeight = pdfFile.getPage(0).getHeight()

            const page = await pdf.getPage(pdfPageNumber)

            // Confirm modal for image scale
            // uiStore.blockClicks = false
            // const confirmed = await showConfirmModal(
            //   t('imageStore.modal.scalePdfForBetterResolution.title'),
            //   t('imageStore.modal.scalePdfForBetterResolution.message'),
            //   t('imageStore.modal.scalePdfForBetterResolution.cancel'),
            //   t('imageStore.modal.scalePdfForBetterResolution.confirm'),
            // )
            // if (confirmed) {
            //   scaleLevel = 4 // Higher scale for better quality
            // }
            // uiStore.blockClicks = true

            const viewport = page.getViewport({ scale: 1 })

            const canvas = document.createElement('canvas')
            canvas.width = pageWidth
            canvas.height = pageHeight
            const ctx = canvas.getContext('2d')

            await page.render({ canvasContext: ctx, viewport }).promise

            // Check image dimensions
            if (!this.checkFileDimensions(canvas.width, canvas.height, file.name, t)) {
              uiStore.isLoading = false
              return
            }

            this.fileDimensions.width = canvas.width
            this.fileDimensions.height = canvas.height
            this.fileDimensions.fileAspectRatio = canvas.width / canvas.height || 1
            this.newFileDimensions = { ...this.fileDimensions }
            this.originalFileDimensions = { ...this.fileDimensions }

            this.setRenderedImage(canvas)
            this.originalImage = canvas
            this.previewUrl = canvas.toDataURL()

            // Add new tab in workspace
            workspaceStore.addNewTab(this.fileName, this.fileFormat, t)

            uiStore.isLoading = false

            showToastModal(
              'success',
              t('imageStore.toast.successFileUploaded.title'),
              t('imageStore.toast.successFileUploaded.message', { fileName: file.name }),
            )
          } catch (err) {
            console.error('PDF parsing error', err)
            uiStore.isLoading = false
          }
        }
        reader.readAsArrayBuffer(file)
      } else {
        uiStore.isLoading = false
        console.error('Unsupported file type:', this.file.type)
      }

      // Send event
      useSendEvent().sendEvent('fileUpload', null, null, {
        fileType: this.fileFormat,
        fileName: this.fileName,
        fileSize: this.fileSize,
        fileWidth: this.fileDimensions.width,
        fileHeight: this.fileDimensions.height,
      })
    },

    /**
     * Reads the first few bytes of the file to check its actual format
     * @param {File} file - File to check
     * @returns {Promise<string>} - Detected file type, e.g. 'jpeg', 'png', 'pdf', or 'unknown'
     */
    async detectFileType(file) {
      const buffer = await file.slice(0, 4).arrayBuffer()
      const bytes = new Uint8Array(buffer)

      // JPEG: FF D8 FF
      if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
        return 'jpeg'
      }

      // PNG: 89 50 4E 47
      if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
        return 'png'
      }

      // PDF: 25 50 44 46
      if (bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46) {
        return 'pdf'
      }

      return 'unknown'
    },

    /**
     * Checks whether the file has a supported MIME type
     * @param {File} file - File to validate
     * @returns {boolean} - True if supported, false otherwise
     */
    async checkFile(file) {
      const supportedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']

      if (!supportedTypes.includes(file.type)) {
        return false
      } else {
        const detectedType = await this.detectFileType(file)

        // Check if the detected type is same as the file type
        // remove leading 'image/' or 'application/' from the type
        const realType =
          file.type.startsWith('image/') || file.type.startsWith('application/')
            ? file.type.split('/')[1]
            : file.type

        console.log(realType === detectedType, 'realType:', realType, 'detectedType:', detectedType)

        //  TODO - obrazok vinice sa deteguje zle (ako unknown)
        return realType === detectedType || detectedType === 'unknown'
      }
    },

    /**
     * Validates and saves a single uploaded file to the image store
     * @param {FileList} files - List of uploaded files
     * @param {Function} t - i18n translation function
     * @param {import('vue-router').Router} router - Vue router instance
     */
    async saveToImageStore(files, t, router) {
      if (globalConfig.featureFlags.enableImageLoad === false) return
      if (!files) return

      if (files.length > 1) {
        showToastModal(
          'error',
          t('imageStore.toast.errorMultipleFiles.title'),
          t('imageStore.toast.errorMultipleFiles.message'),
        )
        return
      }

      const result = await this.checkFile(files[0])

      if (result) {
        if (router.currentRoute.value.name !== 'editor') {
          await router.push({ name: 'editor' })
          await router.isReady()

          const uiStore = useUiStore()
          uiStore.isLoading = true
        }

        this.setFile(files[0], t)
      } else {
        showToastModal(
          'error',
          t('imageStore.toast.errorUnsupportedFileType.title'),
          t('imageStore.toast.errorUnsupportedFileType.message', { fileType: files[0].type }),
        )
      }
    },

    /**
     * Opens a file picker and loads the selected file
     * @param {Function} t - i18n translation function
     * @param {import('vue-router').Router} router - Vue router instance
     */
    loadFile(t, router) {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = '.png, .jpg, .jpeg, .pdf'
      input.style.display = 'none'

      input.addEventListener('change', () => {
        if (input.files && input.files.length > 0) {
          this.saveToImageStore(input.files, t, router)
        }
      })

      document.body.appendChild(input)
      input.click()
      document.body.removeChild(input)
    },

    /**
     * Copies the current preview image to the clipboard
     * @param {Function} t - i18n translation function
     * @returns {Promise<void>}
     */
    async copyImageToClipboard(t) {
      const dataUrl = this.previewUrl || ''
      if (!dataUrl) {
        console.warn('No preview available for clipboard export')
      }

      const blob = await (await fetch(dataUrl)).blob()

      await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })])

      showToastModal(
        'success',
        t('imageStore.toast.successFileCopiedToClipboard.title'),
        t('imageStore.toast.successFileCopiedToClipboard.message'),
      )
    },

    /**
     * Exports the current image as PNG, JPEG, WebP, SVG, or PDF based on format settings
     * @param {Object} editorStore - Store with current editor state
     * @param {Object} historyStore - Store with current history state
     * @param {Function} t - i18n translation function
     * @returns {Promise<boolean>} - True if export was started
     */
    async exportFile(editorStore, historyStore, t) {
      const canvas = this.getRenderedImage({ t, renderCall: true })
      if (!canvas) return false

      console.log('Exporting file...')

      const { width, height, quality } = this.newFileDimensions
      const isPdf = this.newFileFormat === 'pdf'

      // For pdf do not use raster preview
      await this.generatePreview(editorStore, historyStore, t, !isPdf)

      // Export as PDF
      if (isPdf) {
        // Use toBlob to preserve alpha channel
        const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'))

        const reader = new FileReader()
        reader.onload = async () => {
          const image = new Image()
          image.onload = async () => {
            await this.exportAsPdf(image, width, height, t)

            showToastModal(
              'success',
              t('imageStore.toast.successFileExported.title'),
              t('imageStore.toast.successFileExported.message', {
                fileName: this.newFileName,
              }),
            )
          }
          image.src = reader.result
        }
        reader.readAsDataURL(blob)

        return true
      }

      // Export as raster image (PNG, JPEG, WebP)
      const image = new Image()
      image.onload = async () => {
        await this.exportAsRaster(image, width, height, quality)

        showToastModal(
          'success',
          t('imageStore.toast.successFileExported.title'),
          t('imageStore.toast.successFileExported.message', {
            fileName: this.newFileName,
          }),
        )
      }
      image.src = this.previewUrl

      return true
    },

    /**
     * Exports the rendered image as a raster file (PNG, JPEG, or WebP)
     * @param {HTMLImageElement} image - Image element to export
     * @param {number} width - Target width of the export
     * @param {number} height - Target height of the export
     * @param {number} quality - Image quality (0–100)
     * @returns {Promise<void>}
     */
    async exportAsRaster(image, width, height, quality) {
      const mimeType =
        this.newFileFormat === 'jpeg' || this.newFileFormat === 'jpg'
          ? 'image/jpeg'
          : this.newFileFormat === 'webp'
            ? 'image/webp'
            : 'image/png'

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      ctx.drawImage(image, 0, 0, width, height)

      canvas.toBlob(
        (blob) => {
          if (!blob) return
          const blobUrl = URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = blobUrl
          link.download = `${this.newFileName}.${this.newFileFormat}`
          link.click()
          URL.revokeObjectURL(blobUrl)
        },
        mimeType,
        quality / 100,
      )
    },

    /**
     * Convert svg object (objects and frame) into pdf
     *
     * @param {Object} pdfSvg - jsPDF instance
     * @param {number} width - Width of the PDF
     * @param {number} height - Height of the PDF
     * @param {number} offsetX - X offset for the SVG content
     * @param {number} offsetY - Y offset for the SVG content
     */
    async createSvgPdf(pdfSvg, width, height, offsetX = 0, offsetY = 0) {
      // Defs
      const staticDefs = `
        <marker id="arrow-end" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto" markerUnits="strokeWidth">
          <path d="M0,0 L0,6 L6,3 z" fill="context-stroke" />
        </marker>
        <marker id="arrow-start" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto-start-reverse" markerUnits="strokeWidth">
          <path d="M0,0 L0,6 L6,3 z" fill="context-stroke" />
        </marker>
        <marker id="circle-end" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto" markerUnits="strokeWidth">
          <circle cx="3" cy="3" r="2" fill="context-stroke" />
        </marker>
        <marker id="circle-start" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto" markerUnits="strokeWidth">
          <circle cx="3" cy="3" r="2" fill="context-stroke" />
        </marker>
        <marker id="square-end" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto" markerUnits="strokeWidth">
          <rect x="1.5" y="1.5" width="3" height="3" fill="context-stroke" />
        </marker>
        <marker id="square-start" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto" markerUnits="strokeWidth">
          <rect x="1.5" y="1.5" width="3" height="3" fill="context-stroke" />
        </marker>
        `.trim()

      const dynamicDefs = Object.values(this.svgDefs || {}).join('\n')

      const svgDefsString = `
          <defs>
            ${staticDefs}
            ${dynamicDefs}
          </defs>
        `.trim()

      // Generate svg string
      if (this.svgObjects.length > 0) {
        const svgString = `
          <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
          ${svgDefsString}
            <g transform="translate(${offsetX}, ${offsetY})">
              ${this.svgObjects
                .map((obj) => {
                  const attrs = Object.entries(obj.attrs || {})
                    .map(([key, val]) => `${key}="${val}"`)
                    .join(' ')
                  if (obj.tag === 'text') {
                    const content = obj.content || ''
                    return `<text ${attrs}>${content}</text>`
                  }
                  return `<${obj.tag} ${attrs} />`
                })
                .join('\n')}
            </g>
          </svg>
        `.trim()

        // Parse SVG string
        try {
          const svgElement = new DOMParser().parseFromString(
            svgString,
            'image/svg+xml',
          ).documentElement
          await svg2pdf(svgElement, pdfSvg, {
            xOffset: 0,
            yOffset: 0,
            scale: 1,
          })
        } catch (e) {
          console.error('Error during svgObjects export to PDF:', e)
        }
      }

      // 4. Frame
      if (this.frame.enabled && this.frameSvg) {
        try {
          const parser = new DOMParser()
          const svgElement = parser.parseFromString(this.frameSvg, 'image/svg+xml').documentElement

          await svg2pdf(svgElement, pdfSvg, {
            xOffset: 0,
            yOffset: 0,
            scale: 1,
          })
        } catch (e) {
          console.error('Error during frame SVG export to PDF:', e)
        }
      }
    },

    /**
     * Exports the rendered image and optional SVG objects/frame as a PDF
     * using jsPDF and svg2pdf.
     * @param {HTMLImageElement} image - Base image to include in PDF
     * @param {number} width - Width of the PDF page
     * @param {number} height - Height of the PDF page
     * @returns {Promise<void>}
     */
    async exportAsPdf(image, width, height, t) {
      const imageStore = this
      const historyStore = useHistoryStore()
      const editorStore = useEditorStore()

      const offsetX = this.frame.enabled ? this.frame.width : 0
      let offsetY = this.frame.enabled ? this.frame.height : 0

      const finalWidth = width
      const finalHeight = height

      const hasHeader = useFrameTool(imageStore, historyStore, editorStore, t).isFrameWithHeader(
        this.frame.type,
      )

      if (hasHeader) {
        offsetY = this.frame.headerSize
      }

      // Export pdf as vector
      if (this.fileType === 'pdf' && this.pdfPageBytes) {
        /**
         * Convert hex color to rgb object with values 0–1 (for pdf-lib)
         * @param {string} hex - color
         * @returns {{ r: number, g: number, b: number }}
         */
        const hexToRgb = (hex) => {
          // Support shorthand
          if (hex.length === 4) {
            hex = '#' + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3]
          }

          const r = parseInt(hex.slice(1, 3), 16) / 255
          const g = parseInt(hex.slice(3, 5), 16) / 255
          const b = parseInt(hex.slice(5, 7), 16) / 255

          return { r, g, b }
        }

        /**
         * Parses a numeric value, returning a fallback value if the parsing fails.
         * @param {string|number} val - The value to parse.
         * @param {number} fallback - The fallback value to return if parsing fails.
         * @returns {number} - The parsed number or the fallback value.
         */
        const parseNum = (val, fallback = 0) => {
          const n = Number(val)
          return isNaN(n) ? fallback : n
        }

        /**
         * Extract rotation angle and center from SVG transform string
         * @param {string} transform - e.g. "rotate(-23, 327, 261)"
         * @param {number} defaultX - fallback X center
         * @param {number} defaultY - fallback Y center
         * @returns {{ angle: number, cx: number, cy: number }}
         */
        const getRotationFromTransform = (transform = '') => {
          const match = transform.match(/rotate\((-?\d+\.?\d*),\s*([-\d.]+),\s*([-\d.]+)\)/)
          return match ? parseFloat(match[1]) : 0
        }

        /**
         * Rotates a point around a center point by a given angle.
         * @param {number} x - The x coordinate of the point to rotate.
         * @param {number} y - The y coordinate of the point to rotate.
         * @param {number} cx - The x coordinate of the center point.
         * @param {number} cy - The y coordinate of the center point.
         * @param {number} angle - The angle to rotate the point by (in degrees).
         * @returns {{ x: number, y: number }} - The rotated point coordinates.
         */
        const rotatePoint = (x, y, cx, cy, angle) => {
          const rad = (angle * Math.PI) / 180
          const cos = Math.cos(rad)
          const sin = Math.sin(rad)
          const nx = cos * (x - cx) - sin * (y - cy) + cx
          const ny = sin * (x - cx) + cos * (y - cy) + cy
          return { x: nx, y: ny }
        }

        /**
         * Draw a single SVG element into a pdf-lib page
         * @param {PDFPage} page - pdf-lib page
         * @param {string} tag - svg tag name (rect, circle, line, text, path)
         * @param {Object} attrs - svg attributes as object
         * @param {number} finalHeight - total pdf page height
         * @param {number} offsetX - x offset
         * @param {number} offsetY - y offset
         */
        const drawSvgElement = async (page, tag, attrs, finalHeight, offsetX = 0, offsetY = 0) => {
          const strokeColor = attrs.stroke
            ? rgb(...Object.values(hexToRgb(attrs.stroke)))
            : undefined
          const fillColor =
            attrs.fill && attrs.fill !== 'none'
              ? rgb(...Object.values(hexToRgb(attrs.fill)))
              : undefined
          const strokeWidth = parseNum(attrs['stroke-width'], 0)
          const opacity = parseNum(attrs['opacity'], 1)
          const angle = getRotationFromTransform(attrs.transform)

          if (tag === 'rect') {
            const x = parseNum(attrs.x, 0) + offsetX
            const y = finalHeight - parseNum(attrs.y, 0) - offsetY - parseNum(attrs.height, 0)
            const width = parseNum(attrs.width, 0)
            const height = parseNum(attrs.height, 0)
            const cx = x + width / 2
            const cy = y + height / 2
            const topLeft = rotatePoint(x, y, cx, cy, -angle)

            page.drawRectangle({
              x: topLeft.x,
              y: topLeft.y,
              width,
              height,
              borderColor: strokeColor,
              color: fillColor,
              borderWidth: strokeWidth,
              opacity,
              borderOpacity: opacity,
              rotate: degrees(-angle),
            })
          }

          if (tag === 'circle') {
            const cx = parseNum(attrs.cx, 0) + offsetX
            const cy = finalHeight - parseNum(attrs.cy, 0) - offsetY
            const r = parseNum(attrs.r, 0)
            page.drawCircle({
              x: cx,
              y: cy,
              size: r,
              color: fillColor,
              borderColor: strokeColor,
              borderWidth: strokeWidth,
              opacity,
              rotate: degrees(-angle),
            })
          }

          if (tag === 'ellipse') {
            const cx = parseNum(attrs.cx, 0) + offsetX
            const cy = finalHeight - parseNum(attrs.cy, 0) - offsetY
            const rx = parseNum(attrs.rx, 0)
            const ry = parseNum(attrs.ry, 0)

            page.drawEllipse({
              x: cx,
              y: cy,
              xScale: rx,
              yScale: ry,
              color: fillColor,
              borderColor: strokeColor,
              borderWidth: strokeWidth,
              opacity,
              rotate: degrees(-angle),
            })
          }

          if (tag === 'line') {
            const x1 = parseNum(attrs.x1, 0) + offsetX
            const y1 = finalHeight - parseNum(attrs.y1, 0) - offsetY
            const x2 = parseNum(attrs.x2, 0) + offsetX
            const y2 = finalHeight - parseNum(attrs.y2, 0) - offsetY
            page.drawLine({
              start: { x: x1, y: y1 },
              end: { x: x2, y: y2 },
              thickness: strokeWidth,
              color: strokeColor,
              opacity,
              rotate: degrees(-angle),
            })
          }

          if (tag === 'text') {
            const textValue = attrs.textContent || ''

            const fontSize = parseNum(attrs['font-size'].replace('px', ''), 12)
            const x = parseNum(attrs.x, 0) + offsetX
            const y = parseNum(attrs.y, 0) + offsetY
            const pdfY = finalHeight - y

            const svgFontFamily = attrs['font-family'] || ''
            const isBold = attrs['font-weight'] === 'bold'
            const isItalic = attrs['font-style'] === 'italic'
            const isUnderline = attrs['text-decoration'] === 'underline'
            const letterSpacing = attrs['letter-spacing']
              ? parseFloat(attrs['letter-spacing'].replace('px', ''))
              : 0
            const angle = attrs.transform
              ? parseFloat(attrs.transform.match(/rotate\(([^)]+)\)/)?.[1]) || 0
              : 0

            const fillColor =
              attrs.fill && attrs.fill !== 'none'
                ? rgb(...Object.values(hexToRgb(attrs.fill)))
                : rgb(0, 0, 0)

            // Map SVG font family to standard PDF fonts
            let baseFont = StandardFonts.TimesRoman
            if (svgFontFamily.includes('Helvetica')) baseFont = StandardFonts.Helvetica
            else if (svgFontFamily.includes('Courier')) baseFont = StandardFonts.Courier

            // Bold/italic variants
            if (baseFont === StandardFonts.TimesRoman) {
              if (isBold && isItalic) baseFont = StandardFonts.TimesBoldItalic
              else if (isBold) baseFont = StandardFonts.TimesBold
              else if (isItalic) baseFont = StandardFonts.TimesItalic
            } else if (baseFont === StandardFonts.Helvetica) {
              if (isBold && isItalic) baseFont = StandardFonts.HelveticaBoldOblique
              else if (isBold) baseFont = StandardFonts.HelveticaBold
              else if (isItalic) baseFont = StandardFonts.HelveticaOblique
            } else if (baseFont === StandardFonts.Courier) {
              if (isBold && isItalic) baseFont = StandardFonts.CourierBoldOblique
              else if (isBold) baseFont = StandardFonts.CourierBold
              else if (isItalic) baseFont = StandardFonts.CourierOblique
            }

            const font = await finalPdf.embedFont(baseFont)

            // Draw text with optional letter spacing
            if (letterSpacing) {
              let cursorX = x
              for (const char of textValue) {
                page.drawText(char, {
                  x: cursorX,
                  y: pdfY,
                  size: fontSize,
                  font,
                  color: fillColor,
                  rotate: degrees(-angle),
                  opacity,
                })
                cursorX += font.widthOfTextAtSize(char, fontSize) + letterSpacing
              }
            } else {
              page.drawText(textValue, {
                x,
                y: pdfY,
                size: fontSize,
                font,
                color: fillColor,
                rotate: degrees(-angle),
                opacity,
              })
            }

            // Underline as one line under text
            if (isUnderline) {
              const textWidth =
                font.widthOfTextAtSize(textValue, fontSize) +
                (letterSpacing || 0) * (textValue.length - 1)
              const underlineY = pdfY - fontSize * 0.1
              page.drawLine({
                start: { x, y: underlineY },
                end: { x: x + textWidth, y: underlineY },
                thickness: Math.max(1, fontSize * 0.08),
                color: fillColor,
                opacity,
              })
            }
          }

          // TODO
          if (tag === 'path') {
            const fillColor =
              attrs.fill && attrs.fill !== 'none'
                ? rgb(...Object.values(hexToRgb(attrs.fill)))
                : undefined
            const strokeColor = attrs.stroke
              ? rgb(...Object.values(hexToRgb(attrs.stroke)))
              : undefined
            const strokeWidth = parseNum(attrs['stroke-width'], 1)
            const d = attrs.d

            page.drawSvgPath(d, {
              color: fillColor,
              borderColor: strokeColor,
              borderWidth: strokeWidth,
            })
          }
        }

        // 1. Base image
        const existingPdf = await PDFDocument.load(imageStore.pdfPageBytes)
        const finalPdf = await PDFDocument.create()

        const originalPage = existingPdf.getPage(0)
        const width = originalPage.getWidth()
        const height = originalPage.getHeight()

        // Embed page
        const [embeddedPage] = await finalPdf.embedPages([originalPage])

        const finalPage = finalPdf.addPage([width, height])
        finalPage.drawPage(embeddedPage, {
          x: 0,
          y: 0,
          width,
          height,
        })

        // 2. SVG objects
        for (const obj of this.svgObjects) {
          // Add text to attributes
          obj.attrs.textContent = obj.content || ''
          drawSvgElement(finalPage, obj.tag, obj.attrs, finalHeight, offsetX, offsetY)
        }

        // 3. Frame
        if (this.frame.enabled && this.frameSvg) {
          const parser = new DOMParser()
          const svgEl = parser.parseFromString(this.frameSvg, 'image/svg+xml').documentElement

          svgEl.querySelectorAll('rect,circle,path,line,text').forEach((el) => {
            const tag = el.tagName
            const attrs = Object.fromEntries([...el.attributes].map((a) => [a.name, a.value]))
            attrs.textContent = el.textContent
            drawSvgElement(finalPage, tag, attrs, finalHeight, 0, 0)
          })
        }

        // 4. Save
        const pdfBytes = await finalPdf.save()
        const blob = new Blob([pdfBytes], { type: 'application/pdf' })
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = `${this.newFileName}.pdf`
        link.click()
      }
      // Export pdf as raster (with jsPDF)
      else {
        // Create pdf
        const pdf = new jsPDF({
          orientation: finalWidth > finalHeight ? 'landscape' : 'portrait',
          unit: 'px',
          format: [finalWidth, finalHeight],
        })

        // Add base image
        pdf.addImage(image, 'PNG', offsetX, offsetY, image.width, image.height)

        // Add svgObjects and frame
        await this.createSvgPdf(pdf, finalWidth, finalHeight, offsetX, offsetY)

        // Save
        pdf.save(`${this.newFileName}.pdf`)
      }
    },

    /**
     * Function to use rasterize background image (only in pdf)
     */
    rasterizeBaseImage() {
      console.log('Rasterizing background image...')
      this.fileType = 'image'
    },

    /**
     * Renders all SVG objects over the base image and rasterize the result into a canvas.
     * Used to prepare the image for export as raster or PDF.
     * @param {number|null} width - Optional width to rasterize to
     * @param {number|null} height - Optional height to rasterize to
     * @param {boolean} storeAsNew - Whether to store the result in `newRenderedImage` or update current `renderedImage`
     * @returns {Promise<void>}
     */
    async rasterize(t, width = null, height = null, storeAsNew = false) {
      if (this.svgObjects.length === 0) return

      console.log('Rasterizing image with SVG objects...')

      // Determine target dimensions
      const usedWidth = width ?? this.fileDimensions.width
      const usedHeight = height ?? this.fileDimensions.height

      // SVG <defs> for markers (arrows, circles, squares)
      // UPDATE svg string

      const staticDefs = `
        <marker id="arrow-end" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto" markerUnits="strokeWidth">
          <path d="M0,0 L0,6 L6,3 z" fill="context-stroke" />
        </marker>
        <marker id="arrow-start" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto-start-reverse" markerUnits="strokeWidth">
          <path d="M0,0 L0,6 L6,3 z" fill="context-stroke" />
        </marker>
        <marker id="circle-end" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto" markerUnits="strokeWidth">
          <circle cx="3" cy="3" r="2" fill="context-stroke" />
        </marker>
        <marker id="circle-start" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto" markerUnits="strokeWidth">
          <circle cx="3" cy="3" r="2" fill="context-stroke" />
        </marker>
        <marker id="square-end" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto" markerUnits="strokeWidth">
          <rect x="1.5" y="1.5" width="3" height="3" fill="context-stroke" />
        </marker>
        <marker id="square-start" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto" markerUnits="strokeWidth">
          <rect x="1.5" y="1.5" width="3" height="3" fill="context-stroke" />
        </marker>
        `.trim()

      const dynamicDefs = Object.values(this.svgDefs || {}).join('\n')

      const svgDefsString = `
        <defs>
          ${staticDefs}
          ${dynamicDefs}
        </defs>
      `.trim()

      // Create SVG markup from svgObjects
      const svgString = `
        <svg xmlns="http://www.w3.org/2000/svg" width="${usedWidth}" height="${usedHeight}">
        ${svgDefsString}
          ${this.svgObjects
            .map((obj) => {
              const attrs = Object.entries(obj.attrs || {})
                .map(([key, val]) => `${key}="${val}"`)
                .join(' ')
              if (obj.tag === 'text') {
                const content = obj.content || ''
                return `<text ${attrs}>${content}</text>`
              }
              return `<${obj.tag} ${attrs} />`
            })
            .join('\n')}
        </svg>
      `.trim()

      // Convert SVG string to image
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml' })
      const svgUrl = URL.createObjectURL(svgBlob)

      // Prepare canvas and context
      const canvas = document.createElement('canvas')
      canvas.width = usedWidth
      canvas.height = usedHeight
      const ctx = canvas.getContext('2d')

      // Draw base image, scaled if necessary
      ctx.drawImage(this.getRenderedImage({ t, renderCall: true }), 0, 0, usedWidth, usedHeight)

      // Draw SVG overlay on top of the image
      await new Promise((resolve, reject) => {
        const img = new Image()
        img.onload = () => {
          ctx.drawImage(img, 0, 0)
          URL.revokeObjectURL(svgUrl)
          resolve()
        }
        img.onerror = (e) => {
          console.error('Error loading SVG overlay image', e)
          reject(e)
        }
        img.src = svgUrl
      })

      // Store result either as renderedImage or newRenderedImage
      if (storeAsNew) {
        this.newRenderedImage = canvas
      } else {
        this.setRenderedImage(canvas)
        this.newRenderedImage = null

        // Clear svg values
        this.svgObjects = []
        this.selectedSvgObjectId = null
      }
    },

    /**
     * Generates a preview image for export, with or without an SVG frame.
     * The result is stored in `previewUrl`.
     *
     * @param {object} editorStore - Editor store instance
     * @param {object} historyStore - History store instance
     * @param {Function} t - Translation function (vue-i18n)
     * @param {boolean} [renderAsRaster=true] - Whether to render the result as raster (true) or only store the frame SVG (false)
     * @returns {Promise<void>}
     */
    async generatePreview(editorStore, historyStore, t, renderAsRaster = true) {
      const imageStore = this

      console.log('Generating preview with frame...')
      this.phoneButtonsCanNotBeDrawnToastFlag = true // Set flag to prevent toast showing

      const targetWidth = this.frame.enabled
        ? this.newFileDimensions.width - 2 * this.frame.width
        : this.newFileDimensions.width
      let targetHeight = this.frame.enabled
        ? this.newFileDimensions.height - 2 * this.frame.height
        : this.newFileDimensions.height

      const hasHeader = useFrameTool(imageStore, historyStore, editorStore, t).isFrameWithHeader(
        this.frame.type,
      )

      const hasFooter = useFrameTool(imageStore, historyStore, editorStore, t).isFrameWithFooter(
        this.frame.type,
      )

      if (hasHeader) {
        targetHeight = this.newFileDimensions.height - this.frame.headerSize - this.frame.height
      } else if (hasFooter) {
        targetHeight = this.newFileDimensions.height - this.frame.footerSize - this.frame.height
      }

      // Rasterize base image + SVG objects at export size
      await this.rasterize(t, targetWidth, targetHeight, true)

      const baseImage = this.newRenderedImage || this.getRenderedImage({ t, renderCall: true })
      if (!baseImage) {
        console.warn('No base image available for preview generation')
        return
      }

      // If frame is not enabled, just return the base image
      if (!this.frame.enabled) {
        console.log('Frame not enabled, using base image for preview')

        const mimeType =
          this.newFileFormat === 'jpeg' || this.newFileFormat === 'jpg'
            ? 'image/jpeg'
            : this.newFileFormat === 'webp'
              ? 'image/webp'
              : 'image/png'

        const quality = this.newFileDimensions.quality / 100

        this.previewUrl = baseImage.toDataURL(mimeType, quality)
        return
      }

      console.log('Generating preview with SVG frame...')

      // Create temporary SVG element and apply frame
      const tempFrameSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
      const { applyFrameRender } = useFrameTool(this, historyStore, editorStore, t)
      applyFrameRender(tempFrameSvg, targetWidth, targetHeight)

      // If vector export only, store raw SVG frame and exit
      if (!renderAsRaster) {
        // After serializing the SVG
        const rawSvg = new XMLSerializer().serializeToString(tempFrameSvg)

        // Remove any style attribute from the <svg> tag
        const cleanedSvg = rawSvg.replace(/<svg([^>]+)style="[^"]*"([^>]*)>/, '<svg$1$2>')

        this.frameSvg = cleanedSvg

        console.log('Vector export only, stored SVG frame:', this.frameSvg)
        return
      }

      // Render frame + base image into previewUrl
      const frameSvgString = new XMLSerializer().serializeToString(tempFrameSvg)
      const frameBlob = new Blob([frameSvgString], { type: 'image/svg+xml;charset=utf-8' })
      const frameUrl = URL.createObjectURL(frameBlob)

      const frameImg = await new Promise((resolve) => {
        const img = new Image()
        img.onload = () => {
          URL.revokeObjectURL(frameUrl)
          resolve(img)
        }
        img.src = frameUrl
      })

      // Get canvas size from rendered frame SVG
      const canvasWidth = parseInt(tempFrameSvg.getAttribute('width'), 10)
      const canvasHeight = parseInt(tempFrameSvg.getAttribute('height'), 10)

      // Determine image offset inside the frame
      const offsetX = this.frame?.width || 0
      let offsetY = this.frame?.height || offsetX

      // If frame has header, adjust offsetY accordingly
      if (hasHeader) {
        offsetY = this.frame.headerSize
      }

      // Create final canvas and render both layers
      const exportCanvas = document.createElement('canvas')
      exportCanvas.width = canvasWidth
      exportCanvas.height = canvasHeight
      const ctx = exportCanvas.getContext('2d')

      ctx.drawImage(
        baseImage,
        0,
        0,
        baseImage.width,
        baseImage.height,
        offsetX,
        offsetY,
        targetWidth,
        targetHeight,
      )
      ctx.drawImage(frameImg, 0, 0)

      const mimeType =
        this.newFileFormat === 'jpeg' || this.newFileFormat === 'jpg'
          ? 'image/jpeg'
          : this.newFileFormat === 'webp'
            ? 'image/webp'
            : 'image/png'

      const quality = this.newFileDimensions.quality / 100

      this.previewUrl = exportCanvas.toDataURL(mimeType, quality)
    },

    // --------------------------------
    // SVG object management methods
    // --------------------------------

    /**
     * Adds or replaces an SVG definition in the svgDefs array.
     * @param {string} id - The ID of the SVG definition
     * @param {string} markup - The SVG markup to add or replace
     */
    addOrReplaceSvgDef(id, markup) {
      const index = this.svgDefs.findIndex((def) => def.includes(`id="${id}"`))
      if (index !== -1) {
        this.svgDefs[index] = markup
      } else {
        this.svgDefs.push(markup)
      }
    },

    /**
     * Returns the SVG definition by its ID
     * @param {string} id - The ID of the SVG definition
     * @returns {string|null} - The SVG definition markup or null if not found
     */
    getSvgDefById(id) {
      return this.svgDefs.find((def) => def.includes(`id="${id}"`))
    },

    /**
     * Returns the currently selected SVG object
     * @returns {Object|null} - The currently selected SVG object or null if none is selected
     */
    getSelectedSvgObject() {
      return this.svgObjects.find((obj) => obj.id === this.selectedSvgObjectId)
    },

    /**
     * Returns the SVG object by its ID
     * @param {number} id - The ID of the SVG object
     * @returns {Object|null} - The SVG object or null if not found
     */
    getSvgObjectById(id) {
      return this.svgObjects.find((obj) => obj.id === id)
    },

    /**
     * Returns the index of the currently selected SVG object
     * @returns {number} - The index of the currently selected SVG object, or -1 if none is selected
     */
    getIndexOfSelectedSvgObject() {
      return this.svgObjects.findIndex((obj) => obj.id === this.selectedSvgObjectId)
    },

    /**
     * Returns the index of an SVG object by its ID
     * @param {*} id - The ID of the SVG object
     * @returns {number} - The index of the SVG object, or -1 if not found
     */
    getIndexOfSvgObjectById(id) {
      return this.svgObjects.findIndex((obj) => obj.id === id)
    },

    /**
     * Checks if the currently selected SVG object has the highest z-index
     * @returns {boolean} - True if the selected SVG object is the one with the highest z-index
     */
    isMaxZIndexOfSelectedSvgObject() {
      const index = this.getIndexOfSelectedSvgObject()
      if (index !== null) {
        const selectedObject = this.svgObjects[index]
        if (selectedObject.class === 'magnifyArea') {
          return index === this.svgObjects.length - 2
        } else {
          return index === this.svgObjects.length - 1
        }
      }
      return false
    },

    /**
     * Checks if the currently selected SVG object has the lowest z-index
     * @returns {boolean} - True if the selected SVG object is the one with the lowest z-index
     */
    isMinZIndexOfSelectedSvgObject() {
      const index = this.getIndexOfSelectedSvgObject()
      if (index !== null) {
        return index === 0
      }
      return false
    },

    // --------------------------------
    // Snapshot management methods
    // --------------------------------

    /**
     * Returns a snapshot of the current image state.
     * Used for undo/redo and workspace tab management.
     *
     * @returns {object} Snapshot object
     */
    getSnapshot(t) {
      const snapshot = {
        fileName: this.fileName,
        fileType: this.fileType,
        fileDimensions: JSON.parse(JSON.stringify(this.fileDimensions)),
        // originalFileDimensions: JSON.parse(JSON.stringify(this.originalFileDimensions)),
        previewUrl: this.previewUrl,
        renderedImage: this.getRenderedImage({ t, renderCall: true })?.toDataURL() || null,
        pdfPageBytes: this.pdfPageBytes ? new Uint8Array(this.pdfPageBytes) : undefined,
        totalPdfCropBox: JSON.parse(JSON.stringify(this.totalPdfCropBox)),
        // originalImage: this.originalImage?.toDataURL() || null,
        svgObjects: JSON.parse(JSON.stringify(this.svgObjects)),
        svgDefs: JSON.parse(JSON.stringify(this.svgDefs)),
        imageOperations: JSON.parse(JSON.stringify(this.imageOperations)),
        frame: JSON.parse(JSON.stringify(this.frame)),
      }

      console.log('[getSnapshot] imageOperations:', snapshot.imageOperations)

      return snapshot
    },

    /**
     * Applies a previously saved snapshot to the image state.
     *
     * @param {object} snapshot - Snapshot object (from `getSnapshot`)
     * @returns {void}
     */
    applySnapshot(snapshot) {
      this.fileName = snapshot.fileName
      this.fileType = snapshot.fileType
      this.fileDimensions = JSON.parse(JSON.stringify(snapshot.fileDimensions))
      this.previewUrl = snapshot.previewUrl
      this.svgObjects = JSON.parse(JSON.stringify(snapshot.svgObjects))
      this.selectedSvgObjectId = null // Reset selected SVG object after applying snapshot
      this.imageOperations = JSON.parse(JSON.stringify(snapshot.imageOperations))
      this.frame = JSON.parse(JSON.stringify(snapshot.frame))
      this.svgDefs = JSON.parse(JSON.stringify(snapshot.svgDefs))
      this.isArtifactsVisible = false

      if (snapshot.pdfPageBytes) {
        if (snapshot.pdfPageBytes instanceof Uint8Array) {
          this.pdfPageBytes = new Uint8Array(snapshot.pdfPageBytes)
        } else if (typeof snapshot.pdfPageBytes === 'object') {
          // Conversion of {0: 37, 1: 80, ...} to Uint8Array
          const keys = Object.keys(snapshot.pdfPageBytes).sort((a, b) => a - b)
          const arr = keys.map((k) => snapshot.pdfPageBytes[k])
          this.pdfPageBytes = new Uint8Array(arr)
        } else {
          this.pdfPageBytes = undefined
        }
      } else {
        this.pdfPageBytes = undefined
      }

      this.totalPdfCropBox = JSON.parse(JSON.stringify(snapshot.totalPdfCropBox))

      if (snapshot.renderedImage) {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          canvas.width = img.width
          canvas.height = img.height
          const ctx = canvas.getContext('2d')
          ctx.drawImage(img, 0, 0)
          this.setRenderedImage(canvas)
        }
        img.src = snapshot.renderedImage
      } else {
        this.setRenderedImage(null)
      }

      console.log('[applySnapshot] imageOperations (after apply):', this.imageOperations)
    },

    /**
     * Returns a complete snapshot of the image store state. (for multi-file support)
     *
     * @returns {object} A deep clone of the full image store state.
     */
    getFullSnapshot(t) {
      return {
        file: this.file,
        fileType: this.fileType,

        fileName: this.fileName,
        fileFormat: this.fileFormat,
        fileDimensions: JSON.parse(JSON.stringify(this.fileDimensions)),

        newFileName: this.newFileName,
        newFileFormat: this.newFileFormat,
        newFileDimensions: JSON.parse(JSON.stringify(this.newFileDimensions)),

        previewUrl: this.previewUrl,

        originalImage: this.originalImage?.toDataURL() || null,
        originalFileDimensions: JSON.parse(JSON.stringify(this.originalFileDimensions)),

        renderedImage: this.getRenderedImage({ t, renderCall: true })?.toDataURL() || null,
        tmpRenderedImage: this.tmpRenderedImage?.toDataURL() || null,
        newRenderedImage: this.newRenderedImage?.toDataURL() || null,

        pdfPageBytes: this.pdfPageBytes ? new Uint8Array(this.pdfPageBytes) : undefined,
        totalPdfCropBox: JSON.parse(JSON.stringify(this.totalPdfCropBox)),

        svgObjects: JSON.parse(JSON.stringify(this.svgObjects)),
        selectedSvgObjectId: this.selectedSvgObjectId,
        // justCreatedSvgObjectId: this.justCreatedSvgObjectId,
        // selectedSvgObjectIds: this.selectedSvgObjectIds,
        // svgDefs: JSON.parse(JSON.stringify(this.svgDefs)),

        imageOperations: JSON.parse(JSON.stringify(this.imageOperations)),

        frame: JSON.parse(JSON.stringify(this.frame)),
        frameSvg: this.frameSvg,

        phoneButtonsCanNotBeDrawnToastFlag: this.phoneButtonsCanNotBeDrawnToastFlag,

        isArtifactsVisible: this.isArtifactsVisible,
      }
    },

    /**
     * Restores the full image store state from a previously saved snapshot. (for multi-file support)
     *
     * @param {object} snapshot - The full snapshot object previously created by `getFullSnapshot`.
     * @returns {void}
     */
    applyFullSnapshot(snapshot) {
      this.file = snapshot.file
      this.fileType = snapshot.fileType

      this.fileName = snapshot.fileName
      this.fileFormat = snapshot.fileFormat
      this.fileDimensions = JSON.parse(JSON.stringify(snapshot.fileDimensions))

      this.newFileName = snapshot.newFileName
      this.newFileFormat = snapshot.newFileFormat
      this.newFileDimensions = JSON.parse(JSON.stringify(snapshot.newFileDimensions))

      this.previewUrl = snapshot.previewUrl

      this.originalFileDimensions = JSON.parse(JSON.stringify(snapshot.originalFileDimensions))

      this.svgObjects = JSON.parse(JSON.stringify(snapshot.svgObjects))
      this.selectedSvgObjectId = null
      // this.justCreatedSvgObjectId = null
      // this.selectedSvgObjectIds = []
      // this.svgDefs = JSON.parse(JSON.stringify(snapshot.svgDefs))

      this.imageOperations = JSON.parse(JSON.stringify(snapshot.imageOperations))

      this.frame = JSON.parse(JSON.stringify(snapshot.frame))
      this.frameSvg = snapshot.frameSvg

      if (snapshot.pdfPageBytes) {
        if (snapshot.pdfPageBytes instanceof Uint8Array) {
          this.pdfPageBytes = new Uint8Array(snapshot.pdfPageBytes)
        } else if (typeof snapshot.pdfPageBytes === 'object') {
          // Conversion of {0: 37, 1: 80, ...} to Uint8Array
          const keys = Object.keys(snapshot.pdfPageBytes).sort((a, b) => a - b)
          const arr = keys.map((k) => snapshot.pdfPageBytes[k])
          this.pdfPageBytes = new Uint8Array(arr)
        } else {
          this.pdfPageBytes = undefined
        }
      } else {
        this.pdfPageBytes = undefined
      }

      this.totalPdfCropBox = JSON.parse(JSON.stringify(snapshot.totalPdfCropBox))

      this.phoneButtonsCanNotBeDrawnToastFlag = snapshot.phoneButtonsCanNotBeDrawnToastFlag

      // Rendered image
      if (snapshot.renderedImage) {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          canvas.width = img.width
          canvas.height = img.height
          const ctx = canvas.getContext('2d')
          ctx.drawImage(img, 0, 0)
          this.setRenderedImage(canvas)
        }
        img.src = snapshot.renderedImage
      } else {
        this.setRenderedImage(null)
      }

      // Original image
      if (snapshot.originalImage) {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          canvas.width = img.width
          canvas.height = img.height
          const ctx = canvas.getContext('2d')
          ctx.drawImage(img, 0, 0)
          this.originalImage = canvas
        }
        img.src = snapshot.originalImage
      } else {
        this.originalImage = null
      }

      // Tmp rendered image
      if (snapshot.tmpRenderedImage) {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          canvas.width = img.width
          canvas.height = img.height
          const ctx = canvas.getContext('2d')
          ctx.drawImage(img, 0, 0)
          this.tmpRenderedImage = canvas
        }
        img.src = snapshot.tmpRenderedImage
      } else {
        this.tmpRenderedImage = null
      }

      // New rendered image
      if (snapshot.newRenderedImage) {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          canvas.width = img.width
          canvas.height = img.height
          const ctx = canvas.getContext('2d')
          ctx.drawImage(img, 0, 0)
          this.newRenderedImage = canvas
        }
        img.src = snapshot.newRenderedImage
      } else {
        this.newRenderedImage = null
      }
    },
  },
})
