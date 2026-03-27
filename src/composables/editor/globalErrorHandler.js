/**
 * @file: globalErrorHandler.js
 * @author: Pavol Humeny
 * @date: 15.5.2026
 * @description: Global error handling for the application. This module sets up global error handlers for Vue errors, JavaScript runtime errors, and unhandled Promise rejections. It uses a custom function to determine if certain errors should be ignored based on their messages. When an error occurs that is not ignorable, it logs the error to the console and displays an error modal to the user.
 */
import { useErrorModal } from '@/composables/modals/useErrorModal'
import { useUserModeStore } from '@/stores/userModeStore'

/**
 * Logic for global error handling in the application.
 * @parame {App} app - The Vue application instance to set up error handling for.
 */
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
