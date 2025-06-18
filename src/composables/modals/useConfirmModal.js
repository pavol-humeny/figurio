import { ref } from 'vue'

const isVisible = ref(false)
const title = ref('')
const message = ref('')
const isShaking = ref(false)
const cancelText = ref('Cancel')
const confirmText = ref('Confirm')
let resolver = null



export function useConfirmModal() {
  const showConfirmModal = (modalTitle, modalMessage, modalCancelText, modalConfirmText) => {
    if (isVisible.value) {
      return Promise.resolve(false)
    }

    isVisible.value = true
    title.value = modalTitle
    message.value = modalMessage
    cancelText.value = modalCancelText
    confirmText.value = modalConfirmText

    return new Promise((resolve) => {
      resolver = resolve
    })
  }

  const confirm = () => {
    isVisible.value = false
    resolver?.(true)
  }

  const cancel = () => {
    isVisible.value = false
    resolver?.(false)
  }

  const triggerShake = () => {
    if (isShaking.value) return
    isShaking.value = true
    setTimeout(() => {
      isShaking.value = false
    }, 500)
  }

  return{
    isVisible,
    title,
    message,
    showConfirmModal,
    confirm,
    confirmText,
    cancel,
    cancelText,
    isShaking,
    triggerShake,
  }
}
