import { ref, nextTick, computed, watch } from 'vue'
// import { useToastModal } from '@/composables/modals/useToastModal'

export function useFileNameDisplay(imageStore, t) {
  const editEnabled = ref(false)
  const fileNameInput = ref(imageStore.fileName)
  // const fileNameInput = computed(() => imageStore.fileName)
  const inputRef = ref(null)

  watch(() => imageStore.fileName, (newName) => {
    fileNameInput.value = newName
  })

  const disabled = computed(() => {
    return !imageStore.isImageLoaded()
  })

  const saveNewFileName = () => {
    editEnabled.value = false

    const success = imageStore.setFileName(fileNameInput.value, t)
    if (success){
      nextTick(() => {
        inputRef.value?.blur()
      })
    }
  }

  const startEditing = () => {
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
    saveNewFileName
  }
}
