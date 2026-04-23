/**
 * @file: useRatingModal.js
 * @author: Pavol Humeny
 * @date: 15.5.2026
 * @description: Composable for managing the rating modal shown after export.
 */
import { ref, computed } from 'vue'
import { useApi } from '@/composables/common/useApi'
import { globalConfig } from '@/config/globalConfig'

const { addRating } = useApi()

/**
 * Retrieves a boolean value from localStorage.
 * Returns `false` only if the stored value is the string `'false'`, otherwise returns the fallback.
 * @param {string} key - The localStorage key to read from.
 * @param {boolean} [fallback=true] - The default value if the key is not set.
 * @returns {boolean} The parsed boolean value.
 */
const getBoolean = (key, fallback = true) => {
  const value = localStorage.getItem(key)
  return value === 'false' ? false : value === 'true' ? true : fallback
}

/**
 * Retrieves a number from localStorage and parses it as an integer.
 *
 * @param {string} key - The localStorage key to read from.
 * @param {number} fallback - The default number if the stored value is invalid.
 * @returns {number} The parsed number or the fallback.
 */
const getNumber = (key, fallback) => {
  const value = parseInt(localStorage.getItem(key), 10)
  return isNaN(value) ? fallback : value
}

/**
 * Whether the rating modal is visible
 */
const isVisible = ref(false)

/**
 * Selected rating value (1–5)
 */
const rating = ref(0)

/**
 * Optional text feedback
 */
const feedback = ref('')

/**
 * Composable for rating modal
 * @param {object} uiStore - The UI store instance for managing UI state
 * @param {object} editorStore - The editor store instance for managing editor state
 */
export function useRatingModal(uiStore, editorStore) {
  /**
   * Open rating modal (e.g. after export)
   */
  const openRatingModal = () => {
    if (isVisible.value) return

    // Check localStorage to prevent showing the modal multiple times
    const hasSubmittedFeedback = getBoolean(
      `${globalConfig.LOCAL_STORAGE_PREFIX}ratingFeedback`,
      false,
    )

    if (hasSubmittedFeedback) {
      return
    }

    const numberOfExports = getNumber(`${globalConfig.LOCAL_STORAGE_PREFIX}numberOfExports`, 0)

    // If it is the 3rd export, show the rating modal
    if (numberOfExports % 3 !== 0) {
      return
    }

    editorStore.isRatingModalOpen = true
    isVisible.value = true
  }

  /**
   * Close modal and reset state
   */
  const closeRatingModal = () => {
    isVisible.value = false
    rating.value = 0
    feedback.value = ''
    editorStore.isRatingModalOpen = false
  }

  /**
   * Set rating value (1–5)
   * Clear if user clicks the same rating again
   * @param {number} value
   */
  const setRating = (value) => {
    if (rating.value === value) {
      rating.value = 0
    } else {
      rating.value = value
    }
  }

  /**
   * Submit feedback
   */
  const submitFeedback = () => {
    // Set true to localstorage to indicate that user has submitted feedback
    localStorage.setItem(`${globalConfig.LOCAL_STORAGE_PREFIX}ratingFeedback`, 'true')

    const numberOfExports = getNumber(`${globalConfig.LOCAL_STORAGE_PREFIX}numberOfExports`, 0)

    addRating(uiStore.userUuid, {
      rating: rating.value,
      feedback: feedback.value,
      exportCount: numberOfExports,
    })

    closeRatingModal()
  }

  /**
   * Whether the submit button should be disabled (no rating is selected)
   */
  const isSubmitDisabled = computed(() => {
    return rating.value === 0
  })

  return {
    isVisible,
    rating,
    feedback,
    openRatingModal,
    closeRatingModal,
    setRating,
    submitFeedback,
    isSubmitDisabled,
  }
}
