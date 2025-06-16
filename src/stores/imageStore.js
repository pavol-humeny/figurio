import { defineStore } from 'pinia'

export const useImageStore = defineStore('imageStore', {
  state: () => ({
    fileName: 'untitled',
  }),
  actions: {
    setFileName(newName) {
      this.fileName = newName.trim()
    },
  },
})
