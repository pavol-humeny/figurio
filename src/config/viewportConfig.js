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

  // Zoom mode - physical
  defaultPxPerCm: 96 / 2.54, // 1 cm = ~37.79 px @96DPI

  // Noise analysis
  noiseThreshold: 0.05, // 5% noise level to show artifacts
  noiseTopThreshold: 0.6, // 60% noise level to skip analysis
  bgCoverageThreshold: 0.5, // 50% background coverage to run noise analysis
  colorDistanceThreshold: 15, // color distance from background considered as near-background
}
