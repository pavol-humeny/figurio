export const globalConfig = {
  // Default language for the editor
  defaultLanguage: 'sk',

  // Supported languages
  supportedLanguages: ['en', 'cz', 'sk'],

  // Feature flags
  // UPDATE new tool
  featureFlags: {
    enableTools: {
      move: true,
      select: false,
      transform: true,
      smartCrop: true,
      grayscale: true,
      blur: true,
      shape: true,
      text: true,
      magnifyArea: true,
      frame: true,
      preset: true,
      export: true,
    },
    enableTutorial: false,
    enableImageLoad: true,
    notEnabledMessage: 'This feature is currently not available.',
  },
}
