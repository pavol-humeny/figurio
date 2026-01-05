import { useErrorModal } from '@/composables/modals/useErrorModal'

export function setupGlobalErrorHandling(app) {
  const { showErrorModal } = useErrorModal()

  // Vue errors
  app.config.errorHandler = (err) => {
    console.error('Vue error:', err)
    showErrorModal()
  }

  // JS runtime errors
  window.addEventListener('error', (event) => {
    console.error('Global error:', event.error)
    showErrorModal()
  })

  // Unhandled Promise errors
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled rejection:', event.reason)
    showErrorModal()
  })
}
