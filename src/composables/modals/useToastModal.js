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

  return {
    toasts,
    showToastModal,
    removeToastModal,
  }
}
