import { ref } from 'vue'

let nextId = 0
const toasts = ref([])

export function useToastModal() {
  function showToastModal(type, title, message) {
    const id = nextId++
    toasts.value.push({ id, type, title, message })

    // Auto-remove after 4s
    setTimeout(() => {
      toasts.value = toasts.value.filter(t => t.id !== id)
    }, 4000)
  }

  function removeToastModal(id) {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }

  return {
    toasts,
    showToastModal,
    removeToastModal
  }
}
