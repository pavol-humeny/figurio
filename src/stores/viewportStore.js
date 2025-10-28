import { defineStore } from 'pinia'
import { viewportConfig } from '@/config/viewportConfig'
import { useMath } from '@/composables/common/useMath'
import { globalConfig } from '@/config/globalConfig'
import { nextTick } from 'vue'
import { useUiStore } from '@/stores/uiStore'
import { useConsole } from '@/composables/common/useConsole.js'
const { warn } = useConsole()

const { round } = useMath()

/**
 * Retrieves a string from localStorage.
 *
 * @param {string} key - The localStorage key to read from.
 * @param {string} fallback - The default value if the key is not found.
 * @returns {string} The stored string or the fallback.
 */
const getString = (key, fallback) => {
  const value = localStorage.getItem(key)
  return value !== null ? value : fallback
}

/**
 * Retrieves a number from localStorage.
 * @param {string} key - The localStorage key to read from.
 * @param {number} fallback - The default number if the stored value is invalid.
 * @returns {number} The parsed number or the fallback.
 */
const getNumber = (key, fallback) => {
  const value = localStorage.getItem(key)
  return value !== null ? Number(value) : fallback
}

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
    // guideLine: null, // { centerX: number, centerY: number, angle: number } - Center point and angle of the guide line
    guideLines: [],

    /** Zoom mode */
    zoomMode: getString(`${globalConfig.LOCAL_STORAGE_PREFIX}zoomMode`, globalConfig.zoomMode),

    /** Physical content size */
    physicalContentSize: getNumber(
      `${globalConfig.LOCAL_STORAGE_PREFIX}physicalContentSize`,
      globalConfig.physicalContentSize,
    ),

    /** Calibration factor for physical mode */
    calibrationFactor: getNumber(
      `${globalConfig.LOCAL_STORAGE_PREFIX}calibrationFactor`,
      globalConfig.calibrationFactor,
    ),
    /** Maximum physical content size */
    maxPhysicalContentSize: viewportConfig.a4paperWidth,
  }),
  getters: {
    /**
     * Real zoom level based on fitted image zoom
     * @returns {number}
     */
    realZoomLevel(state) {
      return state.zoomLevel / state.fitZoomLevel
    },

    /**
     * Pixels per millimeter based on calibration factor
     * @returns {number}
     */
    getPxPerMm(state) {
      return viewportConfig.defaultPxPerCm * state.calibrationFactor * 0.1
    },

    /**
     * Pixels per millimeter based on calibration factor and fit zoom
     * @returns {number}
     */
    getPxPerMmFitZoom(state) {
      return (
        (viewportConfig.defaultPxPerCm * state.calibrationFactor * 0.1) / (1 / state.fitZoomLevel)
      )
    },

    /**
     * Pixels per centimeter based on calibration factor
     * @returns {number}
     */
    getPxPerCm(state) {
      return viewportConfig.defaultPxPerCm * state.calibrationFactor
    },

    /**
     * Pixels per centimeter based on calibration factor and fit zoom
     * @returns {number}
     */
    getPxPerCmFitZoom(state) {
      return (viewportConfig.defaultPxPerCm * state.calibrationFactor) / (1 / state.fitZoomLevel)
    },
  },
  actions: {
    /**
     * Set the current zoom level, rounded to 2 decimal places.
     * @param {number} level
     */
    // setZoomLevel(level) {
    //   this.zoomLevel = round(level, 2)
    // },

    /**
     * Set the current zoom level keeping the center of the image fixed in the viewport.
     * @param {number} level
     */
    setZoomLevel(level) {
      let wrapper = document.querySelector('.viewport-content-wrapper')
      let content = document.querySelector('.viewport-content')
      if (!content || !wrapper) {
        warn('viewport-content or viewport-content-wrapper element not found!')
        return
      }

      this.zoomLevel = round(level, 2)

      nextTick(() => {
        const wrapperRect = wrapper.getBoundingClientRect()
        const wrapperWidth = wrapperRect.width
        const wrapperHeight = wrapperRect.height

        const rectAfter = content.getBoundingClientRect()
        const contentWidth = rectAfter.width
        const contentHeight = rectAfter.height

        const uiStore = useUiStore()
        const slidersCorrection = uiStore.rulersEnabled ? 0 : 7.5
        this.panX = wrapperWidth / 2 - contentWidth / 2
        this.panY = wrapperHeight / 2 - contentHeight / 2 - slidersCorrection
      })
    },

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

    /**
     * Reset all viewport state to default values.
     */
    reset() {
      this.zoomLevel = this.defaultZoomLevel
      this.fitZoomLevel = 1.0
      this.panX = this.defaultPanX
      this.panY = this.defaultPanY
      this.zoomSpeed = this.defaultZoomSpeed
      this.movementSpeed = this.defaultMovementSpeed
      this.shouldFitToScreen = false
      this.fitImageOnLoad = true
      this.zoomMode = getString(
        `${globalConfig.LOCAL_STORAGE_PREFIX}zoomMode`,
        globalConfig.zoomMode,
      )
      this.textWidth = globalConfig.textWidth
    },

    /**
     * Set the zoom mode.
     * @param {string} mode New zoom mode
     */
    setZoomMode(mode) {
      this.zoomMode = mode

      localStorage.setItem(`${globalConfig.LOCAL_STORAGE_PREFIX}zoomMode`, this.zoomMode.toString())
    },

    /**
     * Set physical content size
     * @param {string} size - New physical content size
     */
    setPhysicalContentSize(size) {
      this.physicalContentSize = size

      localStorage.setItem(
        `${globalConfig.LOCAL_STORAGE_PREFIX}physicalContentSize`,
        this.physicalContentSize.toString(),
      )
    },

    /**
     * Set calibration factor for physical mode
     * @param {number} factor - New calibration factor
     */
    setCalibrationFactor(factor) {
      this.calibrationFactor = factor

      localStorage.setItem(
        `${globalConfig.LOCAL_STORAGE_PREFIX}calibrationFactor`,
        this.calibrationFactor.toString(),
      )
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
        guideLine: this.guideLine,
        zoomMode: this.zoomMode,
        textWidth: this.textWidth,
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
      this.guideLine = snapshot.guideLine ?? false
      this.zoomMode = snapshot.zoomMode ?? 'text'
      this.textWidth = snapshot.textWidth ?? globalConfig.textWidth
    },
  },
})
