import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf'
import { defineStore } from 'pinia'
import { useToastModal } from '@/composables/modals/useToastModal'
import { nextTick } from 'vue'
import { useHistoryStore } from './historyStore'
import { useFrameTool } from '@/composables/tools/useFrameTool'
import { useWorkspaceStore } from './workspaceStore'
// import { useUiStore } from './uiStore'
import { editorConfig } from '@/config/editorConfig'
import { useConsole } from '@/composables/common/useConsole.js'
import { useViewportStore } from './viewportStore'

pdfjsLib.GlobalWorkerOptions.workerSrc =
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js'

const { log, warn } = useConsole()
const { showToastModal } = useToastModal()

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
    renderPipeline: {
      baseState: null,
      // {
      //   canvas: HTMLCanvasElement,
      //   pdfBytes: Uint8Array | null
      // }

      checkpoints: [],
      // [
      //   {
      //     opIndex: number,
      //     state: {
      //       canvas: HTMLCanvasElement,
      //       pdfBytes: Uint8Array | null
      //     },
      //     dimensions: {
      //       width,
      //       height,
      //       fileAspectRatio
      //     }
      //   }
      // ]

      currentOpIndex: -1, // Where we are in the operation list
      lastRenderedOpIndex: -1, // Optimization
    },

    historyWasChanged: false,
    /** The currently loaded image file */
    file: null,
    /** Type of the loaded file */
    fileType: '', // 'image' or 'pdf'

    /** Whether to show PDF as image because of unsupported features */
    showPdfAsImage: false,

    /** Name of the loaded file */
    fileName: '',
    /** Format of the loaded file */
    fileFormat: '', // 'png', 'jpg', 'jpeg', 'pdf'
    /** Dimensions of the loaded file */
    fileDimensions: {
      fileAspectRatio: 1,
      width: 0,
      height: 0,
      quality: 100,
    },

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
    previewUrl: '',

    /** Original image */
    originalImage: null,
    originalFileDimensions: {
      fileAspectRatio: 1,
      width: 0,
      height: 0,
      quality: 100,
    },

    blurPreviewUrl: '',

    // Value for raster image rendering
    /** Rendered image - showed image in canvas */
    renderedImage: null,
    /** Temporary rendered image - used for saving canvas if frame with rounded corners is applied */
    tmpRenderedImage: null,

    /** Overlay image - used for displaying svg objects after rasterization in pdf file */
    overlayImage: null,

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
    /** Array of blur objects */
    blurObjects: [],

    /** ID of the currently selected SVG object */
    selectedSvgObjectId: null,
    /** ID of the SVG object that was just created */
    justCreatedSvgObjectId: null,
    /** Array of selected SVG object IDs for multi-selection */
    selectedSvgObjectIds: [],
    /** Dynamic SVG definitions */
    svgDefs: [],
    /** Array of blur image elements */
    blurImages: [],
    /** SVG object copied to clipboard */
    clipboardSvgObject: null,

    /** Array of image operations to apply */
    imageOperations: [],
    // type ImageOperation = {
    //   type: string
    //   params?: Record<string, any>
    //   cost?: 'low' | 'medium' | 'high'
    //   affectsGeometry?: boolean
    // }

    /** Image frame */
    frame: {
      enabled: false,
      type: 'none',
      useMillimeters: false,
      width: 0,
      height: 0,
      widthMm: 0,
      heightMm: 0,
      color: '#000000',
      headerSize: 0, // Size of the header for browser frames
      headerSizeMm: 0, // Size of the header for browser frames in mm
      footerSize: 0, // Size of the footer for windows frame
      footerSizeMm: 0, // Size of the footer for windows frame in mm
      outlineEnabled: false, // Whether to draw an outline around the frame
      phoneHeaderEnabled: true, // Whether to draw a header for phone frames
      phoneHeaderExpand: false, // Whether header expands beyond image
      phoneButtonsEnabled: true, // Whether to draw buttons for phone frames
      phoneNavigationEnabled: true, // Whether to draw navigation for phone frames
      phoneHeaderTimeInMinutes: 610, // Default time for phone header (10:10)
      phoneHeaderTextColor: '#000000', // Default text color for phone header
      phoneHeaderBackgroundColor: '#ffffff', // Default background color for phone header
      modificationFlag: 1, // Flag to track frame modifications
    },
    /** Raw SVG frame for vector export */
    frameSvg: '',

    /** Whether the image has artifacts (noise) */
    imageHasArtifacts: false, // TODO nepoužíva sa nikde
    /** Whether the user has canceled image artifacts display */
    imageArtifactsCanceledByUser: false,

    // PDF
    pdfPage: null,
    pdfFile: null,

    /** PDF page bytes */
    pdfPageBytes: null,

    /** Background removal canvas with feather */
    removalCanvas: null,
    /** Background removal canvas without feather */
    removalCanvasOriginal: null,

    /** List of image warnings id */
    imageWarnings: [],
    /** Set of expanded image warning IDs */
    expandedImageWarningIds: new Set(),
  }),
  getters: {
    /**
     * Returns true if an image or PDF file is currently loaded
     * @returns {boolean}
     */
    isImageLoaded: (state) => {
      return state.file !== null
    },

    /**
     * Returns true if rasterization is needed (i.e., if there are any SVG or blur objects)
     */
    needRasterization: (state) => {
      return state.svgObjects.length > 0 || state.blurObjects.length > 0
    },

    needMergeOverlay: (state) => {
      return state.overlayImage !== null
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

    /**
     * Sets the current overlay image
     * @param {HTMLCanvasElement} overlay - The overlay image to set
     */
    setOverlay(overlay) {
      console.warn('Setting overlay image')
      this.overlayImage = overlay
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
        const historyStore = useHistoryStore()
        const viewportStore = useViewportStore()
        if (
          this.frame.enabled &&
          useFrameTool(imageStore, historyStore, viewportStore, t).isPhoneFrame(this.frame.type)
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
     * Adds a deep copy of a new image operation to the operations list
     * @param {Object} operation - The image operation to add
     */
    addImageOperation(operation) {
      // this.imageOperations.push(structuredClone(operation))
      this.imageOperations.push(operation)
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
      this.blurObjects = []
      this.blurImages = []
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
        useMillimeters: false,
        width: 0,
        height: 0,
        widthMm: 0,
        heightMm: 0,
        color: '#000000',
        headerSize: 0, // Size of the header for browser frames
        headerSizeMm: 0, // Size of the header for browser frames in mm
        footerSize: 0, // Size of the footer for windows frame
        footerSizeMm: 0, // Size of the footer for windows frame in mm
        outlineEnabled: false, // Whether to draw an outline around the frame
        phoneHeaderEnabled: true, // Whether to draw a header for phone frames
        phoneHeaderExpand: false, // Whether header expands beyond image
        phoneButtonsEnabled: true, // Whether to draw buttons for phone frames
        phoneNavigationEnabled: true, // Whether to draw navigation for phone frames
        phoneHeaderTimeInMinutes: 610, // Default time for phone header (10:10)
        phoneHeaderTextColor: '#000000', // Default text color for phone header
        phoneHeaderBackgroundColor: '#ffffff', // Default background color for phone header
        modificationFlag: 1, // Flag to track frame modifications
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

      // Cut new name to maximum limit
      trimmedName = trimmedName.slice(0, editorConfig.maxFileNameLength)

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
      // FILE
      this.file = null
      this.fileType = ''
      this.fileFormat = ''
      this.showPdfAsImage = false

      // PDF
      this.pdfPage = null
      this.pdfFile = null
      this.pdfPageBytes = null

      // PIPELINE
      this.renderPipeline = {
        baseState: null,
        checkpoints: [],
        currentOpIndex: -1,
        lastRenderedOpIndex: -1,
      }

      this.resetImageOperations()

      // FRAME
      this.resetFrame()
      this.frameSvg = ''

      // DIMENSIONS
      this.fileDimensions = {
        fileAspectRatio: 1,
        width: 0,
        height: 0,
        quality: 100,
      }
      this.newFileDimensions = { ...this.fileDimensions }
      this.originalFileDimensions = { ...this.fileDimensions }

      // IMAGES
      this.renderedImage = null
      this.tmpRenderedImage = null
      this.originalImage = null

      // OVERLAYS
      this.overlayImage = null

      // SVG
      this.resetSvgObject()

      // FLAGS
      this.historyWasChanged = false
      this.imageHasArtifacts = false
      this.imageArtifactsCanceledByUser = false

      // WARNINGS
      this.imageWarnings = []
      this.expandedImageWarningIds = new Set()

      // BACKGROUND REMOVAL
      this.removalCanvas = null
      this.removalCanvasOriginal = null
    },

    /**
     * Closes the current file and resets all image-related state
     */
    closeFile() {
      this.resetImageStoreForNewFile()
    },

    /**
     * Merge the overlay image into the main rendered image
     * This will draw the overlay on top of the current rendered image
     * and save the result back into renderedImage (and tmpRenderedImage).
     * TODO - maybe remove uz sa to nikde nepouziva
     */
    mergeOverlayIntoImage() {
      if (!this.renderedImage || !this.overlayImage) {
        warn('No rendered image or overlay image to merge')
        return
      }

      // Create a new canvas same size as the rendered image
      const canvas = document.createElement('canvas')
      canvas.width = this.renderedImage.width
      canvas.height = this.renderedImage.height

      const ctx = canvas.getContext('2d')

      // Draw base image
      ctx.drawImage(this.renderedImage, 0, 0)

      // Draw overlay on top (assuming overlay has same dimensions or should align top-left)
      ctx.drawImage(this.overlayImage, 0, 0)

      // Save merged image back into store
      this.setRenderedImage(canvas, false)
      this.originalImage = canvas

      // Clear overlay
      this.overlayImage = null
    },

    /**
     * Function to use rasterize background image (only in pdf)
     */
    rasterizeBaseImage() {
      log('Rasterizing background image...')
      this.fileType = 'image'
    },

    async rasterize(mode, { width = null, height = null } = {}, t) {
      if (this.svgObjects.length === 0 && this.blurObjects.length === 0) {
        return null
      }

      log(`[rasterize] mode = ${mode}`)

      const usedWidth = width ?? this.fileDimensions.width
      const usedHeight = height ?? this.fileDimensions.height

      /* =========================
      SVG DEFINITIONS
      ========================= */

      const staticDefs = `
        <marker id="arrow-end" markerWidth="10" markerHeight="10"
          refX="3" refY="3" orient="auto" markerUnits="strokeWidth">
          <path d="M0,0 L0,6 L6,3 z" fill="context-stroke" />
        </marker>
      `.trim()

      const dynamicDefs = Object.values(this.svgDefs || {}).join('\n')

      const svgDefsString = `
        <defs>
          ${staticDefs}
          ${dynamicDefs}
        </defs>
      `.trim()

      const allObjects = [...(this.blurObjects || []), ...(this.svgObjects || [])]

      const svgObjectsString = allObjects
        .map((obj) => {
          const attrs = Object.entries(obj.attrs || {})
            .map(([key, val]) => `${key}="${val}"`)
            .join(' ')
          if (obj.tag === 'text') {
            return `<text ${attrs}>${obj.content || ''}</text>`
          }
          return `<${obj.tag} ${attrs} />`
        })
        .join('\n')

      const blurImagesString = (this.blurImages || []).join('\n')

      const svgString = `
        <svg xmlns="http://www.w3.org/2000/svg"
            width="${usedWidth}"
            height="${usedHeight}">
          ${svgDefsString}
          ${blurImagesString}
          ${svgObjectsString}
        </svg>
      `.trim()

      /* =========================
      OVERLAY (bitmap of SVG)
      ======================== */

      const overlayCanvas = document.createElement('canvas')
      overlayCanvas.width = usedWidth
      overlayCanvas.height = usedHeight
      const overlayCtx = overlayCanvas.getContext('2d')

      const svgBlob = new Blob([svgString], { type: 'image/svg+xml' })
      const svgUrl = URL.createObjectURL(svgBlob)

      await new Promise((resolve, reject) => {
        const img = new Image()
        img.onload = () => {
          overlayCtx.drawImage(img, 0, 0)
          URL.revokeObjectURL(svgUrl)
          resolve()
        }
        img.onerror = reject
        img.src = svgUrl
      })

      /* =========================
      MODE: EXPORT PDF
      ========================= */

      if (mode === 'export-pdf') {
        let magnifyOverlay = null

        const magnifyObjects = allObjects.filter((o) => o.class === 'magnifyArea')

        if (magnifyObjects.length > 0) {
          const magnifySvgString = `
            <svg xmlns="http://www.w3.org/2000/svg"
                width="${usedWidth}"
                height="${usedHeight}">
              ${svgDefsString}
              ${magnifyObjects
                .map((obj) => {
                  const attrs = Object.entries(obj.attrs || {})
                    .map(([k, v]) => `${k}="${v}"`)
                    .join(' ')
                  return obj.tag === 'text'
                    ? `<text ${attrs}>${obj.content || ''}</text>`
                    : `<${obj.tag} ${attrs} />`
                })
                .join('\n')}
            </svg>
          `.trim()

          magnifyOverlay = document.createElement('canvas')
          magnifyOverlay.width = usedWidth
          magnifyOverlay.height = usedHeight

          const ctx = magnifyOverlay.getContext('2d')
          const blob = new Blob([magnifySvgString], { type: 'image/svg+xml' })
          const url = URL.createObjectURL(blob)

          await new Promise((resolve, reject) => {
            const img = new Image()
            img.onload = () => {
              ctx.drawImage(img, 0, 0)
              URL.revokeObjectURL(url)
              resolve()
            }
            img.onerror = reject
            img.src = url
          })
        }

        return {
          overlay: overlayCanvas,
          magnifyOverlay,
        }
      }

      /* =========================
      MODE: EXPORT IMAGE
      ========================= */

      if (mode === 'export-image') {
        const imageCanvas = document.createElement('canvas')
        imageCanvas.width = usedWidth
        imageCanvas.height = usedHeight

        const ctx = imageCanvas.getContext('2d')
        ctx.drawImage(this.getRenderedImage({ t, renderCall: true }), 0, 0, usedWidth, usedHeight)
        ctx.drawImage(overlayCanvas, 0, 0)

        return {
          image: imageCanvas,
          overlay: overlayCanvas,
        }
      }

      /* =========================
      MODE: EDITOR
      ========================= */

      if (mode === 'editor') {
        this.svgObjects = []
        this.blurObjects = []
        this.blurImages = []
        this.selectedSvgObjectId = null

        return {
          overlay: overlayCanvas,
        }
      }

      return null
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
      const viewportStore = useViewportStore()

      log('Generating preview with frame...')

      const { finalWidth, finalHeight, targetWidth, targetHeight, offsetX, offsetY } = useFrameTool(
        imageStore,
        historyStore,
        viewportStore,
        t,
      ).calculateFrameLayout(this.newFileDimensions)

      // Rasterize base image + SVG objects at export size
      // await this.rasterize(t, false, targetWidth, targetHeight, true)
      const rasterized = await this.rasterize(
        'export-image',
        {
          width: targetWidth,
          height: targetHeight,
        },
        t,
      )
      const overlay = rasterized?.overlay || null

      const baseImage = rasterized?.image || this.getRenderedImage({ t, renderCall: true })
      if (!baseImage) {
        warn('No base image available for preview generation')
        return
      }

      // If frame is not enabled, just return the base image
      if (!this.frame.enabled) {
        log('Frame not enabled, using base image for preview')

        const mimeType =
          this.newFileFormat === 'jpeg' || this.newFileFormat === 'jpg'
            ? 'image/jpeg'
            : this.newFileFormat === 'webp'
              ? 'image/webp'
              : 'image/png'

        const quality = this.newFileDimensions.quality / 100

        // this.previewUrl = baseImage.toDataURL(mimeType, quality)
        if (renderAsRaster && overlay) {
          // Merge base image + overlay into a new canvas
          const mergeCanvas = document.createElement('canvas')
          mergeCanvas.width = baseImage.width
          mergeCanvas.height = baseImage.height
          const mergeCtx = mergeCanvas.getContext('2d')

          // Draw base first
          mergeCtx.drawImage(baseImage, 0, 0)

          // Draw overlay on top
          mergeCtx.drawImage(overlay, 0, 0)

          this.previewUrl = mergeCanvas.toDataURL(mimeType, quality)
        } else {
          // No overlay, use just base image
          this.previewUrl = baseImage.toDataURL(mimeType, quality)
        }
        return
      }

      log('Generating preview with SVG frame...')

      // Create temporary SVG element and apply frame
      const tempFrameSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
      const { applyFrameRender } = useFrameTool(this, historyStore, viewportStore, t)
      applyFrameRender(tempFrameSvg, targetWidth, targetHeight)

      // If vector export only, store raw SVG frame and exit
      if (!renderAsRaster) {
        // After serializing the SVG
        const rawSvg = new XMLSerializer().serializeToString(tempFrameSvg)

        // Remove any style attribute from the <svg> tag
        const cleanedSvg = rawSvg.replace(/<svg([^>]+)style="[^"]*"([^>]*)>/, '<svg$1$2>')

        this.frameSvg = cleanedSvg

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

      // Create final canvas and render both layers
      const exportCanvas = document.createElement('canvas')
      exportCanvas.width = finalWidth
      exportCanvas.height = finalHeight
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

      if (overlay) {
        warn('Drawing overlay image on top of preview')
        ctx.drawImage(
          overlay,
          0,
          0,
          overlay.width,
          overlay.height,
          offsetX,
          offsetY,
          targetWidth,
          targetHeight,
        )
      }

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
      return (
        this.svgObjects.find((obj) => obj.id === this.selectedSvgObjectId) ||
        this.blurObjects.find((obj) => obj.id === this.selectedSvgObjectId)
      )
    },

    /**
     * Returns the SVG object by its ID
     * @param {number} id - The ID of the SVG object
     * @returns {Object|null} - The SVG object or null if not found
     */
    getSvgObjectById(id) {
      return (
        this.svgObjects.find((obj) => obj.id === id) ||
        this.blurObjects.find((obj) => obj.id === id)
      )
    },

    /**
     * Returns the index of the currently selected SVG object
     * @returns {number} - The index of the currently selected SVG object, or -1 if none is selected
     */
    getIndexOfSelectedSvgObject() {
      return this.svgObjects.findIndex((obj) => obj.id === this.selectedSvgObjectId)
    },

    /**
     * Returns the index of the currently selected blur object
     * @returns {number} - The index of the currently selected blur object, or -1 if none is selected
     */
    getIndexOfSelectedBlurObject() {
      return this.blurObjects.findIndex((obj) => obj.id === this.selectedSvgObjectId)
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
     * Returns the index of a blur object by its ID
     * @param {*} id - The ID of the blur object
     * @returns {number} - The index of the blur object, or -1 if not found
     */
    getIndexOfBlurObjectById(id) {
      return this.blurObjects.findIndex((obj) => obj.id === id)
    },

    /**
     * Deletes SVG definitions, clip paths, filters, and blur images by ID.
     * @param {string} id - The ID to delete
     */
    deleteSvgDefsById(id) {
      this.svgDefs = this.svgDefs.filter((def) => {
        return !def.includes(`id="${id}"`)
      })
    },

    /**
     * Deletes clip path by ID
     * @param {string} id - The ID to delete
     */
    deleteBlurClipById(id) {
      this.deleteSvgDefsById(`clip-${id}`)
    },

    /**
     * Deletes blur filter by ID
     * @param {string} id - The ID to delete
     */
    deleteBlurFilterById(id) {
      this.deleteSvgDefsById(`blur-filter-${id}`)
    },

    /**
     * Deletes blur image by ID
     * @param {string} id - The ID to delete
     */
    deleteBlurImageById(id) {
      this.blurImages = this.blurImages.filter((imgStr) => {
        return !imgStr.includes(`id="blur-image-${id}"`)
      })
    },

    /**
     * Generates the next default name for a new SVG or blur object
     * @param {string} objectClass - The class of the object ('svg', 'blur', or 'magnifyArea')
     * @param {string} objectType - The type/tag of the object (e.g., 'rectangle', 'circle', etc.)
     * @param {Function} t - Translation function (vue-i18n)
     * @returns {string} - The next default name for the new object
     */
    getNextObjectName(objectClass, objectType) {
      // 20 chars as padding
      const paddingText = '--------------------'
      let baseName = ''

      if (objectClass === 'blur') {
        baseName = 'blur'
        return `${paddingText}${baseName}`
      } else {
        if (objectClass === 'magnifyArea') {
          baseName = 'magnifyArea'
          return `${paddingText}${baseName}`
        } else {
          switch (objectType) {
            case 'rectangle':
            case 'rect':
              baseName = 'rectangle'
              break
            case 'ellipse':
              baseName = 'ellipse'
              break
            case 'line':
              baseName = 'line'
              break
            case 'text':
              baseName = 'text'
              break
          }
          return `${paddingText}${baseName}`
        }
      }
    },

    /**
     * Checks if the currently selected SVG object has the highest z-index
     * @returns {boolean} - True if the selected SVG object is the one with the highest z-index
     */
    isMaxZIndexOfSelectedSvgObject() {
      const index = this.getIndexOfSelectedSvgObject()
      if (index >= 0 && this.svgObjects[index]) {
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
     * Checks if the currently selected blur object has the highest z-index
     * @returns {boolean} - True if the selected blur object is the one with the highest z-index
     */
    isMaxZIndexOfSelectedBlurObject() {
      const index = this.getIndexOfSelectedBlurObject()
      if (index >= 0 && this.blurObjects[index]) {
        const selectedObject = this.blurObjects[index]
        if (selectedObject.class === 'magnifyArea') {
          return index === this.blurObjects.length - 2
        } else {
          return index === this.blurObjects.length - 1
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
      return index === 0
    },

    /**
     * Checks if the currently selected blur object has the lowest z-index
     * @returns {boolean} - True if the selected blur object is the one with the lowest z-index
     */
    isMinZIndexOfSelectedBlurObject() {
      const index = this.getIndexOfSelectedBlurObject()
      return index === 0
    },

    // --------------------------------
    // Snapshot management methods
    // --------------------------------
    /**
     * Creates a snapshot of the current image state for history management
     * @returns {object} - Snapshot object representing the current image state
     */
    getSnapshot() {
      return {
        // PIPELINE POSITION
        opIndex: this.renderPipeline.currentOpIndex,

        // IMAGE STATE
        fileType: this.fileType,
        showPdfAsImage: this.showPdfAsImage,
        fileDimensions: JSON.parse(JSON.stringify(this.fileDimensions)),

        // OPERATIONS (SOURCE OF TRUTH)
        // imageOperations: JSON.parse(JSON.stringify(this.imageOperations)),
        imageOperations: this.imageOperations.map((op) => {
          if (op.type === 'backgroundRemoval') {
            return {
              type: 'backgroundRemoval',
              cost: op.cost,
              affectsGeometry: false,
              params: {
                maskBuffer: op.params.mask.buffer.slice(0),
                width: op.params.width,
                height: op.params.height,
                bgColor: { ...op.params.bgColor },
              },
            }
          }

          if (op.type === 'brush') {
            return {
              type: 'brush',
              overlayDataURL: op.overlay.toDataURL(),
              cost: op.cost,
              affectsGeometry: false,
            }
          }

          return structuredClone(op)
        }),

        // SVG / OVERLAY METADATA
        svgObjects: JSON.parse(JSON.stringify(this.svgObjects)),
        blurObjects: JSON.parse(JSON.stringify(this.blurObjects)),
        svgDefs: JSON.parse(JSON.stringify(this.svgDefs)),
        blurImages: JSON.parse(JSON.stringify(this.blurImages)),

        // FRAME
        frame: JSON.parse(JSON.stringify(this.frame)),

        // PDF
        pdfPageBytes: this.pdfPageBytes ? new Uint8Array(this.pdfPageBytes) : undefined,
      }
    },

    /**
     * Applies a previously saved snapshot to restore the image state
     * @param {object} snapshot - Snapshot object to restore
     * @returns {Promise<void>}
     */
    async applySnapshot(snapshot) {
      warn('Applying image store snapshot...')

      this.historyWasChanged = true

      // Restore metadata
      this.fileType = snapshot.fileType
      this.showPdfAsImage = snapshot.showPdfAsImage
      this.fileDimensions = JSON.parse(JSON.stringify(snapshot.fileDimensions))

      // this.imageOperations = JSON.parse(JSON.stringify(snapshot.imageOperations))

      this.imageOperations = []

      for (const op of snapshot.imageOperations) {
        if (op.type === 'backgroundRemoval') {
          this.imageOperations.push({
            type: 'backgroundRemoval',
            cost: op.cost,
            affectsGeometry: false,
            params: {
              mask: new Uint8ClampedArray(op.params.maskBuffer),
              width: op.params.width,
              height: op.params.height,
              bgColor: { ...op.params.bgColor },
            },
          })
          continue
        }

        if (op.type === 'brush') {
          const img = new Image()

          await new Promise((resolve) => {
            img.onload = () => {
              const canvas = document.createElement('canvas')
              canvas.width = img.width
              canvas.height = img.height
              canvas.getContext('2d').drawImage(img, 0, 0)

              this.imageOperations.push({
                type: 'brush',
                overlay: canvas,
                cost: 'low',
                affectsGeometry: false,
              })

              resolve()
            }
            img.src = op.overlayDataURL
          })
        } else {
          this.imageOperations.push(structuredClone(op))
        }
      }

      this.svgObjects = JSON.parse(JSON.stringify(snapshot.svgObjects))
      this.blurObjects = JSON.parse(JSON.stringify(snapshot.blurObjects))
      this.svgDefs = JSON.parse(JSON.stringify(snapshot.svgDefs))
      this.blurImages = JSON.parse(JSON.stringify(snapshot.blurImages))

      this.frame = JSON.parse(JSON.stringify(snapshot.frame))

      this.pdfPageBytes = snapshot.pdfPageBytes ? new Uint8Array(snapshot.pdfPageBytes) : undefined

      this.renderPipeline.currentOpIndex = snapshot.opIndex

      // Reset selected SVG object
      this.selectedSvgObjectId = null
      this.justCreatedSvgObjectId = null
      this.selectedSvgObjectIds = []

      warn('Snapshot applied.')

      // Rendering happens OUTSIDE (undo/redo)
    },

    /**
     * Returns a complete snapshot of the image store state. (for multi-file support)
     *
     * @returns {object} A deep clone of the full image store state.
     */
    getFullSnapshot() {
      return {
        // FILE IDENTITY
        file: this.file,
        fileType: this.fileType,
        fileName: this.fileName,
        fileFormat: this.fileFormat,
        showPdfAsImage: this.showPdfAsImage,

        // BASE STATE (SOURCE IMAGE / PDF)
        baseState: this.renderPipeline.baseState
          ? {
              canvas: this.renderPipeline.baseState.canvas
                ? this.renderPipeline.baseState.canvas.toDataURL()
                : null,
              pdfBytes: this.renderPipeline.baseState.pdfBytes
                ? new Uint8Array(this.renderPipeline.baseState.pdfBytes)
                : null,
            }
          : null,

        // PIPELINE
        imageOperations: this.imageOperations.map((op) => {
          if (op.type === 'backgroundRemoval') {
            return {
              type: 'backgroundRemoval',
              cost: op.cost,
              affectsGeometry: false,
              params: {
                maskBuffer: op.params.mask.buffer.slice(0),
                width: op.params.width,
                height: op.params.height,
                bgColor: { ...op.params.bgColor },
              },
            }
          }

          if (op.type === 'brush') {
            return {
              type: 'brush',
              overlayDataURL: op.overlay.toDataURL(),
              cost: op.cost,
              affectsGeometry: false,
            }
          }

          return structuredClone(op)
        }),

        currentOpIndex: this.renderPipeline.currentOpIndex,

        // DIMENSIONS
        fileDimensions: JSON.parse(JSON.stringify(this.fileDimensions)),

        // SVG / OVERLAYS (LOGICAL, NOT RENDERED)
        svgObjects: JSON.parse(JSON.stringify(this.svgObjects)),
        blurObjects: JSON.parse(JSON.stringify(this.blurObjects)),
        svgDefs: JSON.parse(JSON.stringify(this.svgDefs)),
        blurImages: JSON.parse(JSON.stringify(this.blurImages)),

        // FRAME
        frame: JSON.parse(JSON.stringify(this.frame)),
        frameSvg: this.frameSvg,

        // PDF
        pdfPageBytes: this.pdfPageBytes ? new Uint8Array(this.pdfPageBytes) : null,

        // WARNINGS
        imageWarnings: JSON.parse(JSON.stringify(this.imageWarnings)),
      }
    },

    /**
     * Restores the full image store state from a previously saved snapshot. (for multi-file support)
     *
     * @param {object} snapshot - The full snapshot object previously created by `getFullSnapshot`.
     * @returns {void}
     */
    async applyFullSnapshot(snapshot) {
      // FILE METADATA
      this.file = snapshot.file
      this.fileType = snapshot.fileType
      this.fileName = snapshot.fileName
      this.fileFormat = snapshot.fileFormat
      this.showPdfAsImage = snapshot.showPdfAsImage

      this.fileDimensions = JSON.parse(JSON.stringify(snapshot.fileDimensions))

      // SVG / FRAME
      this.svgObjects = JSON.parse(JSON.stringify(snapshot.svgObjects))
      this.blurObjects = JSON.parse(JSON.stringify(snapshot.blurObjects))
      this.svgDefs = JSON.parse(JSON.stringify(snapshot.svgDefs))
      this.blurImages = JSON.parse(JSON.stringify(snapshot.blurImages))

      this.frame = JSON.parse(JSON.stringify(snapshot.frame))
      this.frameSvg = snapshot.frameSvg

      // PDF
      this.pdfPageBytes = snapshot.pdfPageBytes ? new Uint8Array(snapshot.pdfPageBytes) : null

      // PIPELINE (LOGICAL)
      this.imageOperations = []

      for (const op of snapshot.imageOperations) {
        if (op.type === 'backgroundRemoval') {
          this.imageOperations.push({
            type: 'backgroundRemoval',
            cost: op.cost,
            affectsGeometry: false,
            params: {
              mask: new Uint8ClampedArray(op.params.maskBuffer),
              width: op.params.width,
              height: op.params.height,
              bgColor: { ...op.params.bgColor },
            },
          })
          continue
        }

        if (op.type === 'brush') {
          const img = new Image()

          await new Promise((resolve) => {
            img.onload = () => {
              const canvas = document.createElement('canvas')
              canvas.width = img.width
              canvas.height = img.height
              canvas.getContext('2d').drawImage(img, 0, 0)

              this.imageOperations.push({
                type: 'brush',
                overlay: canvas,
                cost: 'low',
                affectsGeometry: false,
              })

              resolve()
            }
            img.src = op.overlayDataURL
          })
        } else {
          this.imageOperations.push(structuredClone(op))
        }
      }

      // RESET PIPELINE
      this.renderPipeline = {
        baseState: null,
        checkpoints: [],
        currentOpIndex: snapshot.currentOpIndex,
        lastRenderedOpIndex: -1,
      }

      // WAIT FOR BASE CANVAS
      if (snapshot.baseState?.canvas) {
        await new Promise((resolve) => {
          const img = new Image()
          img.onload = () => {
            const canvas = document.createElement('canvas')
            canvas.width = img.width
            canvas.height = img.height
            canvas.getContext('2d').drawImage(img, 0, 0)

            this.renderPipeline.baseState = {
              canvas,
              pdfBytes: snapshot.baseState.pdfBytes
                ? new Uint8Array(snapshot.baseState.pdfBytes)
                : null,
            }

            resolve()
          }
          img.src = snapshot.baseState.canvas
        })
      }

      // Reset selected SVG object
      this.selectedSvgObjectId = null
      this.justCreatedSvgObjectId = null
      this.selectedSvgObjectIds = []
      this.clipboardSvgObject = null

      // WARNINGS
      this.imageWarnings = JSON.parse(JSON.stringify(snapshot.imageWarnings))

      // BACKGROUND REMOVAL CANVASES
      this.removalCanvas = null
      this.removalCanvasOriginal = null
    },
  },
})
