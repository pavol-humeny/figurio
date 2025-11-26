import { ref } from 'vue'
import { useApi } from '@/composables/common/useApi'
const { addUserEvent } = useApi()

/**
 * Whether the feature tour modal is currently visible
 */
const isVisible = ref(false)

/**
 * Active slide identifiers to show in the modal
 */
const activeVideos = ref([])

/**
 * Logic for the feature tour modal with reset and Escape key support
 *
 * @returns {{
 *   isVisible: import('vue').Ref<boolean>,
 *   activeVideos: import('vue').Ref<string[]>,
 *   openFeatureTourModal: (identifiers?: string[]) => void,
 *   closeFeatureTourModal: () => void
 * }}
 */
export function useFeatureTourModal() {
  /**
   * Open the modal
   * @param {string[]} [identifiers] - optional array of video identifiers to show
   */
  const openFeatureTourModal = (identifiers) => {
    if (isVisible.value) return

    addUserEvent('openModal', { modal: 'featureTour', identifiers })

    // If no identifiers, show all slides
    activeVideos.value = Array.isArray(identifiers) && identifiers.length ? identifiers : []
    isVisible.value = true
  }

  /**
   * Close the modal
   */
  const closeFeatureTourModal = () => {
    isVisible.value = false
    activeVideos.value = []
  }

  return {
    isVisible,
    activeVideos,
    openFeatureTourModal,
    closeFeatureTourModal,
  }
}
