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
    previewUrl: '',

    fileType: '', // 'image' or 'pdf'
    fileFormat: '', // 'png', 'jpg', 'jpeg', 'pdf'
    newFileFormat: '', // 'png', 'jpg', 'jpeg', 'pdf'

    fileDimensions: {
      fileAspectRatio: 1,
      width: 0,
      height: 0,
    },
    newFileDimensions: {
      fileAspectRatio: 1,
      width: 0,
      height: 0,
    },

    fileSize: 0, // In bytes

    // Value for original image
    originalImage: null,
    // Value for raster image rendering
    renderedImage: null,
    // Value for SVG rendering
    // svgElements: [],
    svgObjects: [
      {
        tag: 'rect',
        attrs: {
          x: 50,
          y: 40,
          width: 200,
          height: 100,
          fill: 'red',
          stroke: 'red',
        },
      },
      {
        tag: 'circle',
        attrs: {
          cx: 300,
          cy: 200,
          r: 50,
          fill: 'blue',
          stroke: 'black',
        },
      },
    ],
    selectedSvgElementId: null,
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

      this.svgElements = []
      this.selectedSvgElementId = null
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

    checkFile(file, t) {
      const supportedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']

      if (!supportedTypes.includes(file.type)) {
        showToastModal(
          'error',
          t('imageStore.toast.errorUnsupportedFileType.title'),
          t('imageStore.toast.errorUnsupportedFileType.message', { fileType: file.type }),
        )
        return
      } else {
        this.setFile(file, t)
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

      this.checkFile(files[0], t)

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
      const link = document.createElement('a')
      link.download = `${this.fileName}.${this.newFileFormat}`
      link.href = this.previewUrl
      link.click()

      showToastModal(
        'success',
        t('imageStore.toast.successFileExported.title'),
        t('imageStore.toast.successFileExported.message', { fileName: this.fileName }),
      )
    },
  },
})
