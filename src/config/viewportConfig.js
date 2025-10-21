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

  // Zoom mode - text
  defaultTextWidth: 15.2, // cm
  a4paperWidth: 21, // cm

  // Crop
  cropHandleSize: 20,
  cropHandleBorderMultiplier: 1 / 9,
  cropBorderMultiplier: 1 / 6,

  // Zoom mode - physical
  defaultPxPerCm: 96 / 2.54, // 1 cm = ~37.79 px @96DPI
}
