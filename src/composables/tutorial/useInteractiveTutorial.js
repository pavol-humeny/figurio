import { ref, computed, nextTick } from 'vue'
import { tutorialSteps } from '@/config/tutorialSteps'

/**
 * Global state of the interactive tutorial
 */
const isRunning = ref(false)
const activeStep = ref(0)

const numberOfSteps = computed(() => tutorialSteps.length)

/**
 * Tooltip and overlay positioning
 */
const tutorialItemRef = ref(null)
const tooltipStyle = ref({})
const overlayStyles = ref({
  top: {},
  bottom: {},
  left: {},
  right: {},
})

/**
 * Get the current step object
 */
const currentStep = computed(() => tutorialSteps[activeStep.value])

/**
 * Start the tutorial from the beginning
 */
const startTutorial = () => {
  activeStep.value = 0
  isRunning.value = true
  updatePosition()
}

/**
 * Go to the next step or end tutorial
 */
const nextStep = () => {
  if (activeStep.value < tutorialSteps.length - 1) {
    activeStep.value++
    updatePosition()
  }
}

/**
 * Go to the previous step
 */
const prevStep = () => {
  if (activeStep.value > 0) {
    activeStep.value--
    updatePosition()
  }
}

/**
 * Recalculate position of tooltip and overlays for the current step
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
        default:
          style.top = `${targetRect.bottom + offset}px`
          style.left = `${targetRect.left + targetRect.width / 2 - popupRect.width / 2}px`
      }

      tooltipStyle.value = style

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

const closeTutorial = () => {
  isRunning.value = false
  activeStep.value = 0
  tooltipStyle.value = {}
  overlayStyles.value = {
    top: {},
    bottom: {},
    left: {},
    right: {},
  }
  tutorialItemRef.value = null
}

export function useInteractiveTutorial() {
  return {
    isRunning,
    currentStep,
    activeStep,
    startTutorial,
    nextStep,
    prevStep,
    tooltipStyle,
    overlayStyles,
    tutorialItemRef,
    updatePosition,
    closeTutorial,
    numberOfSteps,
  }
}
