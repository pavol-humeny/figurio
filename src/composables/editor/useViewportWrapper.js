import { computed, ref, nextTick, onMounted, watch, onBeforeUnmount } from 'vue'

export function useViewportWrapper(viewportStore) {
  const zoomLevel = computed(() => viewportStore.zoomLevel)
  const panX = computed({
    get: () => viewportStore.panX,
    set: (val) => (viewportStore.panX = val),
  })
  const panY = computed({
    get: () => viewportStore.panY,
    set: (val) => (viewportStore.panY = val),
  })

  const wrapperRef = ref(null)
  const contentRef = ref(null)

  // Constants for scrolling and dragging speeds
  const horizontalSpeed = 3
  const verticalSpeed = 3
  const dragSpeedMin = 2
  const dragSpeedMax = 5

  const wrapperWidth = ref(1)
  const wrapperHeight = ref(1)
  const contentWidth = ref(1)
  const contentHeight = ref(1)

  // Total dimensions of the content after zooming
  const contentTotalWidth = ref(1)
  const contentTotalHeight = ref(1)

  const verticalSliderRange = ref(0)
  const horizontalSliderRange = ref(0)
  const minSliderSize = 30 // Minimum size for the slider

  // Scroll limits (boundaries)
  const scrollVerticalMin = ref(0)
  const scrollVerticalMax = ref(0)
  const scrollHorizontalMin = ref(0)
  const scrollHorizontalMax = ref(0)

  const isDraggingHorizontal = ref(false)
  const isDraggingVertical = ref(false)

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max)

  const updateInitialDimensions = () => {
    wrapperWidth.value = wrapperRef.value?.clientWidth || 1
    wrapperHeight.value = wrapperRef.value?.clientHeight || 1
    contentWidth.value = contentRef.value?.offsetWidth || 1
    contentHeight.value = contentRef.value?.offsetHeight || 1
  }

  const updateZoomDependentDimensions = () => {
    contentTotalWidth.value = contentWidth.value * zoomLevel.value
    contentTotalHeight.value = contentHeight.value * zoomLevel.value

    scrollVerticalMin.value = -contentTotalHeight.value * 0.9
    scrollVerticalMax.value = wrapperHeight.value - contentTotalHeight.value * 0.1
    scrollHorizontalMin.value = -contentTotalWidth.value * 0.9
    scrollHorizontalMax.value = wrapperWidth.value - contentTotalWidth.value * 0.1

    verticalSliderRange.value = scrollVerticalMax.value - scrollVerticalMin.value
    horizontalSliderRange.value = scrollHorizontalMax.value - scrollHorizontalMin.value
  }

  const centerImage = () => {
    if (!wrapperRef.value || !contentRef.value) return
    updateInitialDimensions()
    updateZoomDependentDimensions()
    panX.value = wrapperWidth.value / 2 - (contentWidth.value * zoomLevel.value) / 2
    panY.value = wrapperHeight.value / 2 - (contentHeight.value * zoomLevel.value) / 2

    viewportStore.defaultPanX = wrapperWidth.value / 2 - (contentWidth.value) / 2
    viewportStore.defaultPanY = wrapperHeight.value / 2 - (contentHeight.value) / 2
  }

  const setZoomAndScroll = (event) => {
    if (event.ctrlKey) {
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

      updateZoomDependentDimensions()

      // Move the viewport to keep the cursor position stable
      viewportStore.panX = cursorX - offsetX * viewportStore.zoomLevel
      viewportStore.panY = cursorY - offsetY * viewportStore.zoomLevel
    } else if (event.shiftKey) {
      // Horizontal scrolling with shift key
      if (
        viewportStore.panX >= scrollHorizontalMin.value &&
        viewportStore.panX <= scrollHorizontalMax.value
      ) {
        viewportStore.panX = clamp(
          viewportStore.panX - event.deltaY / horizontalSpeed,
          scrollHorizontalMin.value,
          scrollHorizontalMax.value,
        )
      } else {
        if (viewportStore.panX < scrollHorizontalMin.value) {
          // Enable only scrolling right
          if (event.deltaY < 0) {
            viewportStore.panX = viewportStore.panX - event.deltaY / horizontalSpeed
          }
        } else {
          // Enable only scrolling left
          if (event.deltaY > 0) {
            viewportStore.panX = viewportStore.panX - event.deltaY / horizontalSpeed
          }
        }
      }
    } else {
      // Vertical scrolling without
      if (
        viewportStore.panY >= scrollVerticalMin.value &&
        viewportStore.panY <= scrollVerticalMax.value
      ) {
        viewportStore.panY = clamp(
          viewportStore.panY - event.deltaY / verticalSpeed,
          scrollVerticalMin.value,
          scrollVerticalMax.value,
        )
      } else {
        if (viewportStore.panY < scrollVerticalMin.value) {
          // Enable only scrolling down
          if (event.deltaY < 0) {
            viewportStore.panY = viewportStore.panY - event.deltaY / verticalSpeed
          }
        } else {
          // Enable only scrolling up
          if (event.deltaY > 0) {
            viewportStore.panY = viewportStore.panY - event.deltaY / verticalSpeed
          }
        }
      }
    }
  }

  // Slider dimensions
  const verticalSliderHeight = computed(() => {
    const visibleRatio = wrapperHeight.value / contentTotalHeight.value
    return clamp((wrapperHeight.value / 3) * visibleRatio, minSliderSize, wrapperHeight.value / 3)
  })
  const horizontalSliderWidth = computed(() => {
    const visibleRatio = wrapperWidth.value / contentTotalWidth.value
    return clamp((wrapperWidth.value / 3) * visibleRatio, minSliderSize, wrapperWidth.value / 3)
  })

  // Slider positions
  const verticalSliderTop = computed(() => {
    const ratio = (panY.value + contentTotalHeight.value * 0.9) / verticalSliderRange.value
    const clampedRatio = clamp(ratio, 0, 1)
    return (1 - clampedRatio) * (wrapperHeight.value - verticalSliderHeight.value)
  })
  const horizontalSliderLeft = computed(() => {
    const ratio = (panX.value + contentTotalWidth.value * 0.9) / horizontalSliderRange.value
    const clampedRatio = clamp(ratio, 0, 1)
    return (1 - clampedRatio) * (wrapperWidth.value - horizontalSliderWidth.value)
  })

  // Dragging functionality
  const startDrag = (axis, event) => {
    event.preventDefault()
    const startClient = axis === 'y' ? event.clientY : event.clientX
    const startPan = axis === 'y' ? viewportStore.panY : viewportStore.panX

    const onMouseMove = (e) => {
      const delta = (axis === 'y' ? e.clientY : e.clientX) - startClient
      if (axis === 'y') {
        isDraggingVertical.value = true
        if (
          viewportStore.panY >= scrollVerticalMin.value &&
          viewportStore.panY <= scrollVerticalMax.value
        ) {
          viewportStore.panY = clamp(
            startPan - delta * clamp(zoomLevel.value, dragSpeedMin, dragSpeedMax),
            scrollVerticalMin.value,
            scrollVerticalMax.value,
          )
        }
      } else {
        isDraggingHorizontal.value = true
        if (
          viewportStore.panX >= scrollHorizontalMin.value &&
          viewportStore.panX <= scrollHorizontalMax.value
        ) {
          viewportStore.panX = clamp(
            startPan - delta * clamp(zoomLevel.value, dragSpeedMin, dragSpeedMax),
            scrollHorizontalMin.value,
            scrollHorizontalMax.value,
          )
        }
      }
    }

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
      isDraggingHorizontal.value = false
      isDraggingVertical.value = false
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }

  let resizeObserver

  onMounted(() => {
    nextTick(() => {
      centerImage()

      // Center the image after resizing the wrapper
      if (wrapperRef.value) {
        resizeObserver = new ResizeObserver(() => {
          centerImage()
        })
        resizeObserver.observe(wrapperRef.value)
      }
    })
  })

  onBeforeUnmount(() => {
    if (resizeObserver && wrapperRef.value) {
      resizeObserver.unobserve(wrapperRef.value)
    }
  })

  // Update dimensions when zoom level changes
  watch(zoomLevel, () => {
    updateZoomDependentDimensions()
  })

  const startPan = (event) => {
    // Middle mouse button panning
    if (event.button === 1) {
      event.preventDefault()
      const startX = event.clientX
      const startY = event.clientY
      const startPanX = viewportStore.panX
      const startPanY = viewportStore.panY

      const onMouseMove = (e) => {
        const deltaX = e.clientX - startX
        const deltaY = e.clientY - startY
        viewportStore.panX = clamp(
          startPanX + deltaX,
          scrollHorizontalMin.value,
          scrollHorizontalMax.value,
        )
        viewportStore.panY = clamp(
          startPanY + deltaY,
          scrollVerticalMin.value,
          scrollVerticalMax.value,
        )
      }

      const onMouseUp = () => {
        document.removeEventListener('mousemove', onMouseMove)
        document.removeEventListener('mouseup', onMouseUp)
      }

      document.addEventListener('mousemove', onMouseMove)
      document.addEventListener('mouseup', onMouseUp)
    }
  }

  return {
    zoomLevel,
    setZoomAndScroll,
    startPan,
    panX,
    panY,
    startDrag,
    isDraggingHorizontal,
    isDraggingVertical,
    wrapperRef,
    contentRef,
    verticalSliderTop,
    horizontalSliderLeft,
    verticalSliderHeight,
    horizontalSliderWidth,
  }
}
