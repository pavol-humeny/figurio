import { defineStore } from 'pinia'
import { viewportConfig } from '@/config/viewportConfig'
import { useMath } from '@/composables/common/useMath'

const { round } = useMath()

export const useViewportStore = defineStore('viewportStore', {
  state: () => ({
    zoomLevel: viewportConfig.defaultZoomLevel,
    fitZoomLevel: 1.0,
    defaultZoomLevel: viewportConfig.defaultZoomLevel,
    maxZoomLevel: viewportConfig.maxZoomLevel,
    minZoomLevel: viewportConfig.minZoomLevel,
    zoomSpeed: viewportConfig.zoomSpeed,
    defaultZoomSpeed: viewportConfig.zoomSpeed,

    panX: 0,
    panY: 0,
    movementSpeed: viewportConfig.movementSpeed,
    defaultMovementSpeed: viewportConfig.movementSpeed,

    defaultPanX: 0,
    defaultPanY: 0,
  }),
  getters: {
    realZoomLevel(state) {
      return state.zoomLevel / state.fitZoomLevel
    },
  },
  actions: {
    setZoomLevel(level) {
      this.zoomLevel = round(level, 2)
    },
    zoomIn() {
      const newZoomLevel = this.zoomLevel * (1 + this.zoomSpeed)
      this.zoomLevel = round(Math.min(newZoomLevel, this.maxZoomLevel), 2)
    },
    zoomOut() {
      const newZoomLevel = this.zoomLevel / (1 + this.zoomSpeed)
      this.zoomLevel = round(Math.max(newZoomLevel, this.minZoomLevel), 2)
    },
    resetZoom() {
      this.zoomLevel = this.defaultZoomLevel
    },

    resetZoomSpeed() {
      this.zoomSpeed = this.defaultZoomSpeed
    },

    resetMovementSpeed() {
      this.movementSpeed = this.defaultMovementSpeed
    },

    setPan(x, y) {
      this.panX = x
      this.panY = y
    },
    resetPan() {
      this.panX = this.defaultPanX
      this.panY = this.defaultPanY
    },
  },
})
