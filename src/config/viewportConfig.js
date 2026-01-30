export const viewportConfig = {
  defaultZoomLevel: 1.0, // 1 = 100%
  maxZoomLevel: 8.0,
  minZoomLevel: 0.1,
  zoomSpeed: 0.08, // Higher = faster zooming

  defaultZoomIn: 0.1, // 10% zoom in
  defaultZoomOut: 0.1, // 10% zoom out

  movementSpeed: 1, // Higher = faster panning

  scrollHorizontalSpeed: 3, // Smaller = slower scrolling
  scrollVerticalSpeed: 3, // Smaller = slower scrolling

  fasterScrollMultiplier: 3, // Multiplier when ALT is held

  // Zoom mode - text
  defaultTextWidth: 15.2, // cm
  a4paperWidth: 21, // cm

  // Crop
  cropHandleSize: 20,
  cropHandleBorderMultiplier: 1 / 9,
  cropBorderMultiplier: 1 / 6,

  // Pixelate modes
  pixelateAutoZoomThreshold: 3.0, // Zoom level above which pixelation is applied in 'auto' mode

  // Zoom mode - physical
  defaultPxPerCm: 96 / 2.54, // 1 cm = ~37.79 px @96DPI

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
