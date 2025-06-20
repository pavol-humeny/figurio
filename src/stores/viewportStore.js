import { defineStore } from 'pinia'
import { viewportConfig } from '@/config/viewportConfig'

export const useViewportStore = defineStore('viewportStore', {
  state: () => ({
    zoomLevel: viewportConfig.defaultZoomLevel,
    fitZoomLevel: 1.0,
    defaultZoomLevel: viewportConfig.defaultZoomLevel,
    maxZoomLevel: viewportConfig.maxZoomLevel,
    minZoomLevel: viewportConfig.minZoomLevel,
    zoomSpeed: viewportConfig.zoomSpeed,

    panX: 0,
    panY: 0,

    defaultPanX: 0,
    defaultPanY: 0,
  }),
  getters: {
    realZoomLevel(state) {
      return (state.zoomLevel) / state.fitZoomLevel
    },
  },
  actions: {
    setZoomLevel(level) {
      this.zoomLevel = Math.round(level * 100) / 100 // Round to two decimal places
    },
    zoomIn() {
      const newZoomLevel = this.zoomLevel * (1 + this.zoomSpeed)
      this.zoomLevel = Math.round(Math.min(newZoomLevel, this.maxZoomLevel) * 100) / 100 // Round to two decimal places
    },
    zoomOut() {
      const newZoomLevel = this.zoomLevel / (1 + this.zoomSpeed)
      this.zoomLevel = Math.round(Math.max(newZoomLevel, this.minZoomLevel) * 100) / 100 // Round to two decimal places
    },
    resetZoom() {
      this.zoomLevel = this.defaultZoomLevel
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
