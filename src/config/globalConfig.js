export const globalConfig = {
  // Console prints
  console: {
    log: true,
    warn: true,
    error: true,
  },

  // If app is running
  isRunning: true,

  // Reset preferences on new version
  resetPreferencesOnVersionChange: false,

  // Reset tutorial progress on new version
  resetTutorialOnVersionChange: false,

  // Default language for the editor
  defaultLanguage: 'en',

  // Default theme for the editor
  defaultTheme: 'dark',

  // Supported languages
  supportedLanguages: ['en', 'sk', 'cz'],

  // Default zoom mode
  zoomMode: 'classic', // 'classic', 'physical'
  physicalContentSize: 15.2, // cm
  calibrationFactor: 1, // calibration factor for physical mode

  // Default tool to start with
  startTool: 'shape',

  // Feature flags
  // UPDATE new tool
  featureFlags: {
    enableTools: {
      crop: true,
      backgroundRemoval: true,
      select: true,
      brush: true,
      transform: true,
      autoCrop: true,
      grayscale: true,
      blur: true,
      shape: true,
      text: true,
      magnifyArea: true,
      frame: true,
      preset: true,
      export: true,
    },
    enableNoiseDetectionOnStart: true,
    enableTutorial: true,
    enableImageLoad: true,
    notEnabledMessage: 'This feature is currently not available.',
  },

  // Max number of files to upload simultaneously
  maxNumberOfFilesToUploadSimultaneously: 5,

  // API
  // API_BASE: 'https://bp-api-ft1e.onrender.com',
  // API_BASE: 'https://139.59.143.44:3000',
  API_BASE: 'https://104.248.248.66:3000',
  // If usage stats should be sent to the API
  sendUsageStats: true,
  // If usage stats should be sent when running on localhost
  sendUsageStatsOnLocalhost: false,

  // LocalStorage prefix
  LOCAL_STORAGE_PREFIX: 'figurio_',

  // Maximum open files
  maxNumberOfOpenFiles: 10,
}
