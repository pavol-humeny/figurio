import { defineStore } from 'pinia'

export const useImageStore = defineStore('imageStore', {
  state: () => ({
    fileName: 'asd',
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
      // TODO - Additional logic to handle closing the file can be added here
    },

    uploadFile() {
      // TODO - Logic to handle file upload can be added here
      this.setFileName('name-of-uploaded-file')
      console.warn('File upload logic not implemented yet.')
    },
  },
})
