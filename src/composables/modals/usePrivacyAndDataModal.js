import { ref } from 'vue'

const isVisible = ref(false)

export function usePrivacyAndDataModal() {
  const showPrivacyAndDataModal = () => {
    if (isVisible.value) {
      return
    }
    isVisible.value = true
  }

  const closePrivacyAndDataModal = () => {
    isVisible.value = false
  }

  return {
    isVisible,
    showPrivacyAndDataModal,
    closePrivacyAndDataModal,
  }
}
