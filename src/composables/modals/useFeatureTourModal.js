import { ref } from 'vue'
import { useApi } from '@/composables/common/useApi'
const { addUserEvent } = useApi()

/**
 * Whether the feature tour modal is currently visible
 */
const isVisible = ref(false)

/**
 * Logic for the feature tour modal with reset and Escape key support
 *
 * @returns {{
 *   isVisible: import('vue').Ref<boolean>,
 *   openFeatureTourModal: () => void,
 *   closeFeatureTourModal: () => void
 * }}
 */
export function useFeatureTourModal() {
  /**
   * Open the modal
   */
  const openFeatureTourModal = () => {
    if (isVisible.value) {
      return
    }

    addUserEvent('openModal', { modal: 'featureTour' })

    isVisible.value = true
  }

  /**
   * Close the modal
   */
  const closeFeatureTourModal = () => {
    isVisible.value = false
  }

  return {
    isVisible,
    openFeatureTourModal,
    closeFeatureTourModal,
  }
}
