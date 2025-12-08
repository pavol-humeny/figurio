export const userModeConfig = {
  /** List of all features with specific access */
  // 'fileSize',
  // 'fileDimensions',
  // 'unlimitedZoom',
  // 'numberOfOpenedFiles',
  // 'maxNumberOfFilesToUploadSimultaneously',

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
