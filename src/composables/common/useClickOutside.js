import { ref, onMounted, onBeforeUnmount } from 'vue'

export function useClickOutside({ condition = () => true, onOutsideClick }) {
  const wrapperRef = ref(null)

  const handleClickOutside = (event) => {
    if (!condition()) return
    if (wrapperRef.value && !wrapperRef.value.contains(event.target)) {
      console.log('Clicked outside the element')

      // Use setTimeout to fix problem with closing and immediate re-opening
      // of the settings panel after clicking SettingsButton 
      setTimeout(() => {
        onOutsideClick(event)
      }, 150)
    }
  }

  onMounted(() => {
    document.addEventListener('mousedown', handleClickOutside)
  })

  onBeforeUnmount(() => {
    document.removeEventListener('mousedown', handleClickOutside)
  })

  return {
    wrapperRef,
  }
}
