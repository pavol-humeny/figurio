import { computed, ref, nextTick, onMounted, watch, onBeforeUnmount } from 'vue'
import { viewportConfig } from '@/config/viewportConfig'
import { useMath } from '@/composables/common/useMath'

export function useViewportWrapper(viewportStore, imageStore, editorStore, contentRef) {
  const { clamp } = useMath()

  // Zoom and pan properties
  const zoomLevel = computed(() => viewportStore.realZoomLevel)
  const panX = computed({
    get: () => viewportStore.panX,
    set: (val) => (viewportStore.panX = val),
  })
  const panY = computed({
    get: () => viewportStore.panY,
    set: (val) => (viewportStore.panY = val),
  })

  const wrapperRef = ref(null)

  // Constants for scrolling and dragging speeds
  const horizontalSpeed = viewportConfig.scrollHorizontalSpeed
  const verticalSpeed = viewportConfig.scrollVerticalSpeed
  const dragSpeedMin = 2
  const dragSpeedMax = viewportConfig.maxZoomLevel

  // Dimensions of the wrapper and content
  const wrapperWidth = ref(1)
  const wrapperHeight = ref(1)
  const contentWidth = ref(1)
  const contentHeight = ref(1)

  // Total dimensions of the content after zooming
  const contentTotalWidth = ref(1)
  const contentTotalHeight = ref(1)

  // Slider values
  const verticalSliderRange = ref(0)
  const horizontalSliderRange = ref(0)
  const minSliderSize = 30 // Minimum size for the slider

  // Scroll limits (boundaries)
  const scrollVerticalMin = ref(0)
  const scrollVerticalMax = ref(0)
  const scrollHorizontalMin = ref(0)
  const scrollHorizontalMax = ref(0)

  // Flags for dragging states
  const isDraggingHorizontal = ref(false)
  const isDraggingVertical = ref(false)
  const isMiddleDragging = ref(false)

  // Update initial dimensions of the wrapper and content
  const updateInitialDimensions = () => {
    wrapperWidth.value = wrapperRef.value?.clientWidth || 1
    wrapperHeight.value = wrapperRef.value?.clientHeight || 1
    contentWidth.value = contentRef.value?.offsetWidth || 1
    contentHeight.value = contentRef.value?.offsetHeight || 1
  }

  // Update dimensions based on zoom level
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

  // Center the image in the viewport
  const centerImage = () => {
    if (!wrapperRef.value || !contentRef.value) return
    updateInitialDimensions()
    updateZoomDependentDimensions()
    panX.value = wrapperWidth.value / 2 - (contentWidth.value * zoomLevel.value) / 2
    panY.value = wrapperHeight.value / 2 - (contentHeight.value * zoomLevel.value) / 2

    viewportStore.defaultPanX = wrapperWidth.value / 2 - (contentWidth.value * zoomLevel.value) / 2
    viewportStore.defaultPanY =
      wrapperHeight.value / 2 - (contentHeight.value * zoomLevel.value) / 2
  }
  const setValuesForCenterImage = () => {
    if (!wrapperRef.value || !contentRef.value) return
    // Reset zoom
    const tmpZoomLevel = viewportStore.zoomLevel
    viewportStore.resetZoom()

    updateInitialDimensions()
    updateZoomDependentDimensions()

    viewportStore.defaultPanX = wrapperWidth.value / 2 - (contentWidth.value * zoomLevel.value) / 2
    viewportStore.defaultPanY =
      wrapperHeight.value / 2 - (contentHeight.value * zoomLevel.value) / 2

    viewportStore.setZoomLevel(tmpZoomLevel)
  }

  // Fit the image to the screen
  const fitToScreenZoomLevel = () => {
    updateInitialDimensions()

    const frameWidth = imageStore.frame?.enabled ? imageStore.frame.width : 0

    const scaleX = wrapperWidth.value / (contentWidth.value + frameWidth * 2)
    const scaleY = wrapperHeight.value / (contentHeight.value + frameWidth * 2)

    const optimalZoom = Math.min(scaleX, scaleY)

    viewportStore.fitZoomLevel = (viewportStore.zoomLevel / optimalZoom) * 1.1

    updateZoomDependentDimensions()
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

  // Zoom and scroll handling
  const setZoomAndScroll = (event) => {
    if (event.ctrlKey) {
      const direction = event.deltaY < 0 ? 1 : -1
      const wrapper = event.currentTarget
      const boundingBox = wrapper.getBoundingClientRect()

      const cursorX = event.clientX - boundingBox.left
      const cursorY = event.clientY - boundingBox.top

      const offsetX = (cursorX - viewportStore.panX) / zoomLevel.value
      const offsetY = (cursorY - viewportStore.panY) / zoomLevel.value

      if (direction > 0) {
        viewportStore.zoomIn()
      } else {
        viewportStore.zoomOut()
      }

      updateZoomDependentDimensions()

      // Move the viewport to keep the cursor position stable
      viewportStore.panX = cursorX - offsetX * zoomLevel.value
      viewportStore.panY = cursorY - offsetY * zoomLevel.value
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

  // Scrolling - dragging
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

  // Pan
  const startPan = (event) => {
    // Middle mouse button panning
    if (event.button === 1 || editorStore.selectedToolKey === 'move') {
      isMiddleDragging.value = true
      event.preventDefault()
      const startX = event.clientX
      const startY = event.clientY
      const startPanX = viewportStore.panX
      const startPanY = viewportStore.panY

      const onMouseMove = (e) => {
        const deltaX = e.clientX - startX
        const deltaY = e.clientY - startY
        viewportStore.panX = clamp(
          startPanX + deltaX * viewportStore.movementSpeed,
          scrollHorizontalMin.value,
          scrollHorizontalMax.value,
        )
        viewportStore.panY = clamp(
          startPanY + deltaY * viewportStore.movementSpeed,
          scrollVerticalMin.value,
          scrollVerticalMax.value,
        )
      }

      const onMouseUp = () => {
        document.removeEventListener('mousemove', onMouseMove)
        document.removeEventListener('mouseup', onMouseUp)
        isMiddleDragging.value = false
      }

      document.addEventListener('mousemove', onMouseMove)
      document.addEventListener('mouseup', onMouseUp)
    }
  }

  // Initial setup
  let resizeObserver
  onMounted(() => {
    nextTick(() => {
      fitToScreenZoomLevel()
      centerImage()

      // Center the image after resizing the wrapper
      if (wrapperRef.value) {
        resizeObserver = new ResizeObserver(() => {
          setValuesForCenterImage()
        })
        resizeObserver.observe(wrapperRef.value)
      }
    })
  })

  // Watch for changes in frame
  watch(
    () => imageStore.frame,
    () => {
      nextTick(() => {
        setValuesForCenterImage()
      })
    },
    { deep: true },
  )

  // Cleanup on unmount
  onBeforeUnmount(() => {
    if (resizeObserver && wrapperRef.value) {
      resizeObserver.unobserve(wrapperRef.value)
    }
  })

  // Update dimensions when zoom level changes
  watch(zoomLevel, () => {
    updateZoomDependentDimensions()
  })

  // Center the image when the rendered image changes
  watch(
    () => imageStore.getRenderedImage(),
    () => {
      nextTick(() => {
        viewportStore.resetZoom()
        fitToScreenZoomLevel()
        centerImage()
      })
    },
  )
  const dynamicStep = computed(() => {
    const z = zoomLevel.value
    if (z >= 4) return 5
    if (z >= 2) return 10
    if (z >= 1.5) return 20
    if (z >= 1.0) return 40
    if (z >= 0.5) return 80
    if (z >= 0.25) return 160
    return 320 // stále necháva menej značiek pri minimálnom zoome
  })

  const horizontalRulerMarks = computed(() => {
    const spacing = dynamicStep.value * zoomLevel.value
    const width = wrapperRef.value?.clientWidth || 0

    const start = Math.floor(-panX.value / spacing) - 1
    const end = Math.ceil((width - panX.value) / spacing) + 1

    return Array.from({ length: end - start }, (_, i) => {
      const index = start + i
      return {
        left: index * spacing + panX.value,
        label: index * dynamicStep.value,
      }
    })
  })

  const verticalRulerMarks = computed(() => {
    const spacing = dynamicStep.value * zoomLevel.value
    const height = wrapperRef.value?.clientHeight || 0

    const start = Math.floor(-panY.value / spacing) - 1
    const end = Math.ceil((height - panY.value) / spacing) + 1

    return Array.from({ length: end - start }, (_, i) => {
      const index = start + i
      return {
        top: index * spacing + panY.value,
        label: index * dynamicStep.value,
      }
    })
  })

  return {
    zoomLevel,
    setZoomAndScroll,
    startPan,
    panX,
    panY,
    startDrag,
    isDraggingHorizontal,
    isDraggingVertical,
    isMiddleDragging,
    wrapperRef,
    contentRef,
    verticalSliderTop,
    horizontalSliderLeft,
    verticalSliderHeight,
    horizontalSliderWidth,
    centerImage,
    setValuesForCenterImage,
    horizontalRulerMarks,
    verticalRulerMarks,
  }
}
