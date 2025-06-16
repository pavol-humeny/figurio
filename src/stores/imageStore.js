import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useImageStore = defineStore('imageStore', () => {
  const fileName = ref('untitled')

  function setFileName(newName) {
    fileName.value = newName.trim()
  }

  return { fileName, setFileName }
})
