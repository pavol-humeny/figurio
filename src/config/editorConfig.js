import { globalConfig } from '@/config/globalConfig'

export const editorConfig = {
  // Default tool key when the editor is opened
  defaultToolKey: globalConfig.startTool,

  // Crop settings
  autoCropThreshold: 0,
  minCropSize: 20,

  // Background removal settings
  defaultBackgroundColor: '#ffffff',
  defaultThreshold: 0.0,
  defaultAutoRemovalThreshold: 0.2,
  defaultManualToolSize: 10, // in pixels
  maxManualToolSizeCoefficient: 1, // 100% of the smaller image dimension
  minManualToolSize: 1, // in pixels
  cursorBorder: 'rgba(255, 0, 0, 1)',
  cursorResizingSensitivity: 2, // Higher = slower resizing, lower = faster
  removalHighlightColor: 'rgba(255, 0, 0, 1)',

  // Item tip settings
  tipDelay: 700,

  // Context menu settings
  contextMenuDelay: 50,

  // Max file dimensions
  // Resize and crop limits
  maxFileDimensionWidth: 4000,
  maxFileDimensionHeight: 4000,
  minFileDimensionWidth: 20,
  minFileDimensionHeight: 20,

  // File name restrictions
  maxFileNameLength: 50,

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
  objectResizingOverflow: true, // Allow resizing objects outside the image area
  needObjectOverlapToSnap: true, // Need the object to overlap to snap to edges

  // Text fonts
  textFontOptions: [
    { label: 'Courier New', value: 'Courier New' },
    { label: 'Times New Roman', value: 'Times New Roman' },
    { label: 'Helvetica', value: 'Helvetica' },
    // { label: 'Arial', value: 'Arial' },
    // { label: 'Georgia', value: 'Georgia' },
    // { label: 'Verdana', value: 'Verdana' },
    // { label: 'Tahoma', value: 'Tahoma' },
    // { label: 'Impact', value: 'Impact' },
    // { label: 'Comic Sans MS', value: 'Comic Sans MS' },

    // { label: 'Trebuchet MS', value: 'Trebuchet MS' },
    // { label: 'Palatino Linotype', value: 'Palatino Linotype' },
    // { label: 'Lucida Console', value: 'Lucida Console' },
    // { label: 'Lucida Sans Unicode', value: 'Lucida Sans Unicode' },
    // { label: 'Segoe UI', value: 'Segoe UI' },
    // { label: 'Gill Sans', value: 'Gill Sans' },
    // { label: 'Calibri', value: 'Calibri' },
    // { label: 'Cambria', value: 'Cambria' },
  ],

  // Stepper input
  stepperHoldTimeout: 400, // ms before starting to hold
  stepperHoldInterval: 50, // ms between each step when holding
}
