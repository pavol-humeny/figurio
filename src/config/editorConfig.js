export const editorConfig = {
  // Smart crop settings
  smartCropDefaultColor: '#ffffff',
  smartCropColorTolerance: 5,

  tipDelay: 700,

  // Resize and crop limits
  maxFileDimensionWidth: 10000,
  maxFileDimensionHeight: 10000,

  // Frame settings
  browserFrameDefaultSize: 0.005, // 0.5% of the bigger dimension
  phoneFrameDefaultSize: 0.01, // 1% of the bigger dimension
  frameHeaderFooterSize: 0.04, // 4% of the height
  minHeaderFooterMultiplier: 0.5, // Minimum multiplier for header/footer height
  maxHeaderFooterMultiplier: 5, // Maximum multiplier for header/footer height
  stepHeaderFooterMultiplier: 0.1, // Step for header/footer height multiplier


  // Presets
  localStoragePresetsKey: 'imageEditorPresets',

  // Max file size for uploads
  maxFileSize: 10, // in MB
}
