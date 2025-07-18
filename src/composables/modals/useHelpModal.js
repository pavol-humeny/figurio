import { ref, onMounted, nextTick, onBeforeUnmount } from 'vue'

const isVisible = ref(false)

export function useHelpModal() {
  const messagesRef = ref(null)
  const atTop = ref(true)
  const atBottom = ref(false)

  const showHelpModal = () => {
    if (isVisible.value) {
      return
    }
    isVisible.value = true
  }

  const closeHelpModal = () => {
    isVisible.value = false
  }

  const scrollUp = () => {
    messagesRef.value?.scrollBy({ top: -100, behavior: 'smooth' })
  }

  const scrollDown = () => {
    messagesRef.value?.scrollBy({ top: 100, behavior: 'smooth' })
  }

  const checkScroll = () => {
    const element = messagesRef.value
    if (!element) return
    atTop.value = element.scrollTop === 0
    atBottom.value = element.scrollTop + element.clientHeight >= element.scrollHeight - 1
  }

  onMounted(() => {
    nextTick(() => checkScroll())
  })

  const handleKeydown = (e) => {
    if (e.key === 'Escape' && isVisible.value) {
      e.preventDefault()
      closeHelpModal()
    }
  }

  onMounted(() => {
    window.addEventListener('keydown', handleKeydown)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('keydown', handleKeydown)
  })

  return {
    messagesRef,
    atTop,
    atBottom,
    isVisible,
    scrollUp,
    scrollDown,
    checkScroll,
    showHelpModal,
    closeHelpModal,
  }
}
