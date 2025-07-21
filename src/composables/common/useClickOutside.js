import { ref, onMounted, onBeforeUnmount } from 'vue'

/**
 * Logic for detecting clicks outside a given element
 *
 * @export
 * @param {{ condition?: () => boolean, onOutsideClick: (event: MouseEvent) => void }} options
 * Object with a condition function to control when to trigger and a callback for outside clicks
 * @returns {{ wrapperRef: import('vue').Ref<HTMLElement | null> }}
 */
export function useClickOutside({ condition = () => true, onOutsideClick }) {
  const wrapperRef = ref(null)

  /**
   * Handles clicks outside the referenced element and invokes the callback
   * if the condition is met.
   *
   * @param {MouseEvent} event - Mouse event from document
   */
  const handleClickOutside = (event) => {
    if (!condition()) return
    if (wrapperRef.value && !wrapperRef.value.contains(event.target)) {
      // Use setTimeout to fix problem with closing and immediate re-opening
      // of the settings panel after clicking SettingsButton
      setTimeout(() => {
        onOutsideClick(event)
      }, 150)
    }
  }

  // Attach the event listener on mount
  onMounted(() => {
    document.addEventListener('mousedown', handleClickOutside)
  })

  // Clean up the event listener on unmount
  onBeforeUnmount(() => {
    document.removeEventListener('mousedown', handleClickOutside)
  })

  return {
    wrapperRef,
  }
}
