/**
 * @file: useSupportModal.js
 * @author: Pavol Humeny
 * @date: 15.5.2026
 * @description: Composable for managing the support modal shown every 10 exports.
 */

import { ref } from 'vue'
import { globalConfig } from '@/config/globalConfig'

/**
 * Retrieves a boolean value from localStorage.
 * Returns `false` only if the stored value is the string 'false', otherwise returns fallback.
 */
const getBoolean = (key, fallback = true) => {
  const value = localStorage.getItem(key)
  return value === 'false' ? false : value === 'true' ? true : fallback
}

/**
 * Retrieves a number from localStorage safely.
 */
const getNumber = (key, fallback) => {
  const value = parseInt(localStorage.getItem(key), 10)
  return isNaN(value) ? fallback : value
}

/**
 * Modal visibility state
 */
const isVisible = ref(false)

/**
 * Export count at which modal was last shown
 */
const lastShownExportCount = ref(0)

/**
 * Composable for support modal logic
 */
export function useSupportModal(uiStore, editorStore) {
  /**
   * Open support modal if conditions are met
   */
  const openSupportModal = () => {
    console.warn('Checking support modal conditions...')
    if (isVisible.value) return

    if (editorStore.isRatingModalOpen) {
      return
    }

    console.warn('Support modal conditions passed, checking export count...')

    // Optional: disable modal permanently if user already supported
    const hasSupported = getBoolean(`${globalConfig.LOCAL_STORAGE_PREFIX}supportGiven`, false)

    if (hasSupported) return

    const numberOfExports = getNumber(`${globalConfig.LOCAL_STORAGE_PREFIX}numberOfExports`, 0)

    // Show every 10th export
    if (numberOfExports === 0 || numberOfExports % 1 !== 0) {
      return
    }

    // Prevent repeated triggering on same export count
    if (numberOfExports === lastShownExportCount.value) {
      return
    }

    lastShownExportCount.value = numberOfExports

    editorStore.isSupportModalOpen = true
    isVisible.value = true
  }

  /**
   * Close modal
   */
  const closeSupportModal = () => {
    isVisible.value = false
    editorStore.isSupportModalOpen = false
  }

  /**
   * Redirect user to donation page (Buy me a coffee / Ko-fi / Stripe)
   */
  const openDonationLink = () => {
    // Replace with your real link
    window.open('https://buymeacoffee.com/yourname', '_blank')

    localStorage.setItem(`${globalConfig.LOCAL_STORAGE_PREFIX}supportGiven`, 'true')

    closeSupportModal()
  }

  return {
    isVisible,
    openSupportModal,
    closeSupportModal,
    openDonationLink,
  }
}
