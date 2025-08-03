import { ref } from 'vue'

/**
 * Whether the modal is currently visible
 */
const isVisible = ref(false)

/**
 * Optional modal title
 */
const title = ref('')

/**
 * Cancel / confirm button labels
 */
const cancelText = ref('Cancel')
const confirmText = ref('Confirm')

/**
 * Custom content to pass into the modal (optional)
 * Can be used as key or ID for dynamic rendering
 */
const payload = ref(null)

/**
 * Resolver function used to finalize the modal Promise
 * @type {(result: boolean) => void | null}
 */
let resolver = null

export function useGeneralModal() {
  /**
   * Show a generic modal and await user confirmation
   *
   * @param {string} modalTitle - Optional title
   * @param {string} cancelLabel - Label for cancel button
   * @param {string} confirmLabel - Label for confirm button
   * @param {*} data - Optional data passed into modal
   * @returns {Promise<boolean>}
   */
  const showGeneralModal = (modalTitle, cancelLabel, confirmLabel, data = null) => {
    if (isVisible.value) return Promise.resolve(false)

    isVisible.value = true
    title.value = modalTitle
    cancelText.value = cancelLabel
    confirmText.value = confirmLabel
    payload.value = data

    return new Promise((resolve) => {
      resolver = resolve
    })
  }

  /**
   * Confirm the modal and resolve with `true`
   */
  const confirm = (data = true) => {
    isVisible.value = false
    resolver?.(data)
  }

  /**
   * Cancel the modal and resolve with `false`
   */
  const cancel = () => {
    isVisible.value = false
    resolver?.(false)
  }

  return {
    isVisible,
    title,
    cancelText,
    confirmText,
    payload,
    showGeneralModal,
    confirm,
    cancel,
  }
}
