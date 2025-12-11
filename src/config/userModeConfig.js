export const userModeConfig = {
  /** List of all features with specific access */
  // 'fileSize',
  // 'fileDimensions',
  // 'unlimitedZoom',
  // 'numberOfOpenedFiles',
  // 'maxNumberOfFilesToUploadSimultaneously',
  listOfCommands: [
    'turn on <snowfall|christmasLights|christmasTree|randomEvents>', // Enable feature
    'turn off <snowfall|christmasLights|christmasTree|randomEvents>', // Disable feature
    'help', // Show help information
  ],

  commandManPages: {
    'turn on': `
      NAME
          turn on - Enable a specific feature

      SYNOPSIS
          turn on <snowfall|christmasLights|christmasTree|randomEvents>

      DESCRIPTION
          Enables the chosen feature:
            snowfall        Start snowfall effect
            christmasLights Turn on Christmas lights
            christmasTree   Show Christmas tree
            randomEvents    Enable all events
      `,
    'turn off': `
      NAME
          turn off - Disable a specific feature

      SYNOPSIS
          turn off <snowfall|christmasLights|christmasTree|randomEvents>

      DESCRIPTION
          Disables the chosen feature:
            snowfall        Stop snowfall effect
            christmasLights Turn off Christmas lights
            christmasTree   Hide Christmas tree
            randomEvents    Disable random events
      `,
    help: `
      NAME
          help - Display available commands

      SYNOPSIS
          help

      DESCRIPTION
          Shows a list of all available commands and their usage information.
      `,
  },

  /** List of features accessible to expert users */
  expertFeatures: ['fileSize', 'fileDimensions', 'unlimitedZoom'],

  /** Email to access command mode */
  commandModeEmail: 'ea14d625304b1a81ef42c3bf046630bf9307dd44e3f3e02e48a6cb8040173c3e',

  /** Passwords for different user modes */
  modePasswords: {
    adminMode: 'e7f4248325988555f785f0fb4908ee87a963c78cb7a6bc691782eff5f6de807e',
    expertMode: '9834876dcfb05cb167a5c24953eba58c4ac89b1adf57f28f2f9d09af107ee8f0',
  },
}
