import { defineStore } from 'pinia'

export const useViewportStore = defineStore('viewportStore', {
  state: () => ({
    zoomLevel: 1.0, // Current zoom level
    defaultZoomLevel: 1.0, // Default zoom level for reset
    maxZoomLevel: 5.0, // Maximum zoom level
    minZoomLevel: 0.1, // Minimum zoom level
  }),
  actions: {
    setZoomLevel(level) {
      this.zoomLevel = Math.round(level * 100) / 100 // Round to two decimal places
      console.log(`Zoom level set to ${this.zoomLevel}`);
    },
    zoomIn(step) {
      this.zoomLevel = Math.round((Math.min(this.zoomLevel + step, this.maxZoomLevel))*100) / 100 // Round to two decimal places
      console.log(`Zoomed in to ${this.zoomLevel}`);
    },
    zoomOut(step) {
      this.zoomLevel = Math.round((Math.max(this.zoomLevel - step, this.minZoomLevel))*100) / 100 // Round to two decimal places
      console.log(`Zoomed out to ${this.zoomLevel}`);
    },
  },
})
