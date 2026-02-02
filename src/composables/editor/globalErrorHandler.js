import { useErrorModal } from '@/composables/modals/useErrorModal'
import { useUserModeStore } from '@/stores/userModeStore'

export function setupGlobalErrorHandling(app) {
  const { showErrorModal } = useErrorModal(useUserModeStore())

  // Vue errors
  app.config.errorHandler = (err) => {
    if (isIgnorableRuntimeError(err)) {
      console.debug('Ignored runtime error:', err)
      return
    }

    console.error('Vue error:', err)
    showErrorModal()
  }

  // JS runtime errors
  window.addEventListener('error', (event) => {
    if (isIgnorableRuntimeError(event.error)) {
      console.debug('Ignored runtime error:', event.error)
      return
    }

    console.error('Global error:', event.error)
    showErrorModal()
  })

  // Unhandled Promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    if (isIgnorableRuntimeError(event.reason)) {
      console.debug('Ignored runtime rejection:', event.reason)
      return
    }

    console.error('Unhandled rejection:', event.reason)
    showErrorModal()
  })
}

/**
 * Checks if the error is ignorable based on its message.
 * @param {Error} err - The error object to check.
 * @returns {boolean} - True if the error is ignorable, false otherwise.
 */
const isIgnorableRuntimeError = (err) => {
  const message = err?.message || err?.toString?.() || ''

  return (
    message.includes('Could not establish connection. Receiving end does not exist') ||
    message.includes("PubSub Error Failed to execute 'atob'") ||
    message.includes("Failed to execute 'atob' on 'Window'")
  )
}
