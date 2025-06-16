import { ref, watch, nextTick } from 'vue'
import { useToastModal } from '@/composables/modals/useToastModal'

export function useFileNameDisplay(imageStore) {
  const editEnabled = ref(false)
  const fileNameInput = ref(imageStore.fileName)
  const inputRef = ref(null)

  const { showToastModal } = useToastModal()

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
      showToastModal("error", "Error", "File name cannot be empty")
      fileNameInput.value = imageStore.fileName // Reset to original name
      return
    }

    if (trimmedName === imageStore.fileName) {
      showToastModal("info", "Info", "File name is the same, no changes made")
      fileNameInput.value = imageStore.fileName // Reset to original name
      return
    }

    if (!isValidFileName(trimmedName)) {
      showToastModal("error", "Error", "File name contains invalid characters")
      fileNameInput.value = imageStore.fileName // Reset to original name
      return
    }

    showToastModal("success", "Success", "File name updated successfully")
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
