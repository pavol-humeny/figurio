/**
 * @file: useFileNameDisplay.js
 * @author: Pavol Humeny
 * @date: 15.5.2026
 * @description: Composable for managing the file name display and editing in the top panel of the editor, including logic for enabling/disabling editing based on image load state, handling user input for renaming files, and logging rename events.
 */
import { ref, nextTick, computed, watch } from 'vue'
import { editorConfig } from '@/config/editorConfig'
import { useApi } from '@/composables/common/useApi'
const { addUserEvent } = useApi()

/**
 * Reference to the input element for file name editing
 * Used for focusing and blurring the input
 */
const inputRef = ref(null)

/**
 * Logic for file name display and editing
 *
 * @param {object} imageStore - Store managing image state and metadata
 * @param {Function} t - Localization function from vue-i18n
 */
export function useFileNameDisplay(imageStore, t) {
  /**
   * Indicates whether the file name input is in editing mode
   */
  const editEnabled = ref(false)

  /**
   * Two-way bound value for the input field
   */
  const fileNameInput = ref(imageStore.fileName)

  /**
   * Watch and sync the internal input value when file name changes in store
   */
  watch(
    () => imageStore.fileName,
    (newName) => {
      fileNameInput.value = newName
    },
  )

  /**
   * Disable input when no image is loaded
   */
  const disabled = computed(() => !imageStore.isImageLoaded)

  /**
   * Save the new file name and update the store
   */
  const saveNewFileName = () => {
    editEnabled.value = false

    // Cut new name to maximum limit
    fileNameInput.value = fileNameInput.value.slice(0, editorConfig.maxFileNameLength)

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

    addUserEvent('renameFile', { newFileName: fileNameInput.value })
  }

  /**
   * Enable editing and focus the input
   */
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
