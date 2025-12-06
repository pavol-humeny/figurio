import { ref, onMounted, nextTick, watch, reactive } from 'vue'
import { useInteractiveTutorial } from '@/composables/tutorial/useInteractiveTutorial'
import { useApi } from '@/composables/common/useApi'
import { useFeatureTourModal } from '@/composables/modals/useFeatureTourModal'
import { useConsole } from '../common/useConsole'
import { globalConfig } from '@/config/globalConfig'

const { warn } = useConsole()
const { addUserEvent, sendContactFormEmail } = useApi()
const { openFeatureTourModal } = useFeatureTourModal()

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
export function useHelpModal(uiStore, imageStore, editorStore, router, t) {
  const { startTutorial, continueTutorial } = useInteractiveTutorial(uiStore, imageStore, router, t)
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
   * Contact form data
   */
  const contactForm = reactive({
    name: '',
    email: '',
    subject: '',
    message: '',
  })

  /**
   * Whether the send contact form button is disabled
   */
  const sendContactFormDisabled = ref(true)

  /**
   * Open the help modal
   */
  const openHelpModal = () => {
    if (isVisible.value) {
      return
    }

    addUserEvent('openModal', { modal: 'help' })

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
   * Start the tutorial
   */
  const startInteractiveTutorial = () => {
    closeHelpModal()

    startTutorial()
  }

  /**
   * Continue the tutorial from the current step
   */
  const continueInteractiveTutorial = () => {
    closeHelpModal()

    continueTutorial()
  }

  // Check scroll position on mount
  onMounted(() => {
    nextTick(() => checkScroll())
  })

  /**
   * Open the feature tour modal from help modal
   */
  const openFeatureTourModalHelper = () => {
    closeHelpModal()
    openFeatureTourModal(false, [])
  }

  /**
   * Watch contact form fields to enable/disable the send button
   */
  watch(
    () => ({ ...contactForm }),
    (val) => {
      // Truncate fields if they exceed max length
      if (val.name.length > 25) contactForm.name = val.name.slice(0, 25)
      if (val.email.length > 25) contactForm.email = val.email.slice(0, 25)
      if (val.subject.length > 50) contactForm.subject = val.subject.slice(0, 50)
      if (val.message.length > 500) contactForm.message = val.message.slice(0, 500)

      // Trim whitespace from start and end
      contactForm.name = contactForm.name.trimStart()
      contactForm.email = contactForm.email.trimStart()
      contactForm.subject = contactForm.subject.trimStart()
      contactForm.message = contactForm.message.trimStart()

      // Check if all fields are non-empty
      const allFilled =
        val.name.trim() !== '' &&
        val.email.trim() !== '' &&
        val.subject.trim() !== '' &&
        val.message.trim() !== ''

      // Check email format
      const emailPattern = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+$/
      const emailValid = emailPattern.test(val.email.trim())

      sendContactFormDisabled.value = !(allFilled && emailValid)
    },
    { deep: true },
  )

  /**
   * Compute SHA-256 hash of a text
   * @param {string} text - Input text
   * @returns {Promise<string>} - Hexadecimal representation of the hash
   */
  const sha256 = async (text) => {
    // Encode text as UTF-8
    const encoder = new TextEncoder()
    const data = encoder.encode(text)

    // Compute SHA-256 digest
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)

    // Convert ArrayBuffer to hex string
    return [...new Uint8Array(hashBuffer)].map((b) => b.toString(16).padStart(2, '0')).join('')
  }

  /**
   * Submit the contact form
   */
  const submitContactForm = async () => {
    if (sendContactFormDisabled.value) return

    // Check again before submission
    const allFilled =
      contactForm.name.trim() !== '' &&
      contactForm.email.trim() !== '' &&
      contactForm.subject.trim() !== '' &&
      contactForm.message.trim() !== ''

    const emailPattern = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+$/
    const emailValid = emailPattern.test(contactForm.email.trim())

    // Validation warnings
    if (!emailValid) {
      warn('Invalid email format:', contactForm.email)
      contactForm.email = ''
      return
    }
    if (!(allFilled && emailValid)) {
      warn('Contact form submission blocked: incomplete or invalid fields')
      return
    }

    const hashedData = {
      name: await sha256(contactForm.name.trim()),
      email: await sha256(contactForm.email.trim()),
      subject: await sha256(contactForm.subject.trim()),
      message: await sha256(contactForm.message.trim()),
    }

    // Admin mode
    if (
      hashedData.email === globalConfig.adminMode.email &&
      hashedData.subject === globalConfig.adminMode.subject &&
      hashedData.message === globalConfig.adminMode.message
    ) {
      editorStore.setAdminMode(true)
      warn('Admin mode activated via contact form')
      addUserEvent('adminMode', { contactForm: { ...contactForm } })
      return
    } else if (contactForm.subject === 'su user') {
      editorStore.setAdminMode(false)
      warn('Admin mode logout')
      addUserEvent('adminMode', { contactForm: { ...contactForm } })
      return
    }

    // Send contact form data
    addUserEvent('submitContactForm', { contactForm: { ...contactForm } })

    console.warn('Contact form submitted:', { ...contactForm })

    // Use api to send the contact form data
    sendContactFormEmail({ ...contactForm })

    // Clear form after submission
    contactForm.name = ''
    contactForm.email = ''
    contactForm.subject = ''
    contactForm.message = ''
  }

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
    startInteractiveTutorial,
    continueInteractiveTutorial,
    openFeatureTourModalHelper,
    contactForm,
    submitContactForm,
    sendContactFormDisabled,
  }
}
