/**
 * @file: viewportConfig.js
 * @author: Pavol Humeny
 * @date: 15.5.2026
 * @description: Configuration for the viewport store. This module exports a `viewportConfig` object that contains various settings related to the viewport behavior in the image editor, such as default zoom levels, zoom speed, movement speed, scroll speed, and parameters for the crop tool and pixelation modes.
 */
export const viewportConfig = {
  defaultZoomLevel: 1.0, // 1 = 100%
  maxZoomLevel: 8.0,
  minZoomLevel: 0.1,
  zoomSpeed: 0.08, // Higher = faster zooming

  defaultZoomIn: 0.1, // 10% zoom in
  defaultZoomOut: 0.1, // 10% zoom out

  movementSpeed: 1, // Higher = faster panning

  scrollHorizontalSpeed: 3, // Smaller = slower scrolling
  scrollVerticalSpeed: 1, // Smaller = slower scrolling
  scrollSpeedMultiplierDefault: 2, // Default multiplier for scroll speed set by user for faster/slower scrolling

  fasterScrollMultiplier: 3, // Multiplier when ALT is held

  // Zoom mode - text
  defaultTextWidth: 15.2, // cm
  a4paperWidth: 21, // cm
  maxPhysicalContentSize: 300, // cm, maximum size of the content in physical units

  // Crop
  cropHandleSize: 20,
  cropHandleBorderMultiplier: 1 / 9,
  cropBorderMultiplier: 1 / 6,

  // Pixelate modes
  pixelateAutoZoomThreshold: 3.0, // Zoom level above which pixelation is applied in 'auto' mode

  // Zoom mode - physical
  defaultPxPerCm: 96 / 2.54, // 1 cm = ~37.79 px @96DPI

  rulerMarkSpacingPx: 30, // Desired spacing between ruler marks in pixels on screen

  viewportKeyboardMoveStep: 0.01, // Step size for keyboard panning as a fraction of the viewport size

  // Calibration
  cardWidthCm: 8.56,
  cardHeightCm: 5.398,
  minCalibrationFactor: 0.2,
  maxCalibrationFactor: 2.0,
  stepCalibrationFactor: 0.005,
}
