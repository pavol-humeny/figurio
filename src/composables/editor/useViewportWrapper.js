import { computed } from "vue"

export function useViewportWrapper(viewportStore) {
  const zoomLevel = computed(() => viewportStore.zoomLevel)
  const zoomSpeed = computed(() => viewportStore.zoomSpeed)
  const panX = computed(() => viewportStore.panX)
  const panY = computed(() => viewportStore.panY)

  const changeZoomLevel = (event) => {
    if (!event.ctrlKey) return

    event.preventDefault()

    const direction = event.deltaY < 0 ? 1 : -1
    const wrapper = event.currentTarget
    const boundingBox = wrapper.getBoundingClientRect()

    const cursorX = event.clientX - boundingBox.left
    const cursorY = event.clientY - boundingBox.top

    const offsetX = (cursorX - viewportStore.panX) / viewportStore.zoomLevel
    const offsetY = (cursorY - viewportStore.panY) / viewportStore.zoomLevel

    if (direction > 0) {
      viewportStore.zoomIn(zoomSpeed.value)
    } else {
      viewportStore.zoomOut(zoomSpeed.value)
    }

    viewportStore.panX = cursorX - offsetX * viewportStore.zoomLevel
    viewportStore.panY = cursorY - offsetY * viewportStore.zoomLevel
  }



  return {
    zoomLevel,
    changeZoomLevel,
    panX,
    panY
  }
}
