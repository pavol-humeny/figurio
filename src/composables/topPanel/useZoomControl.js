import { ref, computed, watch } from 'vue'

export function useZoomControl(viewportStore) {

  const zoomLevelInput = ref(Math.round(viewportStore.zoomLevel * 100))

  watch(() => viewportStore.zoomLevel, (newZoom) => {
    zoomLevelInput.value = Math.round(newZoom * 100)
  })

  const canZoomIn = computed(() => viewportStore.zoomLevel < viewportStore.maxZoomLevel)
  const canZoomOut = computed(() => viewportStore.zoomLevel > viewportStore.minZoomLevel)

  const zoomIn = () => {
    console.log('Zooming in')
    if (!canZoomIn.value) return
    viewportStore.setZoomLevel(viewportStore.zoomLevel + 0.1)
  }

  const zoomOut = () => {
    if (!canZoomOut.value) return
    viewportStore.setZoomLevel(viewportStore.zoomLevel - 0.1)
  }

  const resetZoom = () => {
    viewportStore.resetZoom()
    viewportStore.resetPan()
  }

  const wheelZoom = (e) => {
    if (e.deltaY < 0) {
      zoomIn(0.01);
    } else if (e.deltaY > 0) {
      zoomOut(0.01);
    }
  }

  const isDragging = ref(false)
  const startX = ref(0)

  const onMouseMove = (e) => {
    const deltaX = e.clientX - startX.value
    const step = Math.round(deltaX / 3) // 3px = 1%
    const newLevel = Math.max(viewportStore.minZoomLevel * 100, Math.min(zoomLevelInput.value + step, viewportStore.maxZoomLevel * 100))
    zoomLevelInput.value = newLevel
    viewportStore.setZoomLevel(newLevel / 100)
    startX.value = e.clientX
  }

  const onMouseUp = () => {
    document.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('mouseup', onMouseUp)
    isDragging.value = false
  }

  const startDragging = (e) => {
    e.preventDefault()
    isDragging.value = true
    startX.value = e.clientX
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }

  return {
    zoomLevel: zoomLevelInput,
    zoomIn,
    zoomOut,
    wheelZoom,
    resetZoom,
    canZoomIn,
    canZoomOut,
    startDragging
  }
}
