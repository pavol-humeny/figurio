import { userModeConfig } from '@/config/userModeConfig'
import { defineStore } from 'pinia'
import { globalConfig } from '@/config/globalConfig.js'

/**
 * Retrieves a string from localStorage.
 *
 * @param {string} key - The localStorage key to read from.
 * @param {string} fallback - The default value if the key is not found.
 * @returns {string} The stored string or the fallback.
 */
const getString = (key, fallback) => {
  const value = localStorage.getItem(key)
  return value !== null ? value : fallback
}

/**
 * Store managing undo/redo history for image operations
 */
export const useUserModeStore = defineStore('userModeStore', {
  state: () => ({
    userMode: getString(`${globalConfig.LOCAL_STORAGE_PREFIX}userMode`, 'basic'),
  }),
  getters: {
    /**
     * Check if user is in basic mode
     */
    isBasicMode(state) {
      return state.userMode === 'basic'
    },
    /**
     * Check if user is in admin mode
     */
    isAdminMode(state) {
      return state.userMode === 'admin'
    },
    /**
     * Check if user is in expert mode
     */
    isExpertMode(state) {
      return state.userMode === 'expert'
    },
    /**
     * Check if user is in expert or admin mode
     */
    isExpertOrAdminMode(state) {
      return state.userMode === 'expert' || state.userMode === 'admin'
    },
  },
  actions: {
    /**
     * Set user mode
     * @param {string} mode - 'basic', 'expert', 'admin'
     */
    setUserMode(mode) {
      this.userMode = mode
      // Save to localStorage
      localStorage.setItem(`${globalConfig.LOCAL_STORAGE_PREFIX}userMode`, mode)
    },

    /**
     * Checks if the current user mode has access to a specific feature
     * @param {string} feature - Feature identifier to check access for
     * @returns {boolean} True if user has access, false otherwise
     */
    hasUserAccessToFeature(feature) {
      const basicFeatures = userModeConfig.basicFeatures
      if (basicFeatures.includes(feature)) {
        return true
      }

      if (this.userMode === 'admin') {
        return true
      } else if (this.userMode === 'expert') {
        const expertFeatures = userModeConfig.expertFeatures
        return expertFeatures.includes(feature)
      }

      return false
    },
  },
})
