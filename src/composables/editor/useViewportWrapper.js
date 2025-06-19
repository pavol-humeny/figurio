import { computed, ref, nextTick, onMounted } from "vue"

export function useViewportWrapper(viewportStore) {
  const zoomLevel = computed(() => viewportStore.zoomLevel)
  // const panX = computed(() => viewportStore.panX)
  // const panY = computed(() => viewportStore.panY)

  const wrapperRef = ref(null)
  const contentRef = ref(null)

  const wrapperWidth = wrapperRef.value?.clientWidth || 1
  const wrapperHeight = wrapperRef.value?.clientHeight || 1
  const contentWidth = contentRef.value?.offsetWidth || 1
  const contentHeight = contentRef.value?.offsetHeight || 1
  const contentTotalWidth = contentWidth * zoomLevel.value
  const contentTotalHeight = contentHeight * zoomLevel.value

  const minPanX = 0
  const maxPanX = wrapperWidth - contentTotalWidth
  const minPanY = 0
  const maxPanY = wrapperHeight - contentTotalHeight

  const panX = computed({
    get: () => viewportStore.panX,
    set: (val) => viewportStore.panX = val
  })
  const panY = computed({
    get: () => viewportStore.panY,
    set: (val) => viewportStore.panY = val
  })

  const centerImage = () => {
    if (!wrapperRef.value || !contentRef.value) return

    const wrapperWidth = wrapperRef.value.clientWidth
    const wrapperHeight = wrapperRef.value.clientHeight
    const contentWidth = contentRef.value.offsetWidth
    const contentHeight = contentRef.value.offsetHeight

    console.log('wrapperWidth:', wrapperWidth, 'wrapperHeight:', wrapperHeight)
    console.log('contentWidth:', contentWidth, 'contentHeight:', contentHeight)

    const zoom = zoomLevel.value
    panX.value = wrapperWidth / 2 - contentWidth / 2 * zoom
    panY.value = wrapperHeight / 2 - contentHeight / 2 * zoom
  }

  const changeZoomLevel = (event) => {
    if (event.ctrlKey){

      const direction = event.deltaY < 0 ? 1 : -1
      const wrapper = event.currentTarget
      const boundingBox = wrapper.getBoundingClientRect()

      const cursorX = event.clientX - boundingBox.left
      const cursorY = event.clientY - boundingBox.top

      const offsetX = (cursorX - viewportStore.panX) / viewportStore.zoomLevel
      const offsetY = (cursorY - viewportStore.panY) / viewportStore.zoomLevel

      if (direction > 0) {
        viewportStore.zoomIn()
      } else {
        viewportStore.zoomOut()
      }

      viewportStore.panX = cursorX - offsetX * viewportStore.zoomLevel
      viewportStore.panY = cursorY - offsetY * viewportStore.zoomLevel
    }else if (event.shiftKey){
      // event.preventDefault()
      viewportStore.panX += event.deltaY/5
    }else{
      // event.preventDefault()
      const wrapperWidth = wrapperRef.value?.clientWidth || 1
      const wrapperHeight = wrapperRef.value?.clientHeight || 1
      const contentWidth = contentRef.value?.offsetWidth || 1
      const contentHeight = contentRef.value?.offsetHeight || 1
      const contentTotalWidth = contentWidth * zoomLevel.value
      const contentTotalHeight = contentHeight * zoomLevel.value

      const minPanX = 0
      const maxPanX = wrapperWidth - contentTotalWidth
      const minPanY = 0
      const maxPanY = wrapperHeight - contentTotalHeight

      viewportStore.panY -= event.deltaY/5
      if (viewportStore.panY < minPanY || viewportStore.panY > maxPanY) {
        console.warn('Pan Y out of bounds:', viewportStore.panY)
        verticalSliderHeight.value *= 0.9
      }
    }
  }

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max)

  const verticalSliderHeight = computed(() => {
    const contentHeight = contentRef.value?.offsetHeight || 1
    return contentHeight * zoomLevel.value
  })

  const horizontalSliderWidth = computed(() => {
    const contentWidth = contentRef.value?.offsetWidth || 1
    return contentWidth * zoomLevel.value
  })

  const verticalSliderTop = computed(() => {
    const wrapperHeight = wrapperRef.value?.clientHeight || 1
    const contentHeight = contentRef.value?.offsetHeight || 1
    const contentTotalHeight = contentHeight * zoomLevel.value

    const scrollRatio = clamp(-panY.value / (contentTotalHeight - wrapperHeight), 0, 1)
    return scrollRatio * (wrapperHeight - verticalSliderHeight.value)
  })

  const horizontalSliderLeft = computed(() => {
    const wrapperWidth = wrapperRef.value?.clientWidth || 1
    const contentWidth = contentRef.value?.offsetWidth || 1
    const contentTotalWidth = contentWidth * zoomLevel.value

    const scrollRatio = clamp(-panX.value / (contentTotalWidth - wrapperWidth), 0, 1)
    return scrollRatio * (wrapperWidth - horizontalSliderWidth.value)
  })

  const startDrag = (axis, event) => {
    event.preventDefault()
    const startClient = axis === 'y' ? event.clientY : event.clientX
    const startPan = axis === 'y' ? viewportStore.panY : viewportStore.panX

    const wrapperWidth = wrapperRef.value?.clientWidth || 1
    const wrapperHeight = wrapperRef.value?.clientHeight || 1
    const contentWidth = contentRef.value?.offsetWidth || 1
    const contentHeight = contentRef.value?.offsetHeight || 1
    const contentTotalWidth = contentWidth * zoomLevel.value
    const contentTotalHeight = contentHeight * zoomLevel.value

    const minPanX = 0
    const maxPanX = wrapperWidth - contentTotalWidth
    const minPanY = 0
    const maxPanY = wrapperHeight - contentTotalHeight

    const onMouseMove = (e) => {
      const delta = (axis === 'y' ? e.clientY : e.clientX) - startClient
      if (axis === 'y') {
        const raw = startPan + delta
        viewportStore.panY = clamp(raw, minPanY, maxPanY)
      } else {
        const raw = startPan + delta
        viewportStore.panX = clamp(raw, minPanX, maxPanX)
      }
    }

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }

  onMounted(() => {
    nextTick(() => {
      centerImage()
    })
  })

  return {
    zoomLevel,
    changeZoomLevel,
    panX,
    panY,
    startDrag,
    wrapperRef,
    contentRef,
    verticalSliderTop,
    horizontalSliderLeft,
    verticalSliderHeight,
    horizontalSliderWidth,
  }
}
