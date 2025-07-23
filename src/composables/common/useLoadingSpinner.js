import { onMounted, onBeforeUnmount, computed } from 'vue'

export function useLoadingSpinner(uiStore) {
  onMounted(() => {
    const blockAll = (e) => {
      if (uiStore.isLoading && uiStore.blockClicks) {
        console.log('Blocking interaction due to loading state')
        e.stopImmediatePropagation()
        e.preventDefault()
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
