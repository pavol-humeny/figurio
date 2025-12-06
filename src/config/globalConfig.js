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
  startTool: '',

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

  // List of feature tour video identifiers to show in the feature tour modal
  listOfFeatureTourVideos: ['cropTool', 'brushTool', 'shapeTool'],
  // Whether to update the list of seen feature tour videos on app version change
  updateFeatureTourVideos: true,
  // List of feature tour video identifiers to remove from seen on app version change
  listOfFeatureTourVideosToRemoveFromSeen: [], // Features which should be shown again

  // Max number of files to upload simultaneously
  maxNumberOfFilesToUploadSimultaneously: 1, // To avoid issues with image analysis on load

  // API
  API_BASE: 'https://figurio.online',
  // If usage stats should be sent to the API
  sendUsageStats: true,
  // If usage stats should be sent when running on localhost
  sendUsageStatsOnLocalhost: false,

  // LocalStorage prefix
  LOCAL_STORAGE_PREFIX: 'figurio_',

  // Maximum open files
  maxNumberOfOpenFiles: 10,

  // Admin mode
  adminMode: {
    email: 'ea14d625304b1a81ef42c3bf046630bf9307dd44e3f3e02e48a6cb8040173c3e',
    subject: 'e9fce340e4152169c513115fb6fa3abc6f41fb6952829a01a08413f6ffd13f38',
    message: 'e7f4248325988555f785f0fb4908ee87a963c78cb7a6bc691782eff5f6de807e',
    logOutSubject: 'su user',
  },
}
