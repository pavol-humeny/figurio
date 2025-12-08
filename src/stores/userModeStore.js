import { userModeConfig } from '@/config/userModeConfig'
import { defineStore } from 'pinia'
import { globalConfig } from '@/config/globalConfig.js'

/**
 * Store managing undo/redo history for image operations
 */
export const useUserModeStore = defineStore('userModeStore', {
  state: () => ({
    userMode: localStorage.getItem(`${globalConfig.LOCAL_STORAGE_PREFIX}userMode`) || 'basic', // 'basic', 'expert', 'admin'
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
  },
  actions: {
    /**
     * Set user mode
     * @param {string} mode - 'basic', 'expert', 'admin'
     */
    setUserMode(mode) {
      this.userMode = mode
      // Save to localStorage
      localStorage.setItem(`${globalConfig.LOCAL_STORAGE_PREFIX}userMode`, JSON.stringify(mode))
    },

    /**
     * Checks if the current user mode has access to a specific feature
     * @param {string} feature - Feature identifier to check access for
     * @returns {boolean} True if user has access, false otherwise
     */
    hasUserAccessToFeature(feature) {
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
