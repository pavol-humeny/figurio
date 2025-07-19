import { ref, nextTick, computed, watch } from 'vue'

const inputRef = ref(null)

export function useFileNameDisplay(imageStore, t) {
  const editEnabled = ref(false)
  const fileNameInput = ref(imageStore.fileName)

  watch(
    () => imageStore.fileName,
    (newName) => {
      fileNameInput.value = newName
    },
  )

  const disabled = computed(() => !imageStore.isImageLoaded)

  const saveNewFileName = () => {
    editEnabled.value = false

    // If file name hasn't changed, just blur the input
    if (imageStore.fileName === fileNameInput.value) {
      nextTick(() => {
        inputRef.value?.blur()
      })
      return
    }

    const success = imageStore.setFileName({ name: fileNameInput.value, t })
    if (success) {
      nextTick(() => {
        inputRef.value?.blur()
      })
    }
  }

  const startEditing = () => {
    if (!imageStore.isImageLoaded) return

    editEnabled.value = true
    nextTick(() => {
      inputRef.value?.focus()
    })
  }

  return {
    editEnabled,
    disabled,
    fileNameInput,
    inputRef,
    startEditing,
    saveNewFileName,
  }
}
