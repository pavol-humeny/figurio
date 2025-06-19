import { defineStore } from 'pinia'
import { viewportConfig } from '@/config/viewportConfig'


export const useViewportStore = defineStore('viewportStore', {
  state: () => ({
    zoomLevel: viewportConfig.defaultZoomLevel,
    defaultZoomLevel: viewportConfig.defaultZoomLevel,
    maxZoomLevel: viewportConfig.maxZoomLevel,
    minZoomLevel: viewportConfig.minZoomLevel,
    zoomSpeed: viewportConfig.zoomSpeed,

    panX: 0,
    panY: 0,
  }),
  actions: {
    setZoomLevel(level) {
      this.zoomLevel = Math.round(level * 100) / 100 // Round to two decimal places
      console.log(`Zoom level set to ${this.zoomLevel}`);
    },
    zoomIn(factor) {
      const newZoomLevel = this.zoomLevel * (1 + factor)
      this.zoomLevel = Math.round((Math.min(newZoomLevel, this.maxZoomLevel))*100) / 100 // Round to two decimal places
      console.log(`Zoomed in to ${this.zoomLevel}`);
    },
    zoomOut(factor) {
      const newZoomLevel = this.zoomLevel / (1 + factor)
      this.zoomLevel = Math.round((Math.max(newZoomLevel, this.minZoomLevel))*100) / 100 // Round to two decimal places
      console.log(`Zoomed out to ${this.zoomLevel}`);
    },
    resetZoom() {
      this.zoomLevel = this.defaultZoomLevel
      console.log(`Zoom level reset to ${this.zoomLevel}`);
    },

    setPan(x, y) {
      this.panX = x
      this.panY = y
      console.log(`Pan set to (${this.panX}, ${this.panY})`);
    },
    resetPan() {
      this.panX = 0
      this.panY = 0
      console.log(`Pan reset to (${this.panX}, ${this.panY})`);
    }

  },
})
