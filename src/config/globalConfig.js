export const globalConfig = {
  // If app is running
  isRunning: true,

  // Default language for the editor
  defaultLanguage: 'en',

  // Default theme for the editor
  defaultTheme: 'dark',

  // Supported languages
  supportedLanguages: ['en', 'sk', 'cz'],

  // Default zoom mode
  zoomMode: 'text', // 'classic', 'text'
  textWidth: 15.2, // cm

  // Default tool to start with
  startTool: '',

  // Feature flags
  // UPDATE new tool
  featureFlags: {
    enableTools: {
      crop: true,
      select: true,
      transform: true,
      autoCrop: true,
      grayscale: true,
      blur: false,
      shape: true,
      text: true,
      magnifyArea: true,
      frame: true,
      preset: true,
      export: true,
    },
    enableTutorial: true,
    enableImageLoad: true,
    notEnabledMessage: 'This feature is currently not available.',
  },

  // API
  API_BASE: 'https://bp-api-ft1e.onrender.com',

  // LocalStorage prefix
  LOCAL_STORAGE_PREFIX: 'edit_4_doc_',
}
