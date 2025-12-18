import { ref, onMounted, nextTick } from 'vue'
import { useApi } from '@/composables/common/useApi'
const { addUserEvent } = useApi()

/**
 * Whether the patch notes modal is currently visible
 */
const isVisible = ref(false)

/**
 * Logic for the patch notes modal with scrolling and Escape key support
 *
 * @returns {{
 *   releaseContentRef: import('vue').Ref<HTMLElement | null>,
 *   atTop: import('vue').Ref<boolean>,
 *   atBottom: import('vue').Ref<boolean>,
 *   isVisible: import('vue').Ref<boolean>,
 *   scrollUp: () => void,
 *   scrollDown: () => void,
 *   checkScroll: () => void,
 *   openReleaseModal: () => void,
 *   closeReleaseModal: () => void
 * }}
 */
export function useReleaseModal() {
  /**
   * Reference to the scrollable content container
   */
  const releaseContentRef = ref(null)

  /**
   * Whether the scroll is at the top
   */
  const atTop = ref(true)

  /**
   * Whether the scroll is at the bottom
   */
  const atBottom = ref(false)

  /**
   * Open the patch notes modal
   */
  const openReleaseModal = () => {
    if (isVisible.value) {
      return
    }

    addUserEvent('openModal', { modal: 'releaseNotes' })

    isVisible.value = true
  }

  /**
   * Close the patch notes modal
   */
  const closeReleaseModal = () => {
    isVisible.value = false
  }

  /**
   * Scroll up the patch notes modal content
   */
  const scrollUp = () => {
    releaseContentRef.value?.scrollBy({ top: -20, behavior: 'auto' })
  }

  /**
   * Scroll down the patch notes modal content
   */
  const scrollDown = () => {
    releaseContentRef.value?.scrollBy({ top: 20, behavior: 'auto' })
  }

  /**
   * Check whether the scroll is at the top or bottom of the content
   */
  const checkScroll = () => {
    const element = releaseContentRef.value
    if (!element) return
    atTop.value = element.scrollTop === 0
    atBottom.value = element.scrollTop + element.clientHeight >= element.scrollHeight - 1
  }

  // Check scroll position on mount
  onMounted(() => {
    nextTick(() => checkScroll())
  })

  return {
    releaseContentRef,
    atTop,
    atBottom,
    isVisible,
    scrollUp,
    scrollDown,
    checkScroll,
    openReleaseModal,
    closeReleaseModal,
  }
}
