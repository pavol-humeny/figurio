import { ref } from 'vue'
import { useApi } from '@/composables/common/useApi'
import { globalConfig } from '@/config/globalConfig.js'

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
   * @param {string[]} seenIdentifiers - optional array of already seen video identifiers
   */
  const openFeatureTourModal = (seenIdentifiers) => {
    if (isVisible.value) return

    if (Array.isArray(seenIdentifiers)) {
      // Show only videos not in seenIdentifiers
      activeVideos.value = globalConfig.listOfFeatureTourVideos.filter(
        (id) => !seenIdentifiers.includes(id),
      )
    } else {
      // No parameter - show all
      activeVideos.value = [...globalConfig.listOfFeatureTourVideos]
    }

    // Do not open if nothing to show
    if (!activeVideos.value.length) return

    addUserEvent('openModal', { modal: 'featureTour', identifiers: activeVideos.value })
    isVisible.value = true
  }

  /**
   * Open modal with a single video by identifier
   * @param {string} identifier
   */
  const openSingleFeatureTourModal = (identifier) => {
    console.log('openSingleFeatureTourModal', identifier)
    if (isVisible.value) return
    if (!identifier) return

    // Check if the identifier exists
    if (!globalConfig.listOfFeatureTourVideos.includes(identifier)) {
      console.warn(`Feature tour video identifier "${identifier}" does not exist.`)
      return
    }

    activeVideos.value = [identifier]

    addUserEvent('openModal', { modal: 'featureTour', identifiers: activeVideos.value })
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
    openSingleFeatureTourModal,
  }
}
