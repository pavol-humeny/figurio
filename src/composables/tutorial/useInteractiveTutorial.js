import { ref, computed, nextTick, watch } from 'vue'
import { getTutorialSteps } from '@/config/tutorialSteps'
import { useToastModal } from '../modals/useToastModal'
import { globalConfig } from '@/config/globalConfig'

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

/**
 * Total number of steps in the tutorial
 */
const numberOfSteps = ref(0)

/**
 * Current step object containing selector, title, text, and position
 */
const currentStep = ref({})

/**
 * Array of all tutorial steps
 */
const steps = ref([])

/**
 * Login for the interactive tutorial
 *
 * @returns {{
 *  isRunning: import('vue').ComputedRef<boolean>,
 * currentStep: import('vue').Ref<object>,
 * activeStep: import('vue').ComputedRef<number>,
 * startTutorial: () => void,
 * nextStep: () => void,
 * prevStep: () => void,
 * tutorialItemStyle: import('vue').Ref<object>,
 * overlayStyles: import('vue').Ref<object>,
 * tutorialItemRef: import('vue').Ref<HTMLElement | null>,
 * updatePosition: () => void,
 * closeTutorial: () => void,
 * numberOfSteps: import('vue').Ref<number>,
 * finishTutorial: () => void,
 * continueTutorial: () => void
 * }}
 */
export function useInteractiveTutorial(uiStore, imageStore, router, t) {
  const { showToastModal } = useToastModal()

  /**
   * If the tutorial feature is enabled
   */
  const isTutorialEnabled = globalConfig.featureFlags.enableTutorial

  /**
   * Whether the tutorial is currently running
   */
  const isRunning = computed({
    get: () => uiStore.isTutorialRunning,
    set: (value) => {
      uiStore.isTutorialRunning = value
    },
  })

  /**
   * Reset completed status when steps change
   */
  watch(
    steps,
    (newSteps) => {
      if (newSteps.length !== numberOfSteps.value) {
        uiStore.setTutorialCompleted(false)
        uiStore.setTutorialStep(0)
      }
    },
    { immediate: true },
  )

  /**
   * Watch for image loading to update tutorial steps
   */
  watch(
    () => imageStore.isImageLoaded,
    () => {
      steps.value = getTutorialSteps(router, t)
      numberOfSteps.value = steps.value.length
      currentStep.value = steps.value[uiStore.tutorialStep] || {}

      // uiStore.setTutorialCompleted(false)
      // uiStore.setTutorialStep(0)
    },
  )
  /**
   * Active step index in the tutorial
   */
  const activeStep = computed({
    get: () => uiStore.tutorialStep,
    set: (value) => uiStore.setTutorialStep(value),
  })

  /**
   * Start the tutorial from the beginning, regardless of completion
   */
  const startTutorial = () => {
    if (!isTutorialEnabled) return

    activeStep.value = 0

    // Get actual steps
    steps.value = getTutorialSteps(router, t)

    // Update current step and number of steps
    numberOfSteps.value = steps.value.length
    currentStep.value = steps.value[activeStep.value] || {}

    uiStore.setTutorialCompleted(false)
    isRunning.value = true

    updatePosition()
  }

  /**
   * Continue tutorial from stored step (if not completed)
   */
  const continueTutorial = () => {
    if (!isTutorialEnabled) return

    if (uiStore.tutorialCompleted) {
      return
    }

    // Get actual steps
    const newSteps = getTutorialSteps(router, t)
    if (newSteps.length !== steps.value.length) {
      activeStep.value = 0
    }
    steps.value = newSteps

    // Update current step and number of steps
    numberOfSteps.value = steps.value.length
    currentStep.value = steps.value[activeStep.value] || {}

    isRunning.value = true

    updatePosition()
  }

  /**
   * Go to the next step and update store
   */
  const nextStep = () => {
    if (!isRunning.value) return
    if (activeStep.value < steps.value.length - 1) {
      activeStep.value++
      currentStep.value = steps.value[activeStep.value] || {}
      updatePosition()
    }
  }

  /**
   * Go to the previous step and update store
   */
  const prevStep = () => {
    if (!isRunning.value) return
    if (activeStep.value > 0) {
      activeStep.value--
      currentStep.value = steps.value[activeStep.value] || {}
      updatePosition()
    }
  }

  /**
   * Close (pause) tutorial
   */
  const closeTutorial = () => {
    if (!isRunning.value) return
    isRunning.value = false
  }

  /**
   * Finish tutorial and mark as completed
   */
  const finishTutorial = () => {
    if (!isRunning.value) return
    if (activeStep.value < steps.value.length - 1) {
      return
    }
    isRunning.value = false
    uiStore.setTutorialCompleted(true)

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

    const el = document.querySelector(selector)
    if (!el) {
      // Go to next step if element not found
      nextStep()
      return
    }

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
    isTutorialEnabled,
  }
}
