import { defineStore } from 'pinia'
import { viewportConfig } from '@/config/viewportConfig'
import { useMath } from '@/composables/common/useMath'

const { round } = useMath()

/**
 * Store managing the viewport settings
 */
export const useViewportStore = defineStore('viewportStore', {
  state: () => ({
    /** Reference to the .viewport-content element */
    viewportContentRect: {},

    /** Current zoom level of the viewport */
    zoomLevel: viewportConfig.defaultZoomLevel,
    /** Zoom level when the image fits the viewport */
    fitZoomLevel: 1.0,
    /** Default zoom level for resetting */
    defaultZoomLevel: viewportConfig.defaultZoomLevel,
    /** Maximum zoom level allowed */
    maxZoomLevel: viewportConfig.maxZoomLevel,
    /** Minimum zoom level allowed */
    minZoomLevel: viewportConfig.minZoomLevel,
    /** Speed of zooming in/out */
    zoomSpeed: viewportConfig.zoomSpeed,
    /** Default zoom speed for resetting */
    defaultZoomSpeed: viewportConfig.zoomSpeed,

    /** Current pan offset in X direction */
    panX: 0,
    panY: 0,
    /** Speed of panning movement */
    movementSpeed: viewportConfig.movementSpeed,
    /** Default speed of panning movement for resetting */
    defaultMovementSpeed: viewportConfig.movementSpeed,

    /** Default pan offset for resetting */
    defaultPanX: 0,
    defaultPanY: 0,

    /** Whether the viewport should fit to screen */
    shouldFitToScreen: false,

    /** Whether to fit the image on load */
    fitImageOnLoad: true,

    /** Guide lines*/
    guideLine: null, // { centerX: number, centerY: number, angle: number } - Center point and angle of the guide line

    /** Zoom mode */
    zoomMode: 'classic', // 'classic', 'text'
    /** Text size */
    textWidth: 15.2, // cm
  }),
  getters: {
    /**
     * Real zoom level based on fitted image zoom
     * @returns {number}
     */
    realZoomLevel(state) {
      return state.zoomLevel / state.fitZoomLevel
    },
  },
  actions: {
    /**
     * Set the current zoom level, rounded to 2 decimal places.
     * @param {number} level
     */
    setZoomLevel(level) {
      this.zoomLevel = round(level, 2)
    },

    /**
     * Set the current zoom level keeping the center of the image fixed in the viewport.
     * @param {number} level
     */
    // setZoomLevel(level) {
    //   const centerX = this.viewportContentRect.width / 2
    //   const centerY = this.viewportContentRect.height / 2

    //   // Middle point in image coordinates (before zoom change)
    //   const imageCenterX = (centerX - this.panX) / this.zoomLevel
    //   const imageCenterY = (centerY - this.panY) / this.zoomLevel

    //   const clampedZoom = round(Math.min(Math.max(level, this.minZoomLevel), this.maxZoomLevel), 2)

    //   // Adjust pan to keep the same image center
    //   this.panX = centerX - imageCenterX * clampedZoom
    //   this.panY = centerY - imageCenterY * clampedZoom

    //   this.zoomLevel = clampedZoom
    // },

    /**
     * Zoom in by increasing zoom level using zoomSpeed.
     */
    zoomIn() {
      const newZoomLevel = this.zoomLevel * (1 + this.zoomSpeed)
      this.zoomLevel = round(Math.min(newZoomLevel, this.maxZoomLevel), 2)
    },

    /**
     * Zoom out by decreasing zoom level using zoomSpeed.
     */
    zoomOut() {
      const newZoomLevel = this.zoomLevel / (1 + this.zoomSpeed)
      this.zoomLevel = round(Math.max(newZoomLevel, this.minZoomLevel), 2)
    },

    /**
     * Reset zoom to the default value.
     */
    resetZoom() {
      this.zoomLevel = this.defaultZoomLevel
    },

    /**
     * Reset zoom speed to the default value.
     */
    resetZoomSpeed() {
      this.zoomSpeed = this.defaultZoomSpeed
    },

    /**
     * Reset pan (movement) speed to the default.
     */
    resetMovementSpeed() {
      this.movementSpeed = this.defaultMovementSpeed
    },

    /**
     * Set pan (scroll) position.
     * @param {number} x
     * @param {number} y
     */
    setPan(x, y) {
      this.panX = x
      this.panY = y
    },

    /**
     * Reset pan position to default values.
     */
    resetPan() {
      this.panX = this.defaultPanX
      this.panY = this.defaultPanY
    },

    reset() {
      this.zoomLevel = this.defaultZoomLevel
      this.fitZoomLevel = 1.0
      this.panX = this.defaultPanX
      this.panY = this.defaultPanY
      this.zoomSpeed = this.defaultZoomSpeed
      this.movementSpeed = this.defaultMovementSpeed
      this.shouldFitToScreen = false
      this.fitImageOnLoad = true
    },

    /**
     * Get full snapshot of viewport state (for multi-file support)
     * @returns {object}
     */
    getFullSnapshot() {
      return {
        zoomLevel: this.zoomLevel,
        fitZoomLevel: this.fitZoomLevel,
        defaultZoomLevel: this.defaultZoomLevel,
        maxZoomLevel: this.maxZoomLevel,
        minZoomLevel: this.minZoomLevel,
        zoomSpeed: this.zoomSpeed,
        defaultZoomSpeed: this.defaultZoomSpeed,
        panX: this.panX,
        panY: this.panY,
        movementSpeed: this.movementSpeed,
        defaultMovementSpeed: this.defaultMovementSpeed,
        defaultPanX: this.defaultPanX,
        defaultPanY: this.defaultPanY,
        shouldFitToScreen: this.shouldFitToScreen,
        fitImageOnLoad: this.fitImageOnLoad,
      }
    },

    /**
     * Apply a full viewport snapshot (for multi-file support)
     * @param {object} snapshot - Snapshot to restore
     */
    applyFullSnapshot(snapshot) {
      this.zoomLevel = snapshot.zoomLevel ?? this.defaultZoomLevel
      this.fitZoomLevel = snapshot.fitZoomLevel ?? 1.0
      this.defaultZoomLevel = snapshot.defaultZoomLevel ?? viewportConfig.defaultZoomLevel
      this.maxZoomLevel = snapshot.maxZoomLevel ?? viewportConfig.maxZoomLevel
      this.minZoomLevel = snapshot.minZoomLevel ?? viewportConfig.minZoomLevel
      this.zoomSpeed = snapshot.zoomSpeed ?? viewportConfig.zoomSpeed
      this.defaultZoomSpeed = snapshot.defaultZoomSpeed ?? viewportConfig.zoomSpeed
      this.panX = snapshot.panX ?? 0
      this.panY = snapshot.panY ?? 0
      this.movementSpeed = snapshot.movementSpeed ?? viewportConfig.movementSpeed
      this.defaultMovementSpeed = snapshot.defaultMovementSpeed ?? viewportConfig.movementSpeed
      this.defaultPanX = snapshot.defaultPanX ?? 0
      this.defaultPanY = snapshot.defaultPanY ?? 0
      this.shouldFitToScreen = snapshot.shouldFitToScreen ?? false
      this.fitImageOnLoad = snapshot.fitImageOnLoad ?? true
    },
  },
})
