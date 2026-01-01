import { ref, reactive } from 'vue'
import { uiConfig } from '@/config/uiConfig'

/**
 * Unique ID used for identifying each toast
 */
let nextId = 0

/**
 * Indicates if the toast timers are paused
 */
const isPaused = ref(false)

/**
 * List of active toast notifications
 * @type {import('vue').Ref<Array<{ id: number, type: string, title: string, message: string }>>}
 */
const toasts = ref([])

/**
 * Logic for toast modals (temporary popup notifications)
 *
 * @returns {{
 *   toasts: typeof toasts,
 *   showToastModal: (type: string, title: string, message: string) => void,
 *   removeToastModal: (id: number) => void
 * }}
 */
export function useToastModal() {
  /**
   * Position of toasts on the screen
   */
  const toastPositions = ref({})

  /**
   * Show a toast modal
   * @param {string} type - The type of the toast (e.g., 'success', 'error', 'info')
   * @param {string} title - The title of the toast
   * @param {string} message - The message content of the toast
   */
  const showToastModal = (type, title, message) => {
    const id = nextId++
    const duration = uiConfig.toastAutoRemoveTime

    const toast = reactive({
      id,
      type,
      title,
      message,
      duration,
      remaining: duration,
      progress: 100,
      paused: false,
      startTime: performance.now(),
      rafId: null,
    })

    toasts.value.push(toast)
    startToastTimer(toast)
  }

  /**
   * Start the timer for a toast to auto-remove it after its duration
   * @param {{ id: number, duration: number, remaining: number, startTime: number, rafId: number|null }} toast - The toast object
   */
  const startToastTimer = (toast) => {
    const tick = (now) => {
      if (isPaused.value) {
        toast.startTime = now
        toast.rafId = requestAnimationFrame(tick)
        return
      }

      const elapsed = now - toast.startTime
      toast.remaining -= elapsed
      toast.startTime = now

      toast.progress = Math.max(0, (toast.remaining / toast.duration) * 100)

      if (toast.remaining <= 0) {
        removeToastModal(toast.id)
        return
      }

      toast.rafId = requestAnimationFrame(tick)
    }

    toast.rafId = requestAnimationFrame(tick)
  }

  /**
   * Pause all toast timers
   */
  const pauseAllToasts = () => {
    isPaused.value = true
  }

  /**
   * Resume all toast timers
   */
  const resumeAllToasts = () => {
    isPaused.value = false
  }

  /**
   * Remove a toast modal by its ID
   * @param {number} id - The ID of the toast to remove
   */
  const removeToastModal = (id) => {
    const toast = toasts.value.find((t) => t.id === id)

    if (toast?.rafId) {
      cancelAnimationFrame(toast.rafId)
    }

    toasts.value = toasts.value.filter((t) => t.id !== id)
  }

  /**
   * Get the style for positioning the toast on the screen
   * @param {{ id: number }} toast - The toast object
   * @param {number} index - The index of the toast in the list
   * @returns {{ bottom: string }} - The style object with bottom position
   */
  const getToastStyle = (toast, index) => {
    const screenHeight = window.innerHeight

    if (!toastPositions.value[toast.id]) {
      toastPositions.value[toast.id] = {
        bottom: index * 10 + 40,
      }
    }

    const pos = toastPositions.value[toast.id]

    // If the position is on the top of the screen
    if (pos.bottom > screenHeight - 150) {
      // Random position
      pos.bottom = Math.random() * (screenHeight - 150) + 40
    }

    return {
      bottom: pos.bottom + 'px',
    }
  }

  return {
    toasts,
    showToastModal,
    removeToastModal,
    getToastStyle,
    pauseAllToasts,
    resumeAllToasts,
  }
}
