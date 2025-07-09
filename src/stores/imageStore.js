import jsPDF from 'jspdf'
import { defineStore } from 'pinia'
import { useToastModal } from '@/composables/modals/useToastModal'
import { nextTick } from 'vue'
import { useHistoryStore } from './historyStore'

const { showToastModal } = useToastModal()

const isValidFileName = (name) => {
  // Invalid characters: \ / : * ? " < > |
  return !/[\\/:*?"<>|]/.test(name)
}

export const useImageStore = defineStore('imageStore', {
  state: () => ({
    historyRestore: false,
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
    // tmpRenderedImage: null, // Temporary value for saving changes before applying crop in frame tool
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
    // {'crop': {'x': 50, 'y': 50, 'width': 200, 'height': 200}},

    frame: {
      enabled: false,
      type: 'none',
      width: 0,
      height: 0,
      color: '#000000',
      headerSize: 0, // Size of the header for browser frames
      outlineEnabled: false, // Whether to draw an outline around the frame
    },
  }),
  getters: {
    isImageLoaded: (state) => {
      return state.file !== null
    },
  },
  actions: {
    // initWatchers() {
    //   this.$subscribe((mutation, state) => {
    //     if (mutation.events.some((e) => e.key === 'renderedImage')) {
    //       this.tmpRenderedImage = state.renderedImage
    //       console.log('[ImageStore] tmpRenderedImage synchronized with renderedImage')
    //     }
    //   })
    // },
    resetRenderedImageToOriginal() {
      if (this.originalImage) {
        this.renderedImage = this.originalImage
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
        outlineEnabled: false, // Whether to draw an outline around the frame
      }
    },

    setFileName(newName, t, isNewFileName = false) {
      let trimmedName = newName.trim()

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

      // Same name
      if (trimmedName === this.fileName) {
        const tmp = this.fileName
        this.fileName = ''
        this.newFileName = ''
        nextTick(() => {
          this.fileName = tmp // Reset to previous name
          this.newFileName = tmp
        })
        return true
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
      this.renderedImage = null

      this.svgObjects = []
      this.selectedSvgObjectId = null

      this.resetImageOperations()
      this.resetFrame()

      const historyStore = useHistoryStore()
      historyStore.reset()
    },

    setFile(file, t) {
      this.file = file

      this.setFileName(file.name, t)
      this.fileFormat = file.name.split('.').pop().toLowerCase()
      this.newFileFormat = this.fileFormat
      this.fileType = file.type.startsWith('image/')
        ? 'image'
        : file.type === 'application/pdf'
          ? 'pdf'
          : ''

      const reader = new FileReader()

      if (this.fileType.startsWith('image')) {
        reader.onload = (e) => {
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

            this.renderedImage = canvas
            this.originalImage = canvas
            this.previewUrl = canvas.toDataURL() // Fallback for export
          }

          img.src = e.target.result
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

    async exportFile(t) {
      if (!this.renderedImage) return false

      console.log('Exporting file...')

      await this.generatePreviewWithFrame()

      const isPdf = this.newFileFormat === 'pdf'

      const image = new Image()
      image.onload = () => {
        const { width, height, quality } = this.newFileDimensions

        if (isPdf) {
          // Conversion of px to mm (1 px = 0.264583 mm)
          const mmWidth = width * 0.264583
          const mmHeight = height * 0.264583

          const pdf = new jsPDF({
            orientation: mmWidth > mmHeight ? 'landscape' : 'portrait',
            unit: 'mm',
            format: [mmWidth, mmHeight],
          })

          pdf.addImage(image, 'PNG', 0, 0, mmWidth, mmHeight)
          pdf.save(`${this.newFileName}.pdf`)
        } else {
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

          // this.applyEffectsToContext(ctx, canvas)

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
        }

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

    async rasterize() {
      if (!this.renderedImage || this.svgObjects.length === 0) return

      console.log('Rasterizing image with SVG objects...')

      let width = 0
      let height = 0
      if (this.frame?.enabled) {
        // Apply frame dimensions to the rasterization
        width = this.frame.width * 2 + this.fileDimensions.width
        height = this.frame.height * 2 + this.fileDimensions.height
      } else {
        // Use original dimensions
        width = this.fileDimensions.width
        height = this.fileDimensions.height
      }

      // Create SVG string from svgObjects
      const svgString = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
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

      // Create a Blob from the SVG string
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml' })
      const svgUrl = URL.createObjectURL(svgBlob)

      // Create a canvas
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')

      // Draw the rendered image on the canvas
      ctx.drawImage(this.renderedImage, 0, 0)

      // Convert SVG to Image and draw it on the canvas
      await new Promise((resolve, reject) => {
        const img = new Image()
        img.onload = () => {
          ctx.drawImage(img, 0, 0)
          URL.revokeObjectURL(svgUrl)
          resolve()
        }
        img.onerror = (e) => {
          console.error('Error during image loading', e)
          reject(e)
        }
        img.src = svgUrl
      })

      // Result - base64
      const resultDataUrl = canvas.toDataURL()
      // this.previewUrl = resultDataUrl

      // Reset svg elements
      this.svgObjects = []
      this.selectedSvgObjectId = null

      this.renderedImage = canvas
      // this.originalImage = canvas
      this.previewUrl = resultDataUrl

      return resultDataUrl
    },

    async generatePreviewWithFrame() {
      await this.rasterize()

      console.log('Generating preview with SVG frame...')

      const imageCanvas = document.querySelector('.image-canvas')
      const frameSvg = document.querySelector('.frame-svg')

      if (!frameSvg || !imageCanvas) {
        console.warn('Missing SVG or image canvas')
        return
      }

      const svgWidth = parseInt(frameSvg.getAttribute('width'), 10)
      const svgHeight = parseInt(frameSvg.getAttribute('height'), 10)

      // Create SVG string from the frame SVG element
      const svgString = new XMLSerializer().serializeToString(frameSvg)
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
      const url = URL.createObjectURL(svgBlob)

      const svgImage = await new Promise((resolve) => {
        const img = new Image()
        img.onload = () => {
          URL.revokeObjectURL(url)
          resolve(img)
        }
        img.src = url
      })

      // Create canvas
      const exportCanvas = document.createElement('canvas')
      exportCanvas.width = svgWidth
      exportCanvas.height = svgHeight
      const ctx = exportCanvas.getContext('2d')

      const frameWidth = this.frame?.width || 0
      let frameHeight = this.frame?.height || frameWidth

      // UPDATE new frame type
      if (this.frame.type === 'frameMacBrowser' || this.frame.type === 'frameWindowsBrowser') {
        frameHeight = this.frame.headerSize
      }

      // Draw the original image
      ctx.drawImage(imageCanvas, frameWidth, frameHeight)

      // Draw the SVG frame
      ctx.drawImage(svgImage, 0, 0)

      this.previewUrl = exportCanvas.toDataURL()
    },

    // UndoRedo
    getSnapshot() {
      const snapshot = {
        fileName: this.fileName,
        fileDimensions: JSON.parse(JSON.stringify(this.fileDimensions)),
        // originalFileDimensions: JSON.parse(JSON.stringify(this.originalFileDimensions)),
        previewUrl: this.previewUrl,
        renderedImage: this.renderedImage?.toDataURL() || null,
        // originalImage: this.originalImage?.toDataURL() || null,
        svgObjects: JSON.parse(JSON.stringify(this.svgObjects)),
        imageOperations: JSON.parse(JSON.stringify(this.imageOperations)),
        frame: JSON.parse(JSON.stringify(this.frame)),
      }

      console.log('[getSnapshot] imageOperations:', snapshot.imageOperations)

      return snapshot
    },
    applySnapshot(snapshot) {
      this.historyRestore = true

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
          this.renderedImage = canvas
        }
        img.src = snapshot.renderedImage
      } else {
        this.renderedImage = null
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
  },
})
