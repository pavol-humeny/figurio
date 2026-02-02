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

  // Brush commit time
  brushCommitDelay: 50, // in ms

  // Item tip settings
  tipDelay: 700,
  tipDelayHide: 70,

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
  maxPdfFileSize: 70, // in MB

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
  snapOnlyWhenOverlapping: true, // Snap only when the object is overlapping with the other object // DO NOT CHANGE - change needObjectOverlapToSnap
  minimumObjectSize: 2, // Minimum size of the object to be drawn
  magnifyAreaDefaultRadiusFromImage: 0.1, // 10% of smaller dimension
  objectResizingOverflow: true, // Allow resizing objects outside the image area
  needObjectOverlapToSnap: false, // Need the object to overlap to snap to edges
  axisLockHysteresis: 1.2, // ratio to switch axis (tolerance for natural feel)
  axisLockMinDelta: 5, // minimum delta in pixels to trigger axis lock

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
  maxTextLength: 500, // Maximum number of characters in a text object

  // Hold button settings
  holdButtonTimeout: 400, // ms before starting to hold
  holdButtonInterval: 50, // ms between each call when holding

  applyingLoadingShowDelay: 300, // ms delay before showing applying loading spinner

  maxRecentColors: 14, // Maximum number of recent colors to store
  minRecentColors: 7, // Minimum number of recent colors to store

  // Noise analysis
  bgCoverageThreshold: 0.5, // 50% background coverage to run noise analysis
  colorDistanceThreshold: 15, // color distance from background considered as near-background
  borderSize: 8, // Size of the border in pixels for border noise analysis
  borderCoverageThreshold: 0.8, // 80 % of the border must be background color

  // Minimum Laplacian response required for a pixel to be considered a high-frequency candidate (edge or noise).
  // Lower values make detection more sensitive (more pixels detected),
  // higher values make it stricter (fewer detections).
  laplacianThreshold: 2,

  // Maximum number of neighboring pixels (in a 3×3 neighborhood) that are allowed to also have a strong Laplacian response.
  // This is used to distinguish isolated noise pixels from real edges.
  // 0   → only completely isolated pixels are detected (very strict)
  // 1–2 → small clusters / compression halos are detected (recommended)
  // 3+  → real edges may start being detected as noise
  maxStrongNeighbors: 4,

  // Minimum ratio of detected noisy pixels relative to the total image pixel count required to trigger a noise warning.
  // Lower values → more warnings (higher sensitivity)
  // Higher values → fewer warnings (more tolerant)
  minNoisyPixelsRatio: 0.003, // 0.3%
}
