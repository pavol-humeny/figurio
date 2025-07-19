import jsPDF from 'jspdf'
import { svg2pdf } from 'svg2pdf.js'
import { defineStore } from 'pinia'
import { useToastModal } from '@/composables/modals/useToastModal'
import { nextTick } from 'vue'
import { useHistoryStore } from './historyStore'
import { useFrameTool } from '@/composables/tools/useFrameTool'
import { useWorkspaceStore } from './workspaceStore'

const { showToastModal } = useToastModal()

const isValidFileName = (name) => {
  // Invalid characters: \ / : * ? " < > |
  return !/[\\/:*?"<>|]/.test(name)
}

export const useImageStore = defineStore('imageStore', {
  state: () => ({
    file: null,
    fileType: '', // 'image' or 'pdf'

    fileName: '', // UndoRedo
    fileFormat: '', // 'png', 'jpg', 'jpeg', 'pdf'
    fileDimensions: {
      fileAspectRatio: 1,
      width: 0,
      height: 0,
      quality: 100,
    }, // UndoRedo

    // New values used for export
    newFileName: '',
    newFileFormat: '', // 'png', 'jpg', 'jpeg', 'pdf'
    newFileDimensions: {
      fileAspectRatio: 1,
      width: 0,
      height: 0,
      quality: 100,
    },

    // Value for preview image in export tool
    previewUrl: '', // UndoRedo

    // Value for original image
    originalImage: null,
    originalFileDimensions: {
      fileAspectRatio: 1,
      width: 0,
      height: 0,
      quality: 100,
    },

    // Value for raster image rendering
    renderedImage: null, // UndoRedo
    tmpRenderedImage: null, // Temporary value for saving canvas if frame with rounded corners is applied

    newRenderedImage: null, // Used for rasterizing SVG objects before export

    // Value for SVG rendering
    svgObjects: [], // UndoRedo
    // svgObjects: [
    //   {
    //     tag: 'rect',
    //     attrs: {
    //       x: 50,
    //       y: 40,
    //       width: 200,
    //       height: 100,
    //       fill: 'red',
    //       stroke: 'red',
    //     },
    //   },
    //   {
    //     tag: 'circle',
    //     attrs: {
    //       cx: 300,
    //       cy: 200,
    //       r: 50,
    //       fill: 'blue',
    //       stroke: 'black',
    //     },
    //   },
    // ],
    selectedSvgObjectId: null,

    imageOperations: [],
    // imageOperations: [
    // {'grayscale': {'enabled': true}},
    // {'crop': {'x': 50, 'y': 50, 'width': 200, 'height': 200}}
    // ]

    frame: {
      enabled: false,
      type: 'none',
      width: 0,
      height: 0,
      color: '#000000',
      headerSize: 0, // Size of the header for browser frames
      footerSize: 0, // Size of the footer for windows frame
      outlineEnabled: false, // Whether to draw an outline around the frame
    },
    frameSvg: '', // Raw SVG frame for vector export

    phoneButtonsCanNotBeDrawnToastFlag: false,
  }),
  getters: {
    isImageLoaded: (state) => {
      return state.file !== null
    },
  },
  actions: {
    // Setters
    setRenderedImage(image, onlyOriginal = false) {
      this.renderedImage = image
      if (!onlyOriginal) {
        this.tmpRenderedImage = image
      }
    },

    // Getters
    getRenderedImage(renderCall = false) {
      if (renderCall) {
        // UPDATE new frame type
        if (
          this.frame.enabled &&
          (this.frame.type === 'framePhoneIOS' ||
            this.frame.type === 'framePhoneIOS2' ||
            this.frame.type === 'framePhoneAndroid' ||
            this.frame.type === 'framePhoneAndroid2' ||
            this.frame.type === 'framePhoneSimple')
        ) {
          return this.renderedImage
        } else {
          return this.tmpRenderedImage
        }
      } else {
        return this.tmpRenderedImage
      }
    },

    resetRenderedImageToOriginal() {
      if (this.originalImage) {
        this.setRenderedImage(this.originalImage)
        this.fileDimensions = { ...this.originalFileDimensions }
      }
    },

    hasGrayscaleOperation() {
      return this.imageOperations.some((op) => op.type === 'grayscale')
    },
    addImageOperation(operation) {
      this.imageOperations.push(structuredClone(operation))
    },

    getImageOperations() {
      return JSON.parse(JSON.stringify(this.imageOperations))
    },

    getImageFrame() {
      return JSON.parse(JSON.stringify(this.frame))
    },

    resetImageOperations() {
      this.imageOperations = []
    },

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
      }
    },

    setFileName({ name, t, isNewFileName = false, updateInWorkspace = true }) {
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

      // // Same name
      // if (trimmedName === this.fileName) {
      //   const tmp = this.fileName
      //   this.fileName = ''
      //   this.newFileName = ''
      //   nextTick(() => {
      //     this.fileName = tmp // Reset to previous name
      //     this.newFileName = tmp
      //   })
      //   return true
      // }

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

      if (trimmedName !== this.fileName && this.fileName !== '' && !isNewFileName) {
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
      if (isNewFileName) {
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

    closeFile() {
      this.fileName = ''
      this.newFileName = ''
      this.file = null
      this.previewUrl = ''
      this.fileType = ''
      this.fileFormat = ''
      this.newFileFormat = ''
      this.fileDimensions = {
        fileAspectRatio: 1,
        width: 0,
        height: 0,
        quality: 100,
      }
      this.newFileDimensions = {
        fileAspectRatio: 1,
        width: 0,
        height: 0,
        quality: 100,
      }
      this.originalFileDimensions = {
        fileAspectRatio: 1,
        width: 0,
        height: 0,
        quality: 100,
      }

      this.originalImage = null
      this.setRenderedImage(null)

      this.svgObjects = []
      this.selectedSvgObjectId = null

      this.resetImageOperations()
      this.resetFrame()

      const historyStore = useHistoryStore()
      historyStore.reset()
    },

    setFile(file, t) {
      this.file = file

      this.setFileName({ name: file.name, t, updateInWorkspace: false }) // Set file name without updating workspace because there might not be a tab yet
      this.fileFormat = file.name.split('.').pop().toLowerCase()
      this.newFileFormat = this.fileFormat
      this.fileType = file.type.startsWith('image/')
        ? 'image'
        : file.type === 'application/pdf'
          ? 'pdf'
          : ''

      const reader = new FileReader()

      if (this.fileType.startsWith('image')) {
        reader.onload = (event) => {
          const img = new Image()
          img.onload = () => {
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

            console.log('file name: ', this.fileName, 'file dimensions: ', this.fileDimensions)
            const workspaceStore = useWorkspaceStore()
            workspaceStore.addNewTab(this.fileName)
          }

          img.src = event.target.result
        }

        reader.readAsDataURL(file)
      } else {
        console.error('Unsupported file type:', this.fileType)
      }

      showToastModal(
        'success',
        t('imageStore.toast.successFileUploaded.title'),
        t('imageStore.toast.successFileUploaded.message', { fileName: file.name }),
      )
    },

    checkFile(file) {
      const supportedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']

      if (!supportedTypes.includes(file.type)) {
        return false
      } else {
        return true
      }
    },

    saveToImageStore(files, t, router) {
      if (!files) return

      if (files.length > 1) {
        showToastModal(
          'error',
          t('imageStore.toast.errorMultipleFiles.title'),
          t('imageStore.toast.errorMultipleFiles.message'),
        )
        return
      }

      if (this.checkFile(files[0])) {
        this.setFile(files[0], t)
      } else {
        showToastModal(
          'error',
          t('imageStore.toast.errorUnsupportedFileType.title'),
          t('imageStore.toast.errorUnsupportedFileType.message', { fileType: files[0].type }),
        )
      }

      if (router.currentRoute.value.name !== 'editor') {
        router.push({ name: 'editor' })
      }
    },

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

    async exportFile(editorStore, historyStore, t) {
      if (!this.getRenderedImage(true)) return false

      console.log('Exporting file...')

      const { width, height, quality } = this.newFileDimensions
      const isPdf = this.newFileFormat === 'pdf'
      const isSvg = this.newFileFormat === 'svg'

      await this.generatePreview(editorStore, historyStore, t, !isPdf && !isSvg)

      if (isSvg) {
        await this.exportAsSvg(width, height, t)
        return true
      }

      const image = new Image()
      image.onload = async () => {
        if (isPdf) {
          await this.exportAsPdf(image, width, height)
        } else {
          await this.exportAsRaster(image, width, height, quality)
        }

        showToastModal(
          'success',
          t('imageStore.toast.successFileExported.title'),
          t('imageStore.toast.successFileExported.message', {
            fileName: this.newFileName,
          }),
        )
      }

      image.src = isPdf ? this.getRenderedImage(true).toDataURL() : this.previewUrl

      return true
    },

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

    async exportAsPdf(image, width, height) {
      const offsetX = this.frame.enabled ? this.frame.width : 0
      let offsetY = this.frame.enabled ? this.frame.height : 0

      const finalWidth = width
      const finalHeight = height

      // Correction for frame header/footer
      if (this.frame.type === 'frameMacBrowser' || this.frame.type === 'frameWindowsBrowser') {
        offsetY = this.frame.headerSize
      }

      // Initialize jsPDF with correct orientation and size
      const pdf = new jsPDF({
        orientation: finalWidth > finalHeight ? 'landscape' : 'portrait',
        unit: 'px', // používame px kvôli SVG pozíciám
        format: [finalWidth, finalHeight],
      })

      // === 1. Render base image into PDF ===
      pdf.addImage(image, 'PNG', offsetX, offsetY, image.width, image.height)

      // === 2. Add svg objects if any ===
      if (this.svgObjects.length > 0) {
        const svgString = `
              <svg xmlns="http://www.w3.org/2000/svg" width="${finalWidth}" height="${finalHeight}">
                <g transform="translate(${offsetX}, ${offsetY})">
                  ${this.svgObjects
                    .map((obj) => {
                      const attrs = Object.entries(obj.attrs || {})
                        .map(([key, val]) => `${key}="${val}"`)
                        .join(' ')
                      return `<${obj.tag} ${attrs} />`
                    })
                    .join('\n')}
                </g>
              </svg>
            `.trim()

        try {
          const svgElement = new DOMParser().parseFromString(
            svgString,
            'image/svg+xml',
          ).documentElement
          await svg2pdf(svgElement, pdf, {
            xOffset: 0,
            yOffset: 0,
            scale: 1,
          })
        } catch (e) {
          console.error('Error during svgObjects export to PDF:', e)
        }
      }

      // === 3. Add frame SVG if enabled ===
      if (this.frame.enabled && this.frameSvg) {
        try {
          const parser = new DOMParser()
          const svgElement = parser.parseFromString(this.frameSvg, 'image/svg+xml').documentElement

          await svg2pdf(svgElement, pdf, {
            xOffset: 0,
            yOffset: 0,
            scale: 1,
          })
        } catch (e) {
          console.error('Error during frame SVG export to PDF:', e)
        }
      }

      // Set file name and save PDF
      pdf.save(`${this.newFileName}.pdf`)
    },

    async exportAsSvg(width, height, t) {
      const offsetX = this.frame.enabled ? this.frame.width : 0
      let offsetY = this.frame.enabled ? this.frame.height : 0

      if (this.frame.type === 'frameMacBrowser' || this.frame.type === 'frameWindowsBrowser') {
        offsetY = this.frame.headerSize
      }

      const renderedImage = this.getRenderedImage(true)
      if (!renderedImage) {
        console.warn('No image to export as SVG')
        return
      }

      const imageDataUrl = renderedImage.toDataURL()
      const imageTag = `<image href="${imageDataUrl}" x="${offsetX}" y="${offsetY}" width="${renderedImage.width}" height="${renderedImage.height}" />`

      const svgObjectsTag = this.svgObjects
        .map((obj) => {
          const attrs = Object.entries(obj.attrs || {})
            .map(([k, v]) => `${k}="${v}"`)
            .join(' ')
          return `<${obj.tag} ${attrs} />`
        })
        .join('\n')

      let cleanedFrameSvg = (this.frameSvg || '')
        .replace(/<\/svg>/g, '')
        .replace(/<svg[^>]*>/g, '')
        .trim()

      const svgContent = `
        <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
          ${imageTag}
          <g transform="translate(${offsetX}, ${offsetY})">
            ${svgObjectsTag}
          </g>
          ${cleanedFrameSvg}
        </svg>
      `.trim()

      const blob = new Blob([svgContent], { type: 'image/svg+xml' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${this.newFileName}.svg`
      link.click()
      URL.revokeObjectURL(url)

      showToastModal(
        'success',
        t('imageStore.toast.successFileExported.title'),
        t('imageStore.toast.successFileExported.message', {
          fileName: this.newFileName,
        }),
      )
    },

    async rasterize(width = null, height = null, storeAsNew = false) {
      if (this.svgObjects.length === 0) return

      console.log('Rasterizing image with SVG objects...')

      // Determine target dimensions
      const usedWidth = width ?? this.fileDimensions.width
      const usedHeight = height ?? this.fileDimensions.height

      // Create SVG markup from svgObjects
      const svgString = `
        <svg xmlns="http://www.w3.org/2000/svg" width="${usedWidth}" height="${usedHeight}">
          ${this.svgObjects
            .map((obj) => {
              const attrs = Object.entries(obj.attrs || {})
                .map(([key, val]) => `${key}="${val}"`)
                .join(' ')
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
      ctx.drawImage(this.getRenderedImage(true), 0, 0, usedWidth, usedHeight)

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

        // Clear svg values
        this.svgObjects = []
        this.selectedSvgObjectId = null
      }
    },

    async generatePreview(editorStore, historyStore, t, renderAsRaster = true) {
      console.log('Generating preview with frame...')
      this.phoneButtonsCanNotBeDrawnToastFlag = true // Set flag to prevent toast showing

      const targetWidth = this.frame.enabled
        ? this.newFileDimensions.width - 2 * this.frame.width
        : this.newFileDimensions.width
      let targetHeight = this.frame.enabled
        ? this.newFileDimensions.height - 2 * this.frame.height
        : this.newFileDimensions.height

      // UPDATE new frame type
      if (this.frame.type === 'frameMacBrowser' || this.frame.type === 'frameWindowsBrowser') {
        targetHeight = this.newFileDimensions.height - this.frame.headerSize - this.frame.height
      } else if (this.frame.type === 'frameWindowsTaskBar') {
        targetHeight = this.newFileDimensions.height - this.frame.footerSize - this.frame.height
      }

      // Rasterize base image + SVG objects at export size
      await this.rasterize(targetWidth, targetHeight, true)

      const baseImage = this.newRenderedImage || this.getRenderedImage(true)
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

      // UPDATE new frame type
      if (this.frame.type === 'frameMacBrowser' || this.frame.type === 'frameWindowsBrowser') {
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

    // UndoRedo
    getSnapshot() {
      const snapshot = {
        fileName: this.fileName,
        fileDimensions: JSON.parse(JSON.stringify(this.fileDimensions)),
        // originalFileDimensions: JSON.parse(JSON.stringify(this.originalFileDimensions)),
        previewUrl: this.previewUrl,
        renderedImage: this.getRenderedImage(true)?.toDataURL() || null,
        // originalImage: this.originalImage?.toDataURL() || null,
        svgObjects: JSON.parse(JSON.stringify(this.svgObjects)),
        imageOperations: JSON.parse(JSON.stringify(this.imageOperations)),
        frame: JSON.parse(JSON.stringify(this.frame)),
      }

      console.log('[getSnapshot] imageOperations:', snapshot.imageOperations)

      return snapshot
    },
    applySnapshot(snapshot) {
      this.fileName = snapshot.fileName
      this.fileDimensions = JSON.parse(JSON.stringify(snapshot.fileDimensions))
      // this.originalFileDimensions = JSON.parse(JSON.stringify(snapshot.fileDimensions))
      this.previewUrl = snapshot.previewUrl
      this.svgObjects = JSON.parse(JSON.stringify(snapshot.svgObjects))
      this.imageOperations = JSON.parse(JSON.stringify(snapshot.imageOperations))
      this.frame = JSON.parse(JSON.stringify(snapshot.frame))

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

      // if (snapshot.originalImage) {
      //   const img = new Image()
      //   img.onload = () => {
      //     const canvas = document.createElement('canvas')
      //     canvas.width = img.width
      //     canvas.height = img.height
      //     const ctx = canvas.getContext('2d')
      //     ctx.drawImage(img, 0, 0)
      //     this.originalImage = canvas
      //   }
      //   img.src = snapshot.originalImage
      // } else {
      //   this.originalImage = null
      // }

      console.log('[applySnapshot] imageOperations (after apply):', this.imageOperations)
    },

    getFullSnapshot() {
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

        renderedImage: this.getRenderedImage(true)?.toDataURL() || null,
        tmpRenderedImage: this.tmpRenderedImage?.toDataURL() || null,
        newRenderedImage: this.newRenderedImage?.toDataURL() || null,

        svgObjects: JSON.parse(JSON.stringify(this.svgObjects)),
        selectedSvgObjectId: this.selectedSvgObjectId,

        imageOperations: JSON.parse(JSON.stringify(this.imageOperations)),

        frame: JSON.parse(JSON.stringify(this.frame)),
        frameSvg: this.frameSvg,

        phoneButtonsCanNotBeDrawnToastFlag: this.phoneButtonsCanNotBeDrawnToastFlag,
      }
    },
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
      this.selectedSvgObjectId = snapshot.selectedSvgObjectId

      this.imageOperations = JSON.parse(JSON.stringify(snapshot.imageOperations))

      this.frame = JSON.parse(JSON.stringify(snapshot.frame))
      this.frameSvg = snapshot.frameSvg

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
