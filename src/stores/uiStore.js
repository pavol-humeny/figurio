import { defineStore } from 'pinia'
import { uiConfig } from '@/config/uiConfig'

/**
 * Retrieves a boolean value from localStorage.
 * Returns `false` only if the stored value is the string `'false'`, otherwise returns the fallback.

 *
 * @param {string} key - The localStorage key to read from.
 * @param {boolean} [fallback=true] - The default value if the key is not set.
 * @returns {boolean} The parsed boolean value.
 */
const getBoolean = (key, fallback = true) => {
  const value = localStorage.getItem(key)
  return value === 'false' ? false : value === 'true' ? true : fallback
}

/**
 * Retrieves a number from localStorage and parses it as an integer.
 *
 * @param {string} key - The localStorage key to read from.
 * @param {number} fallback - The default number if the stored value is invalid.
 * @returns {number} The parsed number or the fallback.
 */
const getNumber = (key, fallback) => {
  const value = parseInt(localStorage.getItem(key), 10)
  return isNaN(value) ? fallback : value
}

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
 * Generates a random UUID (Universally Unique Identifier) version 4.
 * @returns {string} A UUID v4 string.
 */
const generateUuid = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

/**
 * Retrieves the user UUID from localStorage or generates a new one.
 * @returns {string} A UUID string.
 */
const getUuid = () => {
  let userUuid = localStorage.getItem('user_uuid')
  console.log('User UUID:', userUuid) // Debugging line to check the UUID
  if (!userUuid) {
    userUuid = generateUuid()
    localStorage.setItem('user_uuid', userUuid)
  }
  return userUuid
}

/**
 * Store managing UI settings and state
 */
export const useUiStore = defineStore('ui', {
  state: () => ({
    userUuid: getUuid(), // Unique identifier for the UI instance

    /** Active theme (dark | light) */
    theme: getString('theme', uiConfig.theme),

    /** Whether keyboard shortcuts are enabled */
    keyShortcutsEnabled: getBoolean('keyShortcutsEnabled', uiConfig.keyShortcutsEnabled),

    /** Whether right panel is visible */
    rightPanelOpen: getBoolean('rightPanelOpen', uiConfig.rightPanelOpen),
    /** Default width for right panel */
    rightPanelDefaultWidth: uiConfig.rightPanelDefaultWidth,
    /** Current width of right panel */
    rightPanelWidth: getNumber('rightPanelWidth', uiConfig.rightPanelWidth),
    /** Minimum allowed width for right panel */
    rightPanelMinWidth: uiConfig.rightPanelMinWidth,
    /** Maximum allowed width for right panel */
    rightPanelMaxWidth: uiConfig.rightPanelMaxWidth,
    /** Width of collapse button for layout calculations */
    collapseButtonWidth: uiConfig.collapseButtonWidth,

    /** Whether rulers are shown in viewport */
    rulersEnabled: getBoolean('rulersEnabled', uiConfig.rulersEnabled),

    /** Whether a loading overlay is shown */
    isLoading: false,

    /** Whether the clicks should be blocked */
    blockClicks: true,

    /** Tutorial step */
    tutorialStep: getNumber('tutorialStep', -1),
    /** Whether the interactive tutorial is running */
    isTutorialRunning: false,
    /** Whether the interactive tutorial is completed */
    tutorialCompleted: getBoolean('tutorialCompleted', false),
  }),
  actions: {
    /**
     * Toggle between dark and light theme
     */
    toggleTheme() {
      this.theme = this.theme === 'dark' ? 'light' : 'dark'
      localStorage.setItem('theme', this.theme)
      document.documentElement.className = this.theme
    },

    /**
     * Initialize app settings (theme class)
     */
    initApp() {
      // Init theme
      document.documentElement.className = this.theme
    },

    /**
     * Enable or disable keyboard shortcuts
     * @param {boolean} value
     */
    setKeyShortcuts(value) {
      this.keyShortcutsEnabled = value
      localStorage.setItem('keyShortcutsEnabled', this.keyShortcutsEnabled.toString())
    },

    /**
     * Enable or disable viewport rulers
     * @param {boolean} value
     */
    setRulers(value) {
      this.rulersEnabled = value
      localStorage.setItem('rulersEnabled', this.rulersEnabled.toString())
    },

    /**
     * Toggle visibility of the right panel
     */
    toggleRightPanel() {
      this.rightPanelOpen = !this.rightPanelOpen
      localStorage.setItem('rightPanelOpen', this.rightPanelOpen.toString())
    },

    /**
     * Set width of the right panel and persist it
     * @param {number} width
     */
    setRightPanelWidth(width) {
      this.rightPanelWidth = width
      localStorage.setItem('rightPanelWidth', this.rightPanelWidth.toString())
    },

    /**
     * Set width of the right panel only if tabs do not fit in the panel
     * @param {number} width - Width to set
     */
    setRightPanelWidthIfTabsDoNotFit(width) {
      if (width > this.rightPanelWidth) {
        this.setRightPanelWidth(width)
        this.rightPanelDefaultWidth = width
      } else {
        this.setRightPanelWidth(this.rightPanelDefaultWidth)
        this.rightPanelDefaultWidth = uiConfig.rightPanelDefaultWidth
      }
    },

    /**
     * Reset right panel width to default and persist it
     */
    resetRightPanelWidth() {
      this.rightPanelWidth = this.rightPanelDefaultWidth
      localStorage.setItem('rightPanelWidth', this.rightPanelWidth.toString())
    },

    /**
     * Set the current tutorial step
     * @param {number} step - The step number to set
     */
    setTutorialStep(step) {
      this.tutorialStep = step
      localStorage.setItem('tutorialStep', this.tutorialStep.toString())
    },

    /**
     * Mark the tutorial as completed
     * @param {boolean} value - Whether the tutorial is completed
     */
    setTutorialCompleted(value) {
      this.tutorialCompleted = value
      localStorage.setItem('tutorialCompleted', this.tutorialCompleted.toString())
    },
  },
})
