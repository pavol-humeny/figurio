/**
 * @file: useLoadingSpinner.js
 * @author: Pavol Humeny
 * @date: 15.5.2026
 */
import { onMounted, onBeforeUnmount, computed, ref, watch } from 'vue'
import { useConsole } from '@/composables/common/useConsole.js'
import { editorConfig } from '@/config/editorConfig'
const { log } = useConsole()

/**
 * Logic for loading spinner overlay
 */
export function useLoadingSpinner(uiStore) {
  const showApplyingSpinner = ref(false)
  let applyingTimer = null

  watch(
    () => uiStore.isApplying,
    (isApplying) => {
      if (isApplying) {
        applyingTimer = setTimeout(() => {
          showApplyingSpinner.value = true
        }, editorConfig.applyingLoadingShowDelay)
      } else {
        clearTimeout(applyingTimer)
        applyingTimer = null
        showApplyingSpinner.value = false
      }
    },
  )

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

    /**
     * Prevent browser zoom with CTRL + mouse wheel
     *
     * @param {WheelEvent} e
     */
    const blockCtrlWheel = (e) => {
      const wrapper = document.querySelector('.viewport-wrapper')
      if (!wrapper) return

      // Block only if mouse is inside viewport wrapper
      if ((e.ctrlKey || e.metaKey) && wrapper.contains(e.target)) {
        e.preventDefault()
      }
    }

    /**
     * Prevent CTRL + +/-/0 zoom shortcuts
     */
    const blockCtrlKeys = (e) => {
      if ((e.ctrlKey || e.metaKey) && ['+', '-', '=', '0'].includes(e.key)) {
        e.preventDefault()
      }
    }

    window.addEventListener('wheel', blockCtrlWheel, { passive: false })
    window.addEventListener('keydown', blockCtrlKeys)

    onBeforeUnmount(() => {
      window.removeEventListener('click', blockAll, true)
      window.removeEventListener('mousedown', blockAll, true)
      window.removeEventListener('keydown', blockAll, true)
      window.removeEventListener('pointerdown', blockAll, true)

      window.removeEventListener('wheel', blockCtrlWheel, { passive: false })
      window.removeEventListener('keydown', blockCtrlKeys)

      clearTimeout(applyingTimer)
    })
  })

  /**
   * Whether to show the loading overlay
   */
  const isLoading = computed(() => uiStore.isLoading)

  const isApplying = computed(() => uiStore.isApplying)

  const blockClicks = computed(
    () => (uiStore.isLoading && uiStore.blockClicks) || uiStore.isApplying,
  )

  return {
    isLoading,
    isApplying,
    showApplyingSpinner,
    blockClicks,
  }
}
