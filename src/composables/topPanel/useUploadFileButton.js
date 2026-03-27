/**
 * @file: useUploadFileButton.js
 * @author: Pavol Humeny
 * @date: 15.5.2026
 * @description: Composable for managing the upload file button in the top panel of the editor, including logic for opening the file dialog and handling drag-and-drop file uploads.
 */
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
 * @param {Object} userModeStore - Store managing user permissions and modes
 * @param {Object} workspaceStore - Store managing open files and tabs
 * @param {Object} uiStore - Store managing UI state
 * @param {Object} viewportStore - Store managing viewport state
 * @param {Object} historyStore - Store managing history of operations
 * @param {Object} editorStore - Store managing editor state
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
