import jsPDF from 'jspdf'
import { defineStore } from 'pinia'
import { useToastModal } from '@/composables/modals/useToastModal'
import { nextTick } from 'vue'

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

    imageOperations: {
      transformations: {
        rotationAngle: 0, // In degrees
        flipHorizontal: false,
        flipVertical: false,
        cropBox: null, // { x: 0, y: 0, width: 0, height: 0 }
      },
      smartCrop: {
        enabled: false,
      },
      frame: {
        enabled: false,
        color: '#000000',
        width: 0,
        height: 0,
        type: 'solid',
      },
    },
  }),
  getters: {
    isImageLoaded: (state) => {
      return state.file !== null
    },
  },
  actions: {
    setImageOperations(operations) {
      this.imageOperations = {
        transformations: {
          rotationAngle: operations.transformations?.rotationAngle || 0,
          flipHorizontal: operations.transformations?.flipHorizontal || false,
          flipVertical: operations.transformations?.flipVertical || false,
          cropBox: null, // vždy resetuj pri aplikácii
        },
        smartCrop: {
          enabled: operations.smartCrop?.enabled || false,
        },
        frame: {
          enabled: operations.frame?.enabled || false,
          color: operations.frame?.color || '#000000',
          width: operations.frame?.width || 0,
          height: operations.frame?.height || operations.frame?.width || 0,
          type: operations.frame?.type || 'solid',
        },
      }
    },

    getImageOperations() {
      return JSON.parse(JSON.stringify(this.imageOperations))
    },

    resetImageOperations() {
      this.imageOperations = {
        transformations: {
          rotationAngle: 0, // In degrees
          flipHorizontal: false,
          flipVertical: false,
          cropBox: null, // { x: 0, y: 0, width: 0, height: 0 }
        },
        smartCrop: {
          enabled: false,
        },
        frame: {
          enabled: false,
          color: '#000000',
          width: 0,
          height: 0,
          type: 'solid',
        },
      }
    },

    getTransformations() {
      return JSON.parse(JSON.stringify(this.imageOperations.transformations))
    },

    setFileName(newName, t, isNewFileName = false) {
      // this.fileName = newName.trim()
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
      if (this.imageOperations.frame?.enabled) {
        // Apply frame dimensions to the rasterization
        width = this.imageOperations.frame.width * 2 + this.fileDimensions.width
        height = this.imageOperations.frame.height * 2 + this.fileDimensions.height
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

      const frameCanvas = document.querySelector('.frame-canvas')
      const imageCanvas = document.querySelector('.image-canvas')

      if (!frameCanvas || !imageCanvas) {
        console.warn('Canvases not found')
        return
      }

      // Create a new canvas for the preview
      const exportCanvas = document.createElement('canvas')
      exportCanvas.width = frameCanvas.width
      exportCanvas.height = frameCanvas.height
      const ctx = exportCanvas.getContext('2d')

      // Draw frame
      ctx.drawImage(frameCanvas, 0, 0)

      // Draw image
      const frameWidth = this.imageOperations.frame?.width || 0
      ctx.drawImage(imageCanvas, frameWidth, frameWidth)

      // Save to previewUrl
      this.previewUrl = exportCanvas.toDataURL()
    },

    // UndoRedo
    getSnapshot() {
      const snapshot = {
        fileName: this.fileName,
        fileDimensions: JSON.parse(JSON.stringify(this.fileDimensions)),
        originalFileDimensions: JSON.parse(JSON.stringify(this.originalFileDimensions)),
        previewUrl: this.previewUrl,
        // renderedImage: this.renderedImage?.toDataURL() || null,
        originalImage: this.originalImage?.toDataURL() || null,
        svgObjects: JSON.parse(JSON.stringify(this.svgObjects)),
        imageOperations: JSON.parse(JSON.stringify(this.imageOperations)),
      }

      console.log('[getSnapshot] imageOperations:', snapshot.imageOperations)

      return snapshot
    },
    applySnapshot(snapshot) {
      this.historyRestore = true

      this.fileName = snapshot.fileName
      this.fileDimensions = JSON.parse(JSON.stringify(snapshot.fileDimensions))
      this.originalFileDimensions = JSON.parse(JSON.stringify(snapshot.fileDimensions))
      this.previewUrl = snapshot.previewUrl
      this.svgObjects = JSON.parse(JSON.stringify(snapshot.svgObjects))
      this.imageOperations = JSON.parse(JSON.stringify(snapshot.imageOperations))

      // if (snapshot.renderedImage) {
      //   const img = new Image()
      //   img.onload = () => {
      //     const canvas = document.createElement('canvas')
      //     canvas.width = img.width
      //     canvas.height = img.height
      //     const ctx = canvas.getContext('2d')
      //     ctx.drawImage(img, 0, 0)
      //     this.renderedImage = canvas
      //   }
      //   img.src = snapshot.renderedImage
      // } else {
      //   this.renderedImage = null
      // }

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

      console.log('[applySnapshot] imageOperations (after apply):', this.imageOperations)
    },
  },
})
