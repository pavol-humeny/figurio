import { ref } from 'vue'
import { uiConfig } from '@/config/uiConfig'

/**
 * Unique ID used for identifying each toast
 */
let nextId = 0

/**
 * List of active toast notifications
 * @type {import('vue').Ref<Array<{ id: number, type: string, title: string, message: string }>>}
 */
const toasts = ref([])

/**
 * Logic for toast modals (temporary popup notifications)
 *
 * @returns {{
 *   toasts: typeof toasts,
 *   showToastModal: (type: string, title: string, message: string) => void,
 *   removeToastModal: (id: number) => void
 * }}
 */
export function useToastModal() {
  /**
   * Position of toasts on the screen
   */
  const toastPositions = ref({})

  /**
   * Show a toast modal with specified type, title and message
   *
   * @param {string} type - The type of toast (e.g., 'success', 'error', 'warning')
   * @param {string} title - The title displayed in the toast
   * @param {string} message - The message content of the toast
   */
  const showToastModal = (type, title, message) => {
    const id = nextId++
    toasts.value.push({ id, type, title, message })

    // Auto-remove
    setTimeout(() => {
      toasts.value = toasts.value.filter((t) => t.id !== id)
    }, uiConfig.toastAutoRemoveTime)
  }

  /**
   * Remove a toast manually by ID
   *
   * @param {number} id - The ID of the toast to remove
   */
  const removeToastModal = (id) => {
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }

  /**
   * Get the style for positioning the toast on the screen
   * @param {{ id: number }} toast - The toast object
   * @param {number} index - The index of the toast in the list
   * @returns {{ bottom: string }} - The style object with bottom position
   */
  const getToastStyle = (toast, index) => {
    const screenHeight = window.innerHeight
 
    if (!toastPositions.value[toast.id]) {
      toastPositions.value[toast.id] = {
        bottom: index * 10 + 40,
      }
    }

    const pos = toastPositions.value[toast.id]

    // If the position is on the top of the screen
    if (pos.bottom > screenHeight - 150) {
      // Random position
      pos.bottom = Math.random() * (screenHeight - 150) + 40
    }

    return {
      bottom: pos.bottom + 'px',
    }
  }

  return {
    toasts,
    showToastModal,
    removeToastModal,
    getToastStyle,
  }
}
