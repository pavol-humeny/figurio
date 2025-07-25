import { ref, onMounted, nextTick, onBeforeUnmount } from 'vue'
import { useInteractiveTutorial } from '@/composables/tutorial/useInteractiveTutorial'

/**
 * Whether the help modal is currently visible
 */
const isVisible = ref(false)

/**
 * Logic for the help modal with scrolling and Escape key support
 *
 * @returns {{
 *   helpContentRef: import('vue').Ref<HTMLElement | null>,
 *   atTop: import('vue').Ref<boolean>,
 *   atBottom: import('vue').Ref<boolean>,
 *   isVisible: import('vue').Ref<boolean>,
 *   scrollUp: () => void,
 *   scrollDown: () => void,
 *   checkScroll: () => void,
 *   openHelpModal: () => void,
 *   closeHelpModal: () => void
 * }}
 */
export function useHelpModal(uiStore, t) {
  /**
   * Reference to the scrollable content container
   */
  const helpContentRef = ref(null)

  /**
   * Whether the scroll is at the top
   */
  const atTop = ref(true)

  /**
   * Whether the scroll is at the bottom
   */
  const atBottom = ref(false)

  /**
   * Open the help modal
   */
  const openHelpModal = () => {
    if (isVisible.value) {
      return
    }
    isVisible.value = true
  }

  /**
   * Close the help modal
   */
  const closeHelpModal = () => {
    isVisible.value = false
  }

  /**
   * Scroll up the help modal content
   */
  const scrollUp = () => {
    helpContentRef.value?.scrollBy({ top: -100, behavior: 'smooth' })
  }

  /**
   * Scroll down the help modal content
   */
  const scrollDown = () => {
    helpContentRef.value?.scrollBy({ top: 100, behavior: 'smooth' })
  }

  /**
   * Check whether the scroll is at the top or bottom of the content
   */
  const checkScroll = () => {
    const element = helpContentRef.value
    if (!element) return
    atTop.value = element.scrollTop === 0
    atBottom.value = element.scrollTop + element.clientHeight >= element.scrollHeight - 1
  }

  /**
   * Handle Escape key to close the modal
   *
   * @param {KeyboardEvent} e
   */
  const handleKeydown = (e) => {
    if (e.key === 'Escape' && isVisible.value) {
      e.preventDefault()
      closeHelpModal()
    }
  }

  /**
   * Start the tutorial
   */
  const startTutorial = () => {
    closeHelpModal()

    useInteractiveTutorial(uiStore, t).startTutorial()
  }

  /**
   * Continue the tutorial from the current step
   */
  const continueTutorial = () => {
    closeHelpModal()

    useInteractiveTutorial(uiStore, t).continueTutorial()
  }

  // Check scroll position on mount
  onMounted(() => {
    nextTick(() => checkScroll())
  })

  // Register Escape key handler
  onMounted(() => {
    window.addEventListener('keydown', handleKeydown)
  })

  // Cleanup key handler on unmount
  onBeforeUnmount(() => {
    window.removeEventListener('keydown', handleKeydown)
  })

  return {
    helpContentRef,
    atTop,
    atBottom,
    isVisible,
    scrollUp,
    scrollDown,
    checkScroll,
    openHelpModal,
    closeHelpModal,
    startTutorial,
    continueTutorial,
  }
}
