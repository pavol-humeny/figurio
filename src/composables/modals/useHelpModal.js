import { ref, onMounted, nextTick } from 'vue'

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
  // const confirmed = await showConfirmModal(
  //   t('privacy.confirmResetLocalPreferences.title'),
  //   t('privacy.confirmResetLocalPreferences.text'),
  //   t('privacy.confirmResetLocalPreferences.cancel'),
  //   t('privacy.confirmResetLocalPreferences.confirm'),
  // )
  // if (confirmed) {
  //   closePrivacyAndDataModal()
  //   location.reload()
  // }


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
