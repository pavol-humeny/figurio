import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useShaking } from '@/composables/common/useShaking'

const isVisible = ref(false)
const title = ref('')
const message = ref('')
const cancelText = ref('Cancel')
const confirmText = ref('Confirm')
let resolver = null

const { triggerShake } = useShaking()

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

  const handleKeydown = (e) => {
    if (e.key === 'Escape' && isVisible.value) {
      e.preventDefault()
      triggerShake()
    }
  }

  onMounted(() => {
    window.addEventListener('keydown', handleKeydown)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('keydown', handleKeydown)
  })

  return {
    isVisible,
    title,
    message,
    showConfirmModal,
    confirm,
    confirmText,
    cancel,
    cancelText,
  }
}
