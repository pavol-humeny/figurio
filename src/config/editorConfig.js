import { globalConfig } from '@/config/globalConfig'

export const editorConfig = {
  // Default tool key when the editor is opened
  defaultToolKey: globalConfig.startTool,

  // Auto crop settings
  autoCropDefaultColor: '#ffffff',
  autoCropThreshold: 0.35,

  // Item tip settings
  tipDelay: 700,

  // Context menu settings
  contextMenuDelay: 50,

  // Max file dimensions
  // Resize and crop limits
  maxFileDimensionWidth: 4000,
  maxFileDimensionHeight: 4000,

  // Max file size for uploads
  maxFileSize: 7, // in MB

  // Frame settings
  browserFrameDefaultSize: 0.005, // 0.5% of the bigger dimension
  phoneFrameDefaultSize: 0.01, // 1% of the bigger dimension
  frameHeaderFooterSize: 0.04, // 4% of the height
  minHeaderFooterMultiplier: 0.5, // Minimum multiplier for header/footer height
  maxHeaderFooterMultiplier: 5, // Maximum multiplier for header/footer height
  stepHeaderFooterMultiplier: 0.1, // Step for header/footer height multiplier

  // Presets
  localStoragePresetsKey: `${globalConfig.LOCAL_STORAGE_PREFIX}imageEditorPresets`,

  // Svg object wrapper
  resizerMultiplier: 0.9, // 1 - default size
  angleSnapTolerance: 5, // degrees
  rotationSensitivity: 1, // Higher = rotates faster, lower = slower
  snapEdgeThresholdCoefficient: 0.01, // 1% of the smaller dimension of the image (higher = more sensitive)
  snapOnlyWhenOverlapping: true, // Snap only when the object is overlapping with the other object
  minimumObjectSize: 2, // Minimum size of the object to be drawn
  magnifyAreaDefaultRadiusFromImage: 0.1, // 10% of smaller dimension
}
