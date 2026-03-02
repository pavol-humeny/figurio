export const userModeConfig = {
  // UPDATE new random event
  listOfCommands: [
    'turn on <snowfall|christmasLights|christmasTree|fireworks|fireworks2|randomEvents>', // Enable feature
    'turn off <snowfall|christmasLights|christmasTree|fireworks|fireworks2|randomEvents>', // Disable feature
    'set <option> <value>', // Set configuration option
    'reset <option>', // Reset configuration option
    'reset all', // Reset all configuration options
    'help', // Show help information
    'quit', // Exit command mode
    'man <command>', // Show manual page for a specific command
    'permissions', // Show permissions for expert and admin users
  ],

  autocomplete: {
    root: ['help', 'man', 'turn', 'set', 'reset', 'clear', 'quit', 'permissions'],
    turn: ['on', 'off'],
    'turn on': [
      'snowfall',
      'christmasLights',
      'christmasTree',
      'fireworks',
      'fireworks2',
      'randomEvents',
    ],
    'turn off': [
      'snowfall',
      'christmasLights',
      'christmasTree',
      'fireworks',
      'fireworks2',
      'randomEvents',
    ],
    set: ['primaryColor'],
    reset: ['primaryColor', 'all'],
    man: ['turn on', 'turn off', 'set', 'reset', 'reset all', 'help', 'quit', 'man', 'permissions'],
  },

  commandManPages: {
    'turn on': `
      NAME
          turn on - Enable a specific feature

      SYNOPSIS
          turn on <snowfall|christmasLights|christmasTree|fireworks|randomEvents>

      DESCRIPTION
          Enables the chosen feature:
            snowfall        Start snowfall effect
            christmasLights Turn on Christmas lights
            christmasTree   Show Christmas tree
            fireworks       Start fireworks display
            randomEvents    Enable all events
      `,
    'turn off': `
      NAME
          turn off - Disable a specific feature

      SYNOPSIS
          turn off <snowfall|christmasLights|christmasTree|fireworks|randomEvents>

      DESCRIPTION
          Disables the chosen feature:
            snowfall        Stop snowfall effect
            christmasLights Turn off Christmas lights
            christmasTree   Hide Christmas tree
            fireworks       Stop fireworks display
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
    set: `
      NAME
          set - Set a configuration option

      SYNOPSIS
          set <option> <value>

      DESCRIPTION
          Available options:
            primaryColor <color>   Set the primary color of the application (e.g., #ff0000)

      `,
    reset: `
      NAME
          reset - Reset a configuration option

      SYNOPSIS
          reset <option>

      DESCRIPTION
          Available options:
            primaryColor   Reset the primary color to default
      `,
    'reset all': `
      NAME
          reset all - Reset all configuration options to default

      SYNOPSIS
          reset all

      DESCRIPTION
          Resets all configuration options back to their default values.
      `,
    quit: `
      NAME
          quit - Exit command mode

      SYNOPSIS
          quit

      DESCRIPTION
          Exits the command mode and returns to normal application operation.
      `,
    permissions: `
      NAME
          permissions - Show user mode permissions

      SYNOPSIS
          permissions

      DESCRIPTION
          Displays the features and commands accessible to the current user mode (expert, admin).
      `,
  },

  /** List of features accessible to admin users */
  adminFeatures: ['numberOfOpenedFiles', 'maxNumberOfFilesToUploadSimultaneously'],

  /** List of features accessible to expert users */
  expertFeatures: [
    'fileSize',
    'fileDimensions',
    'unlimitedZoom',
    'notShowUnexpectedErrorModal',
    // 'statistics',
    'blockedTools',
    'notBlockDevTools',
    'maxNumberOfOpenFiles',
    'doNotShowInitialWarnings',
  ],

  /** List of features accessible to basic users */
  basicFeatures: ['statistics'],

  /** Email to access command mode */
  commandModeEmail: 'ea14d625304b1a81ef42c3bf046630bf9307dd44e3f3e02e48a6cb8040173c3e',

  /** Passwords for different user modes */
  modePasswords: {
    adminMode: 'e7f4248325988555f785f0fb4908ee87a963c78cb7a6bc691782eff5f6de807e',
    expertMode: '9834876dcfb05cb167a5c24953eba58c4ac89b1adf57f28f2f9d09af107ee8f0',
  },
}
