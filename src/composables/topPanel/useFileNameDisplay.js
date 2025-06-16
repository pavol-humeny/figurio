import { ref, watch, nextTick } from 'vue'
import { useToastModal } from '@/composables/modals/useToastModal'

export function useFileNameDisplay(imageStore, t) {
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
      showToastModal(
        "error",
        t("topPanel.fileNameDisplay.toast.errorEmptyName.title"),
        t("topPanel.fileNameDisplay.toast.errorEmptyName.message")
      )
      fileNameInput.value = imageStore.fileName // Reset to original name
      return
    }

    if (trimmedName === imageStore.fileName) {
      showToastModal(
        "info",
        t("topPanel.fileNameDisplay.toast.infoSameName.title"),
        t("topPanel.fileNameDisplay.toast.infoSameName.message")
      )
      fileNameInput.value = imageStore.fileName // Reset to original name
      return
    }

    if (!isValidFileName(trimmedName)) {
      showToastModal(
        "error",
        t("topPanel.fileNameDisplay.toast.errorInvalidCharacters.title"),
        t("topPanel.fileNameDisplay.toast.errorInvalidCharacters.message")
      )
      fileNameInput.value = imageStore.fileName // Reset to original name
      return
    }

    showToastModal(
      "success",
      t("topPanel.fileNameDisplay.toast.success.title"),
      t("topPanel.fileNameDisplay.toast.success.message")
    )
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
