import { ref, watch, nextTick } from 'vue'

export function useFileNameDisplay(imageStore) {
  const editEnabled = ref(false)
  const fileNameInput = ref(imageStore.fileName)
  const inputRef = ref(null)

  // Aktualizácia pri zmene v store
  watch(() => imageStore.fileName, (newFileName) => {
    if (!editEnabled.value) {
      fileNameInput.value = newFileName
    }
  })

  const isValidFileName = (name) => {
    // Invalid characters: \ / : * ? " < > |
    return !/[\\/:*?"<>|]/.test(name)
  }

  const saveNewFileName = () => {
    editEnabled.value = false

    const trimmedName = fileNameInput.value.trim()

    if (trimmedName === '') {
      console.warn('File name cannot be empty')
      // TODO handle empty file name
      fileNameInput.value = imageStore.fileName // Reset to original name
      return
    }

    if (trimmedName === imageStore.fileName) {
      console.warn('File name is the same, no changes made')
      fileNameInput.value = imageStore.fileName // Reset to original name
      return
    }

    if (!isValidFileName(trimmedName)) {
      console.warn('Invalid characters in file name')
      fileNameInput.value = imageStore.fileName // Reset to original name
      return
    }
    console.log('Saving new file name:', trimmedName)
    imageStore.setFileName(trimmedName)

  }

  const startEditing = () => {
    editEnabled.value = true
    nextTick(() => {
      inputRef.value?.focus()
    })
  }

  return {
    editEnabled,
    fileNameInput,
    inputRef,
    startEditing,
    saveNewFileName
  }
}
