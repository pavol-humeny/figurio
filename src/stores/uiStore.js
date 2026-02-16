import { defineStore } from 'pinia'
import { uiConfig } from '@/config/uiConfig'
import { globalConfig } from '@/config/globalConfig'

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
  let userUuid = localStorage.getItem(`${globalConfig.LOCAL_STORAGE_PREFIX}user_uuid`)
  if (!userUuid) {
    userUuid = generateUuid()
    localStorage.setItem(`${globalConfig.LOCAL_STORAGE_PREFIX}user_uuid`, userUuid)
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
    theme: getString(`${globalConfig.LOCAL_STORAGE_PREFIX}theme`, uiConfig.theme),

    /** Whether keyboard shortcuts are enabled */
    keyShortcutsEnabled: getBoolean(
      `${globalConfig.LOCAL_STORAGE_PREFIX}keyShortcutsEnabled`,
      uiConfig.keyShortcutsEnabled,
    ),

    /** Whether right panel is visible */
    rightPanelOpen: getBoolean(
      `${globalConfig.LOCAL_STORAGE_PREFIX}rightPanelOpen`,
      uiConfig.rightPanelOpen,
    ),
    /** Default width for right panel */
    rightPanelDefaultWidth: uiConfig.rightPanelDefaultWidth,
    /** Current width of right panel */
    rightPanelWidth: getNumber(
      `${globalConfig.LOCAL_STORAGE_PREFIX}rightPanelWidth`,
      uiConfig.rightPanelWidth,
    ),
    /** Minimum allowed width for right panel */
    rightPanelMinWidth: uiConfig.rightPanelMinWidth,
    /** Maximum allowed width for right panel */
    rightPanelMaxWidth: uiConfig.rightPanelMaxWidth,
    /** Width of collapse button for layout calculations */
    collapseButtonWidth: uiConfig.collapseButtonWidth,

    /** Whether the SVG objects list panel is displayed */
    svgObjectsListDisplayed: true,
    /** Height of the SVG objects list panel (in percentage of the right panel height) */
    svgObjectsListHeight: getNumber(
      `${globalConfig.LOCAL_STORAGE_PREFIX}svgObjectsListHeight`,
      uiConfig.svgObjectsListHeight,
    ),
    /** Default height of the SVG objects list panel */
    svgObjectsListDefaultHeight: uiConfig.svgObjectsListDefaultHeight,
    /** Minimum height of the SVG objects list panel */
    svgObjectsListMinHeight: uiConfig.svgObjectsListMinHeight,
    /** Maximum height of the SVG objects list panel */
    svgObjectsListMaxHeight: uiConfig.svgObjectsListMaxHeight,

    /** Whether rulers are shown in viewport */
    rulersEnabled: getBoolean(
      `${globalConfig.LOCAL_STORAGE_PREFIX}rulersEnabled`,
      uiConfig.rulersEnabled,
    ),

    /** Whether a loading overlay is shown */
    isLoading: false,

    /** Whether an applying overlay is shown */
    isApplying: false,

    /** Whether the app is switching between tabs */
    isSwitchingTab: 0,

    /** Whether a frame is being rendered - flag to not hide frame when changing it */
    isApplyingFrame: false,

    /** Whether the clicks should be blocked */
    blockClicks: true,

    /** Tutorial step */
    tutorialStep: getNumber(`${globalConfig.LOCAL_STORAGE_PREFIX}tutorialStep`, -1), // -1 = tutorial not started yet
    /** Whether the interactive tutorial is running */
    isTutorialRunning: false,
    /** Whether the interactive tutorial is completed */
    tutorialCompleted: getBoolean(`${globalConfig.LOCAL_STORAGE_PREFIX}tutorialCompleted`, false),

    /** Whether the tutorial should be started for the first time only after image is loaded*/
    tutorialShouldBeStartedForFirstTime: false,

    /** Background mode for viewport wrapper (normal | lightContrast | darkContrast) */
    viewportWrapperBackgroundMode: getString(
      `${globalConfig.LOCAL_STORAGE_PREFIX}viewportWrapperBackgroundMode`,
      'normal',
    ),

    /** Mode for pixelation (auto | always | never) */
    viewportPixelateMode: getString(
      `${globalConfig.LOCAL_STORAGE_PREFIX}viewportPixelateMode`,
      'auto',
    ),

    /** Whether any item tip is currently visible - use to show only one at the time */
    isItemTipVisible: false,

    /** Whether the dropdown is open */
    isDropdownOpen: false,

    /** Whether the cursor is over the viewport settings area and should change the cursor */
    cursorOverViewportSettings: false,
  }),
  actions: {
    /**
     * Toggle between dark and light theme
     */
    toggleTheme() {
      this.theme = this.theme === 'dark' ? 'light' : 'dark'
      localStorage.setItem(`${globalConfig.LOCAL_STORAGE_PREFIX}theme`, this.theme)
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
      localStorage.setItem(
        `${globalConfig.LOCAL_STORAGE_PREFIX}keyShortcutsEnabled`,
        this.keyShortcutsEnabled.toString(),
      )
    },

    /**
     * Enable or disable viewport rulers
     * @param {boolean} value
     */
    setRulers(value) {
      this.rulersEnabled = value
      localStorage.setItem(
        `${globalConfig.LOCAL_STORAGE_PREFIX}rulersEnabled`,
        this.rulersEnabled.toString(),
      )
    },

    /**
     * Toggle visibility of the right panel
     */
    toggleRightPanel() {
      this.rightPanelOpen = !this.rightPanelOpen
      localStorage.setItem(
        `${globalConfig.LOCAL_STORAGE_PREFIX}rightPanelOpen`,
        this.rightPanelOpen.toString(),
      )
    },

    /**
     * Set width of the right panel and persist it
     * @param {number} width
     */
    setRightPanelWidth(width) {
      if (width >= this.rightPanelMaxWidth) {
        width = this.rightPanelMaxWidth
      }

      this.rightPanelWidth = width
      localStorage.setItem(
        `${globalConfig.LOCAL_STORAGE_PREFIX}rightPanelWidth`,
        this.rightPanelWidth.toString(),
      )
    },

    /**
     * Set width of the right panel only if tabs do not fit in the panel
     * @param {number} width - Width to set
     */
    setRightPanelWidthIfTabsDoNotFit(width) {
      if (width > this.rightPanelWidth) {
        this.setRightPanelWidth(width)
        this.rightPanelDefaultWidth = width
        this.rightPanelMinWidth = width
      } else {
        // this.setRightPanelWidth(this.rightPanelDefaultWidth)
        this.rightPanelDefaultWidth = uiConfig.rightPanelDefaultWidth
        this.rightPanelMinWidth = uiConfig.rightPanelMinWidth
      }
    },

    /**
     * Reset right panel width to default and persist it
     */
    resetRightPanelWidth() {
      this.rightPanelWidth = this.rightPanelDefaultWidth
      localStorage.setItem(
        `${globalConfig.LOCAL_STORAGE_PREFIX}rightPanelWidth`,
        this.rightPanelWidth.toString(),
      )
    },

    /**
     * Set height of the SVG objects list panel and persist it
     * @param {number} height - Height in percentage
     */
    setSvgObjectsListHeight(height) {
      if (height >= this.svgObjectsListMaxHeight) {
        height = this.svgObjectsListMaxHeight
      } else if (height <= this.svgObjectsListMinHeight) {
        height = this.svgObjectsListMinHeight
      }

      this.svgObjectsListHeight = height
      localStorage.setItem(
        `${globalConfig.LOCAL_STORAGE_PREFIX}svgObjectsListHeight`,
        this.svgObjectsListHeight.toString(),
      )
    },

    /**
     * Reset the height of the SVG objects list panel to the default value
     */
    resetSvgObjectsListHeight() {
      this.svgObjectsListHeight = this.svgObjectsListDefaultHeight
      localStorage.setItem(
        `${globalConfig.LOCAL_STORAGE_PREFIX}svgObjectsListHeight`,
        this.svgObjectsListHeight.toString(),
      )
    },

    /**
     * Set the current tutorial step
     * @param {number} step - The step number to set
     */
    setTutorialStep(step) {
      this.tutorialStep = step
      localStorage.setItem(
        `${globalConfig.LOCAL_STORAGE_PREFIX}tutorialStep`,
        this.tutorialStep.toString(),
      )
    },

    /**
     * Mark the tutorial as completed
     * @param {boolean} value - Whether the tutorial is completed
     */
    setTutorialCompleted(value) {
      this.tutorialCompleted = value
      localStorage.setItem(
        `${globalConfig.LOCAL_STORAGE_PREFIX}tutorialCompleted`,
        this.tutorialCompleted.toString(),
      )
    },

    /**
     * Set background mode for viewport wrapper (normal | lightContrast | darkContrast)
     * @param {string} mode - Background mode
     */
    setViewportWrapperBackgroundMode(mode) {
      this.viewportWrapperBackgroundMode = mode
      localStorage.setItem(
        `${globalConfig.LOCAL_STORAGE_PREFIX}viewportWrapperBackgroundMode`,
        this.viewportWrapperBackgroundMode,
      )
    },

    /**
     * Set mode for showing pixel grid (auto | always | never)
     * @param {string} mode - Pixel grid mode
     */
    setViewportPixelateMode(mode) {
      this.viewportPixelateMode = mode
      localStorage.setItem(
        `${globalConfig.LOCAL_STORAGE_PREFIX}viewportPixelateMode`,
        this.viewportPixelateMode,
      )
    },
  },
})
