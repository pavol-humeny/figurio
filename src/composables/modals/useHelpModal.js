import { ref, onMounted, nextTick, watch, reactive } from 'vue'
import { useInteractiveTutorial } from '@/composables/tutorial/useInteractiveTutorial'
import { useApi } from '@/composables/common/useApi'
import { useFeatureTourModal } from '@/composables/modals/useFeatureTourModal'
import { useConsole } from '../common/useConsole'
import { userModeConfig } from '@/config/userModeConfig'

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
export function useHelpModal(uiStore, imageStore, editorStore, userModeStore, router, t) {
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
    password: '',
  })

  /**
   * Whether the send contact form button is disabled
   */
  const sendContactFormDisabled = ref(true)

  /**
   * Whether the provided email is the command mode email
   */
  const isCommandEmail = ref(false)

  /**
   * Whether the subject input is wrong (for command mode feedback)
   */
  const subjectInputWrong = ref(false)

  /**
   * Whether the email input is wrong (for command mode feedback)
   */
  const emailInputWrong = ref(false)

  /**
   * Whether the subject input is successfully processed (for command mode feedback)
   */
  const subjectInputSuccess = ref(false)

  /**
   * Whether the password input is wrong (for command mode feedback)
   */
  const passwordInputWrong = ref(false)

  /**
   * Open the help modal
   */
  const openHelpModal = () => {
    if (isVisible.value) {
      return
    }

    addUserEvent('openModal', { modal: 'help' })

    isVisible.value = true

    editorStore.imageCanBePasted = false
  }

  /**
   * Close the help modal
   */
  const closeHelpModal = () => {
    isVisible.value = false

    editorStore.imageCanBePasted = true

    // Clear contact form on close
    contactForm.name = ''
    contactForm.email = ''
    contactForm.subject = ''
    contactForm.message = ''
  }

  /**
   * Scroll up the help modal content
   */
  const scrollUp = () => {
    helpContentRef.value?.scrollBy({ top: -20, behavior: 'auto' })
  }

  /**
   * Scroll down the help modal content
   */
  const scrollDown = () => {
    helpContentRef.value?.scrollBy({ top: 20, behavior: 'auto' })
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
   * Password visibility toggle for command mode
   */
  const showPassword = ref(false)

  /**
   * Toggle password visibility
   */
  const togglePasswordVisibility = () => {
    showPassword.value = !showPassword.value
  }

  /**
   * Watch contact form fields to enable/disable the send button
   */
  watch(
    () => ({ ...contactForm }),
    async (val) => {
      subjectInputWrong.value = false
      emailInputWrong.value = false
      subjectInputSuccess.value = false
      passwordInputWrong.value = false

      // Truncate fields if they exceed max length
      if (val.name.length > 25) contactForm.name = val.name.slice(0, 25)
      if (val.email.length > 50) contactForm.email = val.email.slice(0, 50)
      if (val.subject.length > 50) contactForm.subject = val.subject.slice(0, 50)
      if (val.message.length > 500) contactForm.message = val.message.slice(0, 500)

      // Trim whitespace from start and end
      contactForm.name = contactForm.name.trimStart()
      contactForm.email = contactForm.email.trimStart()
      contactForm.subject = contactForm.subject.trimStart()
      contactForm.message = contactForm.message.trimStart()

      const hashedEmail = await sha256(contactForm.email.trim())
      // Command mode
      if (hashedEmail === userModeConfig.commandModeEmail) {
        isCommandEmail.value = true
      } else {
        isCommandEmail.value = false
      }

      // Check if all fields are non-empty
      const allFilled =
        val.name.trim() !== '' &&
        val.email.trim() !== '' &&
        val.subject.trim() !== '' &&
        val.message.trim() !== ''

      // Check email format
      const emailPattern = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+$/
      const emailValid = emailPattern.test(val.email.trim())

      // Email input wrong flag
      emailInputWrong.value = !emailValid && val.email.trim() !== ''

      // Enable send button only if all fields are filled and email is valid
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
   * Handle user mode switch command from contact form
   * @returns {Promise<boolean>} - Whether the command was successful
   */
  const handleUserSwitchCommand = async () => {
    switch (contactForm.subject.trim()) {
      case 'admin': {
        // Check password
        const password = await sha256(contactForm.password.trim())
        if (password !== userModeConfig.modePasswords.adminMode) {
          warn('Invalid admin mode password')
          passwordInputWrong.value = true
          return false
        } else {
          userModeStore.setUserMode('admin')
          warn('Admin mode activated via contact form')
          addUserEvent('adminMode', { contactForm: { ...contactForm } })
          return true
        }
      }
      case 'expert': {
        // Check password
        const password = await sha256(contactForm.password.trim())
        if (password !== userModeConfig.modePasswords.expertMode) {
          warn('Invalid expert mode password')
          passwordInputWrong.value = true
          return false
        } else {
          userModeStore.setUserMode('expert')
          warn('Expert mode activated via contact form')
          addUserEvent('expertMode', { contactForm: { ...contactForm } })
          return true
        }
      }
      default:
        warn('Unknown command mode subject:', contactForm.subject)
        subjectInputWrong.value = true
        return false
    }
  }

  /**
   * Submit the contact form
   */
  const submitContactForm = async () => {
    if (isCommandEmail.value) {
      if (await handleUserSwitchCommand()) {
        // Clear form after successful command
        contactForm.name = ''
        contactForm.email = ''
        contactForm.subject = ''
        contactForm.message = ''
        contactForm.password = ''
        return
      } else {
        return
      }
    }

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

    // Send contact form data
    addUserEvent('submitContactForm', { contactForm: { ...contactForm } })

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
    subjectInputWrong,
    subjectInputSuccess,
    isCommandEmail,
    passwordInputWrong,
    togglePasswordVisibility,
    showPassword,
    emailInputWrong,
  }
}
