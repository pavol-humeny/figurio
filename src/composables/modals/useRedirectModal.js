/**
 * @file: useRedirectModal.js
 * @author: Pavol Humeny
 * @date: 9.5.2026
 * @description: Composable for managing a redirect modal that can be shown to users before redirecting them to an external URL (Fit Server).
 */

import { ref } from 'vue'

/**
 * Whether the redirect modal is visible
 */
const isVisible = ref(false)

/**
 * Target URL for redirect
 */
const redirectUrl = ref('')

/**
 * Click counter for closing modal
 */
const clickCount = ref(0)

/**
 * Composable for redirect modal
 */
export const useRedirectModal = () => {
  /**
   * Open redirect modal with target URL
   * @param {string} url
   */
  const openRedirectModal = (url) => {
    if (isVisible.value) return

    redirectUrl.value = url
    isVisible.value = true

    console.warn(`Redirecting user to: ${url}`)
  }

  /**
   * Execute redirect
   */
  const redirect = () => {
    window.location.href = redirectUrl.value
  }

  /**
   * Handle clicks inside modal
   * After 10 clicks, modal closes
   */
  const registerModalClick = () => {
    clickCount.value++

    if (clickCount.value >= 10) {
      isVisible.value = false
      clickCount.value = 0
    }
  }

  return {
    isVisible,
    redirectUrl,
    openRedirectModal,
    redirect,
    registerModalClick,
  }
}
