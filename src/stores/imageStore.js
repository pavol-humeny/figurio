import { defineStore } from 'pinia'
import { useToastModal } from '@/composables/modals/useToastModal'

const { showToastModal } = useToastModal()

export const useImageStore = defineStore('imageStore', {
  state: () => ({
    fileName: '',
    file: null,
    previewUrl: '',
    fileType: '', // 'image' or 'pdf'
  }),
  actions: {
    isImageLoaded() {
      return this.fileName && this.fileName.trim() !== ''
    },

    setFileName(newName) {
      this.fileName = newName.trim()
    },

    closeFile(){
      this.setFileName('')
      this.file = null
      this.previewUrl = ''
      this.fileType = ''
    },

    setFile(file, t) {
      this.file = file
      this.setFileName(file.name)

      if (file.type.startsWith('image/')) {
        this.fileType = 'image'
        const reader = new FileReader()
        reader.onload = (e) => {
          this.previewUrl = e.target.result
        }
        reader.readAsDataURL(file)
      }
      else if (file.type === 'application/pdf') {
        // TODO - implement PDF storing logic
        this.fileType = 'pdf'
        const reader = new FileReader()
        reader.onload = (e) => {
          this.previewUrl = e.target.result
        }
        reader.readAsDataURL(file)
      }

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
