/**
 * @file: globalConfig.js
 * @author: Pavol Humeny
 * @date: 15.5.2026
 * @description: Global configuration for the application. This module exports a `globalConfig` object that contains various settings and constants used throughout the app, such as contact information, console logging preferences, feature flags, modal settings, API base URL, usage statistics settings, and localStorage keys.
 */
export const globalConfig = {
  // Contact email
  contactMail: 'pavol.humeny@gmail.com',

  // Console prints
  console: {
    log: true,
    warn: true,
    error: true,
  },

  // If app is running
  isRunning: true,

  // What to reset on version change
  resetOnVersionChange: {
    resetPreferences: false, // Reset localStorage preferences
    resetPresets: false, // Reset user presets
    resetTutorialProgress: false, // Reset tutorial progress
  },

  // Default language for the editor
  defaultLanguage: 'en',

  // Default theme for the editor
  defaultTheme: 'dark',

  // Supported languages
  supportedLanguages: ['en', 'sk', 'cz'],

  // Default zoom mode
  zoomMode: 'classic', // 'classic', 'physical'
  physicalContentSize: 21, // cm
  calibrationFactor: 1, // calibration factor for physical mode

  // Default tool to start with
  startTool: '',

  // Feature flags
  // UPDATE new tool
  featureFlags: {
    enableTools: {
      crop: true,
      frame: true,
      grayscale: true,
      backgroundRemoval: true,
      brush: true,
      select: true,
      blur: true,
      shape: true,
      text: true,
      magnifyArea: true,
      transform: true,
      preset: true,
      export: true,
    },
    enableNoiseDetectionOnStart: true,
    enableImageLoad: true,
    notEnabledMessage: 'This feature is currently not available.',
  },

  // Modal settings
  modalSettings: {
    enableTutorial: true,
    enableUnexpectedErrorModal: false,
    showFeatureTourModalOnStart: true,
    showWarningWindowSize: false,
    showWarningSafariBrowser: false,
    blockDeveloperTools: false,
    blockZooming: false,
  },

  // Random events configuration
  // UPDATE new random event
  randomEvents: {
    snowfall: false,
    christmasLights: false,
    christmasTree: false,
    fireworks: false,
    fireworks2: false,
  },

  // List of feature tour video identifiers in the order they should be shown
  listOfFeatureTourVideos: [
    'imageAnalysis',
    'crop',
    'frame',
    'createPreset',
    'myPreset',
    'blur',
    'magnifyArea',
  ],
  // Whether to update the list of seen feature tour videos on app version change
  updateFeatureTourVideos: true,
  // List of feature tour video identifiers to remove from seen on app version change
  listOfFeatureTourVideosToRemoveFromSeen: [], // Features which should be shown again
  // Number of times to skip auto open the feature tour modal
  numberOfFeatureTourCloses: 10,

  // API
  API_BASE: 'https://figurio.online',

  // Usage stats settings
  usageStatsSettings: {
    // If usage stats should be sent to the API
    sendUsageStats: true,
    // If usage stats should be sent when running on localhost
    sendUsageStatsOnLocalhost: false,
    // If visit during maintenance email should be sent
    sendVisitDuringMaintenanceEmail: true,
    // Heartbeat interval in ms
    heartbeatInterval: 30000,
    // Max inactivity time in ms before heartbeat stops
    maxInactivityTime: 300000, // 5 minutes
  },

  // LocalStorage prefix
  LOCAL_STORAGE_PREFIX: 'figurio_',

  // Maximum open file simultaneously
  maxNumberOfOpenFiles: 10,

  // Max number of files to upload simultaneously
  maxNumberOfFilesToUploadSimultaneously: 5, // To avoid issues with image analysis on load
}
