import { defineStore } from 'pinia'
import { useToastModal } from '@/composables/modals/useToastModal'

const { showToastModal } = useToastModal()

const isValidFileName = (name) => {
  // Invalid characters: \ / : * ? " < > |
  return !/[\\/:*?"<>|]/.test(name)
}

export const useImageStore = defineStore('imageStore', {
  state: () => ({
    fileName: '',
    file: null,
    previewUrl: '',
    fileType: '', // 'image' or 'pdf'
    fileFormat: '', // 'png', 'jpg', 'jpeg', 'pdf'
    newFileFormat: '', // 'png', 'jpg', 'jpeg', 'pdf'
    fileDimensions: {
      width: 0,
      height: 0,
    },
    newFileDimensions: {
      width: 0,
      height: 0,
    },
    fileSize: 0, // in bytes
  }),
  actions: {
    isImageLoaded() {
      return this.fileName && this.fileName.trim() !== ''
    },

    setFileName(newName, t) {
      // this.fileName = newName.trim()
      const trimmedName = newName.trim()

      // Empty name
      if (trimmedName === '') {
        if (this.file !== null) {
          showToastModal(
            "error",
            t("imageStore.toast.errorEmptyName.title"),
            t("imageStore.toast.errorEmptyName.message")
          )
        }
        return
      }

      // Same name
      if (trimmedName === this.fileName) {
        return
      }

      // Invalid characters
      if (!isValidFileName(trimmedName)) {
        if (this.file !== null) {
          showToastModal(
            "error",
            t("imageStore.toast.errorInvalidCharacters.title"),
            t("imageStore.toast.errorInvalidCharacters.message")
          )
        }
        return
      }

      if (trimmedName !== this.fileName && this.fileName !== '') {
        showToastModal(
          "success",
          t("imageStore.toast.successFileNameUpdated.title"),
          t("imageStore.toast.successFileNameUpdated.message")
        )
      }

      // Update file name
      this.fileName = trimmedName
    },

    closeFile(){
      this.fileName = ''
      this.file = null
      this.previewUrl = ''
      this.fileType = ''
      this.fileFormat = ''
      this.newFileFormat = ''
      this.fileDimensions = {
        width: 0,
        height: 0,
      }
      this.newFileDimensions = {
        width: 0,
        height: 0,
      }
      this.fileSize = 0
    },

    setFile(file, t) {
      this.file = file
      this.setFileName(file.name, t)

      // this.fileName = file.name.trim()
      this.fileFormat = file.name.split('.').pop().toLowerCase()
      this.newFileFormat = this.fileFormat
      this.fileType = file.type.startsWith('image/') ? 'image'
                  : file.type === 'application/pdf' ? 'pdf'
                  : ''

      const reader = new FileReader()

      if (this.fileType === 'image') {
        reader.onload = (e) => {
          this.previewUrl = e.target.result

          const img = new Image()
          img.onload = () => {
            this.fileDimensions.width = img.width
            this.fileDimensions.height = img.height
            this.newFileDimensions.width = this.fileDimensions.width
            this.newFileDimensions.height = this.fileDimensions.height
          }
          img.src = e.target.result
        }
        reader.readAsDataURL(file)
      }else{
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
        "success",
        t("imageStore.toast.successFileUploaded.title"),
        t("imageStore.toast.successFileUploaded.message", { fileName: file.name })
      )
    },

    checkFile(file, t) {
      const supportedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']

      if (!supportedTypes.includes(file.type)) {
        showToastModal(
          "error",
          t("imageStore.toast.errorUnsupportedFileType.title"),
          t("imageStore.toast.errorUnsupportedFileType.message", { fileType: file.type })
        )
        return
      }else{
        this.setFile(file, t)
      }
    },

    saveToImageStore(files, t, router) {
      if (!files) return

      if (files.length > 1){
        showToastModal(
          "error",
          t("imageStore.toast.errorMultipleFiles.title"),
          t("imageStore.toast.errorMultipleFiles.message")
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
  },
})
