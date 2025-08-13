import { ref, onMounted, nextTick, onBeforeUnmount } from 'vue'
import { useSendEvent } from '@/composables/common/useSendEvent'

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

    useSendEvent().sendEvent('modalEvent', null, null, { modal: 'release', event: 'open' })

    isVisible.value = true
  }

  /**
   * Close the patch notes modal
   */
  const closeReleaseModal = () => {
    useSendEvent().sendEvent('modalEvent', null, null, { modal: 'release', event: 'close' })

    isVisible.value = false
  }

  /**
   * Scroll up the patch notes modal content
   */
  const scrollUp = () => {
    releaseContentRef.value?.scrollBy({ top: -100, behavior: 'smooth' })
  }

  /**
   * Scroll down the patch notes modal content
   */
  const scrollDown = () => {
    releaseContentRef.value?.scrollBy({ top: 100, behavior: 'smooth' })
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

  /**
   * Handle Escape key to close the modal
   *
   * @param {KeyboardEvent} e
   */
  const handleKeydown = (e) => {
    if (e.key === 'Escape' && isVisible.value) {
      e.preventDefault()
      closeReleaseModal()
    }
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
