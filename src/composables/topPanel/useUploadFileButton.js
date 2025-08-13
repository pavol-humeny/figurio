import { useSendEvent } from '@/composables/common/useSendEvent'

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
export function useUploadFileButton(imageStore, t, router) {
  /**
   * Open file dialog and load the selected file
   */
  const uploadFile = async () => {
    // Send event
    useSendEvent().sendEvent('buttonClicked', null, 'uploadFile', {})

    imageStore.loadFile(t, router)
  }

  return {
    uploadFile,
  }
}
