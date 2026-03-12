/**
 * @file: useFeatureTourModal.js
 * @author: Pavol Humeny
 * @date: 15.5.2026
 */
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
  const openFeatureTourModal = (autoOpen = false, seenIdentifiers) => {
    if (isVisible.value) return

    // Open only if numberOfFeatureTourCloses in localStorage is 0 else decrement and return
    if (autoOpen) {
      const storageKey = `${globalConfig.LOCAL_STORAGE_PREFIX}numberOfFeatureTourCloses`
      const numClosesStr = localStorage.getItem(storageKey)
      let numCloses = numClosesStr ? parseInt(numClosesStr, 10) : 0

      if (isNaN(numCloses) || numCloses < 0) numCloses = 0

      if (numCloses > 0) {
        // Decrement and return
        localStorage.setItem(storageKey, (numCloses - 1).toString())
        return
      } else {
        // No more auto opens, reset to default
        localStorage.setItem(storageKey, globalConfig.numberOfFeatureTourCloses.toString()) // reset to default for next time
      }
    }

    // Determine which videos to show
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
    if (activeVideos.value.length === 0) return

    addUserEvent('openModal', { modal: 'featureTour', identifiers: activeVideos.value })
    isVisible.value = true
  }

  /**
   * Open modal with a single video by identifier
   * @param {string} identifier
   */
  const openSingleFeatureTourModal = (identifier) => {
    if (isVisible.value) return
    if (!identifier) return

    activeVideos.value = [identifier]

    addUserEvent('openModal', { modal: 'featureTour', identifiers: activeVideos.value })
    isVisible.value = true
  }

  /**
   * Close the modal
   */
  const closeFeatureTourModal = () => {
    // If activeVideos has more than 1 item, set numberOfFeatureTourCloses to 10 (do not auto open on each visit)
    if (activeVideos.value.length > 1) {
      const storageKey = `${globalConfig.LOCAL_STORAGE_PREFIX}numberOfFeatureTourCloses`
      localStorage.setItem(storageKey, globalConfig.numberOfFeatureTourCloses.toString())
    }

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
