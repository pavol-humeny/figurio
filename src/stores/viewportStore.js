import { defineStore } from 'pinia'
import { viewportConfig } from '@/config/viewportConfig'


export const useViewportStore = defineStore('viewportStore', {
  state: () => ({
    zoomLevel: viewportConfig.defaultZoomLevel,
    defaultZoomLevel: viewportConfig.defaultZoomLevel,
    maxZoomLevel: viewportConfig.maxZoomLevel,
    minZoomLevel: viewportConfig.minZoomLevel,
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
