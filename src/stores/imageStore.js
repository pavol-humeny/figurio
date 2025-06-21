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
    file: null,

    fileName: '',
    newFileName: '',

    fileType: '', // 'image' or 'pdf'
    fileFormat: '', // 'png', 'jpg', 'jpeg', 'pdf'
    newFileFormat: '', // 'png', 'jpg', 'jpeg', 'pdf'

    fileDimensions: {
      fileAspectRatio: 1,
      width: 0,
      height: 0,
      quality: 100,
    },
    newFileDimensions: {
      fileAspectRatio: 1,
      width: 0,
      height: 0,
      quality: 100,
    },

    fileSize: 0, // In bytes

    // Value for preview image in export tool
    previewUrl: '',
    // Value for original image
    originalImage: null,
    // Value for raster image rendering
    renderedImage: null,
    // Value for SVG rendering
    svgObjects: [],
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
  }),
  actions: {
    isImageLoaded() {
      return this.fileName && this.fileName.trim() !== ''
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
      }
      this.newFileDimensions = {
        fileAspectRatio: 1,
        width: 0,
        height: 0,
      }
      this.fileSize = 0

      this.originalImage = null
      this.renderedImage = null

      this.svgObjects = []
      this.selectedSvgObjectId = null
    },

    setFile(file, t) {
      this.file = file

      this.setFileName(file.name, t)
      this.fileSize = file.size
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

            this.originalImage = img

            // Create a canvas to render the image
            const canvas = document.createElement('canvas')
            canvas.width = img.width
            canvas.height = img.height

            const ctx = canvas.getContext('2d')
            ctx.drawImage(img, 0, 0)

            this.renderedImage = canvas
            this.previewUrl = canvas.toDataURL() // Fallback for export
          }

          img.src = e.target.result
        }

        reader.readAsDataURL(file)
      } else {
        console.error('Unsupported file type:', this.fileType)
      }
      // else if (this.fileType === 'pdf') {
      //   reader.onload = async (e) => {
      //     this.previewUrl = e.target.result

      //     try {
      //       const pdfjsLib = await import('pdfjs-dist/build/pdf')
      //       const pdfWorker = await import('pdfjs-dist/build/pdf.worker.entry')

      //       pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker.default

      //       const loadingTask = pdfjsLib.getDocument({ data: e.target.result })
      //       const pdf = await loadingTask.promise
      //       const page = await pdf.getPage(1)
      //       const viewport = page.getViewport({ scale: 1 })

      //       this.fileDimensions.width = viewport.width
      //       this.fileDimensions.height = viewport.height
      //     } catch (err) {
      //       console.error('Failed to extract PDF dimensions', err)
      //     }
      //   }
      //   reader.readAsArrayBuffer(file)
      // }

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

    exportFile(t) {
      if (!this.renderedImage) return false

      if (this.svgObjects) {
        this.rasterize()
      } else {
        this.previewUrl = this.renderedImage.toDataURL()
      }

      const mimeType =
        this.newFileFormat === 'jpeg' || this.newFileFormat === 'jpg'
          ? 'image/jpeg'
          : this.newFileFormat === 'webp'
            ? 'image/webp'
            : 'image/png'

      // Create canvas and draw the image from previewUrl
      const image = new Image()
      image.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = this.newFileDimensions.width
        canvas.height = this.newFileDimensions.height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height)

        // Export as Blob
        canvas.toBlob(
          (blob) => {
            if (!blob) return
            const blobUrl = URL.createObjectURL(blob)

            const link = document.createElement('a')
            link.href = blobUrl
            link.download = `${this.newFileName}.${this.newFileFormat}`
            link.click()

            URL.revokeObjectURL(blobUrl)

            showToastModal(
              'success',
              t('imageStore.toast.successFileExported.title'),
              t('imageStore.toast.successFileExported.message', {
                fileName: this.fileName,
              }),
            )
          },
          mimeType,
          this.newFileDimensions.quality / 100,
        )
      }

      image.src = this.previewUrl
    },

    async rasterize() {
      if (!this.renderedImage || !this.svgObjects) return

      console.log('Rasterizing image with SVG objects...')

      const width = this.fileDimensions.width
      const height = this.fileDimensions.height

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

      return resultDataUrl
    },
  },
})
