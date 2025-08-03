export const globalConfig = {
  // Default language for the editor
  defaultLanguage: 'en',

  // Default theme for the editor
  defaultTheme: 'dark',

  // Supported languages
  supportedLanguages: ['en', 'sk', 'cz'],

  // Default tool to start with
  startTool: 'move',

  // Feature flags
  // UPDATE new tool
  featureFlags: {
    enableTools: {
      move: true,
      select: true,
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
    enableTutorial: true,
    enableImageLoad: true,
    notEnabledMessage: 'This feature is currently not available.',
  },
}
