import { onMounted, onBeforeUnmount, computed } from 'vue'
import { useConsole } from '@/composables/common/useConsole.js'
const { log } = useConsole()

/**
 * Logic for loading spinner overlay
 */
export function useLoadingSpinner(uiStore) {
  onMounted(() => {
    /**
     * Block all interactions when loading is active
     *
     * @param {Event} event Event to block
     */
    const blockAll = (event) => {
      if (uiStore.isLoading && uiStore.blockClicks) {
        log('Blocking interaction due to loading state')
        event.stopImmediatePropagation()
        event.preventDefault()
      }
    }

    window.addEventListener('click', blockAll, true)
    window.addEventListener('mousedown', blockAll, true)
    window.addEventListener('keydown', blockAll, true)
    window.addEventListener('pointerdown', blockAll, true)

    onBeforeUnmount(() => {
      window.removeEventListener('click', blockAll, true)
      window.removeEventListener('mousedown', blockAll, true)
      window.removeEventListener('keydown', blockAll, true)
      window.removeEventListener('pointerdown', blockAll, true)
    })
  })

  /**
   * Whether to show the loading overlay
   */
  const isVisible = computed(() => uiStore.isLoading)

  const blockClicks = computed(() => uiStore.blockClicks)

  return {
    isVisible,
    blockClicks,
  }
}
