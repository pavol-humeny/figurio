import { useImportModal } from '../modals/useImportModal'
import { watch } from 'vue'
import { useApi } from '@/composables/common/useApi'
import { importFileService } from '@/services/importFileService'
const { addUserEvent } = useApi()

/**
 * Logic for the upload file button
 *
 * @param {Object} imageStore - The image store instance for file operations
 * @param {Function} t - The translation function from vue-i18n
 * @param {import('vue-router').Router} router - The Vue router instance
 * @returns {{
 *   uploadFile: () => void
 * }} Object containing the upload file handler
 */
export function useUploadFileButton(
  imageStore,
  t,
  router,
  userModeStore,
  workspaceStore,
  uiStore,
  viewportStore,
  historyStore,
) {
  const { openImportModal, closeImportModal } = useImportModal()
  const { openFileInput } = importFileService(
    userModeStore,
    workspaceStore,
    uiStore,
    imageStore,
    viewportStore,
    historyStore,
    t,
  )

  /**
   * Open file dialog and load the selected file
   */
  const uploadFile = async () => {
    openFileInput(router)
  }

  /**
   * Open drag and drop modal
   */
  const openDragAndDropModal = async () => {
    addUserEvent('buttonClicked', { button: 'uploadFile' })

    // Open the import modal
    openImportModal()
  }

  /**
   * Watch for file load to close the import modal
   */
  watch(
    () => imageStore.file,
    (newValue) => {
      if (newValue) {
        // If there was an error loading the file, open the import modal
        closeImportModal()
      }
    },
  )

  return {
    uploadFile,
    openDragAndDropModal,
  }
}
