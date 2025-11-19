import { ref } from 'vue'
import { useEditorStore } from '@/stores/editorStore'

/**
 * Whether the modal is currently visible
 */
const isVisible = ref(false)

/**
 * Modal title text
 */
const title = ref('')
/**
 * Modal message text
 */
const message = ref('')
/**
 * Text for the cancel button
 */
const cancelText = ref('Cancel')
/**
 * Text for the confirm button
 */
const confirmText = ref('Confirm')

/**
 * Whether to use close action
 */
const useClose = ref(false)

/**
 * Resolver function used to finalize the modal Promise
 * @type {(result: boolean) => void | null}
 */
let resolver = null

/**
 * Logic for showing and handling a confirm modal with Promise-based API
 *
 * @returns {{
 *   isVisible: import('vue').Ref<boolean>,
 *   title: import('vue').Ref<string>,
 *   message: import('vue').Ref<string>,
 *   cancelText: import('vue').Ref<string>,
 *   confirmText: import('vue').Ref<string>,
 *   showConfirmModal: (title: string, message: string, cancelText: string, confirmText: string) => Promise<boolean>,
 *   confirm: () => void,
 *   cancel: () => void
 * }}
 */
export function useConfirmModal() {
  const editorStore = useEditorStore()

  /**
   * Show the modal and return a Promise that resolves with the user’s choice
   *
   * @param {string} modalTitle - Title of the modal
   * @param {string} modalMessage - Message inside the modal
   * @param {string} modalCancelText - Label for cancel button
   * @param {string} modalConfirmText - Label for confirm button
   * @returns {Promise<boolean>} - Resolves true if confirmed, false if canceled
   */
  const showConfirmModal = (
    modalTitle,
    modalMessage,
    modalCancelText,
    modalConfirmText,
    modalUseClose = false,
  ) => {
    if (isVisible.value) {
      return Promise.resolve(false)
    }

    isVisible.value = true
    title.value = modalTitle
    message.value = modalMessage
    cancelText.value = modalCancelText
    confirmText.value = modalConfirmText
    useClose.value = modalUseClose

    editorStore.isModalOpenFlag = true

    return new Promise((resolve) => {
      resolver = resolve
    })
  }

  /**
   * Confirm the modal and resolve with `true`
   */
  const confirm = () => {
    isVisible.value = false
    editorStore.isModalOpenFlag = false
    resolver?.(true)
  }

  /**
   * Cancel the modal and resolve with `false`
   */
  const cancel = () => {
    isVisible.value = false
    editorStore.isModalOpenFlag = false
    resolver?.(false)
  }

  /**
   * Resolve with "other"
   */
  const close = () => {
    isVisible.value = false
    editorStore.isModalOpenFlag = false

    if (useClose.value) {
      resolver?.('close') // <-- third state
    } else {
      resolver?.(false)
    }
  }

  return {
    isVisible,
    title,
    message,
    showConfirmModal,
    confirm,
    confirmText,
    cancel,
    cancelText,
    close,
    useClose,
  }
}
