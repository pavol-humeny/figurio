import { ref, computed, nextTick } from 'vue'
import { getTutorialSteps } from '@/config/tutorialSteps'
import { useToastModal } from '../modals/useToastModal'

/**
 * Whether the tutorial is currently running
 */
const isRunning = ref(false)

/**
 * Current active step in the tutorial
 * Starts at 0, which is the first step
 */
// const activeStep = ref(0)

/**
 * Tutorial item and overlay positioning
 */
const tutorialItemRef = ref(null)
const tutorialItemStyle = ref({})
const overlayStyles = ref({
  top: {},
  bottom: {},
  left: {},
  right: {},
})

export function useInteractiveTutorial(uiStore, t) {
  const { showToastModal } = useToastModal()

  const steps = getTutorialSteps(t)

  const activeStep = computed({
    get: () => uiStore.tutorialStep,
    set: (value) => uiStore.setTutorialStep(value),
  })

  /**
   * Total number of steps in the tutorial
   */
  const numberOfSteps = computed(() => steps.length)

  /**
   * Get the current step object
   */
  const currentStep = computed(() => steps[activeStep.value])

  /**
   * Start the tutorial from the beginning, regardless of completion
   */ 
  const startTutorial = () => {
    console.log('Starting tutorial from beginning')
    activeStep.value = 0
    uiStore.setTutorialCompleted(false)
    isRunning.value = true
    updatePosition()
  }

  /**
   * Continue tutorial from stored step (if not completed)
   */
  const continueTutorial = () => {
    if (uiStore.tutorialCompleted) {
      console.log('Tutorial already completed')
      return
    }
    isRunning.value = true
    updatePosition()
  }

  /**
   * Go to the next step and update store
   */
  const nextStep = () => {
    console.log('Next step:', activeStep.value + 1)
    if (activeStep.value < steps.length - 1) {
      activeStep.value++
      updatePosition()
    }
  }

  /**
   * Go to the previous step and update store
   */
  const prevStep = () => {
    console.log('Previous step:', activeStep.value - 1)
    if (activeStep.value > 0) {
      activeStep.value--
      updatePosition()
    }
  }

  /**
   * Close (pause) tutorial
   */
  const closeTutorial = () => {
    console.log('Closing tutorial...')
    isRunning.value = false
  }

  /**
   * Finish tutorial and mark as completed
   */
  const finishTutorial = () => {
    isRunning.value = false
    uiStore.setTutorialCompleted(true)
    console.log('Tutorial completed')

    showToastModal(
      'success',
      t('help.helpContent.tutorial.tutorialSuccessfullyCompleted.title'),
      t('help.helpContent.tutorial.tutorialSuccessfullyCompleted.message'),
    )
  }

  /**
   * Recalculate position of tutorial item and overlays for the current step
   */
  const updatePosition = () => {
    const selector = currentStep.value?.selector
    if (!selector) return

    const tryFind = setInterval(() => {
      const el = document.querySelector(selector)
      if (!el) return
      clearInterval(tryFind)

      nextTick(() => {
        const popup = tutorialItemRef.value
        if (!popup || !el) return

        const targetRect = el.getBoundingClientRect()
        const popupRect = popup.getBoundingClientRect()
        const offset = 10
        const position = currentStep.value.position || 'bottom'

        const style = {
          position: 'fixed',
          zIndex: 'var(--z-index-tutorial-item)',
        }

        switch (position) {
          // Outside positions
          case 'top':
            style.top = `${targetRect.top - offset - popupRect.height}px`
            style.left = `${targetRect.left + targetRect.width / 2 - popupRect.width / 2}px`
            break
          case 'bottom':
            style.top = `${targetRect.bottom + offset}px`
            style.left = `${targetRect.left + targetRect.width / 2 - popupRect.width / 2}px`
            break
          case 'left':
            style.top = `${targetRect.top + targetRect.height / 2 - popupRect.height / 2}px`
            style.left = `${targetRect.left - offset - popupRect.width}px`
            break
          case 'right':
            style.top = `${targetRect.top + targetRect.height / 2 - popupRect.height / 2}px`
            style.left = `${targetRect.right + offset}px`
            break
          // Inside positions
          case 'top-in':
            style.top = `${targetRect.top + offset}px`
            style.left = `${targetRect.left + targetRect.width / 2 - popupRect.width / 2}px`
            break
          case 'bottom-in':
            style.top = `${targetRect.bottom - popupRect.height - offset}px`
            style.left = `${targetRect.left + targetRect.width / 2 - popupRect.width / 2}px`
            break
          case 'left-in':
            style.top = `${targetRect.top + targetRect.height / 2 - popupRect.height / 2}px`
            style.left = `${targetRect.left + offset}px`
            break
          case 'right-in':
            style.top = `${targetRect.top + targetRect.height / 2 - popupRect.height / 2}px`
            style.left = `${targetRect.right - popupRect.width - offset}px`
            break
        }

        tutorialItemStyle.value = style

        const { innerWidth, innerHeight } = window
        const { top, left, width, height } = targetRect

        overlayStyles.value = {
          top: {
            top: 0,
            left: 0,
            width: '100vw',
            height: `${top}px`,
          },
          bottom: {
            top: `${top + height}px`,
            left: 0,
            width: '100vw',
            height: `${innerHeight - top - height}px`,
          },
          left: {
            top: `${top}px`,
            left: 0,
            width: `${left}px`,
            height: `${height}px`,
          },
          right: {
            top: `${top}px`,
            left: `${left + width}px`,
            width: `${innerWidth - left - width}px`,
            height: `${height}px`,
          },
        }
      })
    }, 100)
  }

  return {
    isRunning,
    currentStep,
    activeStep,
    startTutorial,
    nextStep,
    prevStep,
    tutorialItemStyle,
    overlayStyles,
    tutorialItemRef,
    updatePosition,
    closeTutorial,
    numberOfSteps,
    finishTutorial,
    continueTutorial,
  }
}
