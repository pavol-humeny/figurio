import { useImportModal } from '../modals/useImportModal'
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
  editorStore,
) {
  const { openImportModal } = useImportModal()
  const { openFileInput } = importFileService(
    userModeStore,
    workspaceStore,
    uiStore,
    imageStore,
    viewportStore,
    historyStore,
    editorStore,
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

  return {
    uploadFile,
    openDragAndDropModal,
  }
}
