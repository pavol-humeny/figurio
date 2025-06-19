import { computed, ref, nextTick, onMounted, watch } from 'vue'

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

  const horizontalSpeed = ref(3)
  const verticalSpeed = ref(3)

  const wrapperRef = ref(null)
  const contentRef = ref(null)

  const wrapperWidth = ref(1)
  const wrapperHeight = ref(1)
  const contentWidth = ref(1)
  const contentHeight = ref(1)

  const contentTotalWidth = ref(1)
  const contentTotalHeight = ref(1)
  const minPanX = ref(0)
  const maxPanX = ref(0)
  const minPanY = ref(0)
  const maxPanY = ref(0)

  const verticalSliderHeight = ref(200)
  const horizontalSliderWidth = ref(200)

  const verticalSliderRange = ref(0)
  const horizontalSliderRange = ref(0)

  const visibleContentHeight = ref(0)
  const visibleContentWidth = ref(0)

  const scrollVerticalMin = ref(0)
  const scrollVerticalMax = ref(0)
  const scrollHorizontalMin = ref(0)
  const scrollHorizontalMax = ref(0)

  const updateInitialDimensions = () => {
    wrapperWidth.value = wrapperRef.value?.clientWidth || 1
    wrapperHeight.value = wrapperRef.value?.clientHeight || 1
    contentWidth.value = contentRef.value?.offsetWidth || 1
    contentHeight.value = contentRef.value?.offsetHeight || 1
  }

  const updateZoomDependentDimensions = () => {
    contentTotalWidth.value = contentWidth.value * zoomLevel.value
    contentTotalHeight.value = contentHeight.value * zoomLevel.value

    // Visible width and height of the content in the viewport
    // const contentTop = Math.max(0, panY.value)
    // const contentBottom = Math.min(wrapperHeight.value, panY.value + contentTotalHeight.value)
    // const contentLeft = Math.max(0, panX.value)
    // const contentRight = Math.min(wrapperWidth.value, panX.value + contentTotalWidth.value)
    // visibleContentHeight.value = contentBottom - contentTop
    // visibleContentWidth.value = contentRight - contentLeft

    scrollVerticalMin.value = -contentTotalHeight.value * 0.9
    scrollVerticalMax.value = wrapperHeight.value - contentTotalHeight.value * 0.1
    scrollHorizontalMin.value = -contentTotalWidth.value * 0.9
    scrollHorizontalMax.value = wrapperWidth.value - contentTotalWidth.value * 0.1

    // verticalSliderHeight.value -= zoomLevel.value < 1 ? 1 : -1
    // horizontalSliderWidth.value -= zoomLevel.value < 1 ? 1 : -1

    verticalSliderRange.value = scrollVerticalMax.value - scrollVerticalMin.value
    horizontalSliderRange.value = scrollHorizontalMax.value - scrollHorizontalMin.value
  }

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max)

  const centerImage = () => {
    if (!wrapperRef.value || !contentRef.value) return
    updateInitialDimensions()
    updateZoomDependentDimensions()
    panX.value = wrapperWidth.value / 2 - (contentWidth.value * zoomLevel.value) / 2
    panY.value = wrapperHeight.value / 2 - (contentHeight.value * zoomLevel.value) / 2
  }

  const changeZoomLevel = (event) => {
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

      viewportStore.panX = cursorX - offsetX * viewportStore.zoomLevel
      viewportStore.panY = cursorY - offsetY * viewportStore.zoomLevel
    } else if (event.shiftKey) {
      if (
        viewportStore.panX >= scrollHorizontalMin.value &&
        viewportStore.panX <= scrollHorizontalMax.value
      ) {
        viewportStore.panX = clamp(
          viewportStore.panX - event.deltaY / horizontalSpeed.value,
          scrollHorizontalMin.value,
          scrollHorizontalMax.value,
        )
      } else {
        if (viewportStore.panX < scrollHorizontalMin.value) {
          if (event.deltaY < 0) {
            viewportStore.panX = viewportStore.panX - event.deltaY / horizontalSpeed.value
          }
        } else {
          if (event.deltaY > 0) {
            viewportStore.panX = viewportStore.panX - event.deltaY / horizontalSpeed.value
          }
        }
      }
    } else {
      if (
        viewportStore.panY >= scrollVerticalMin.value &&
        viewportStore.panY <= scrollVerticalMax.value
      ) {
        viewportStore.panY = clamp(
          viewportStore.panY - event.deltaY / verticalSpeed.value,
          scrollVerticalMin.value,
          scrollVerticalMax.value,
        )
      } else {
        console.log('out of bounds, deltaY:', event.deltaY)
        if (viewportStore.panY < scrollVerticalMin.value) {
          // enable only scrolling down
          if (event.deltaY < 0) {
            viewportStore.panY = viewportStore.panY - event.deltaY / verticalSpeed.value
          }
        } else {
          // enable only scrolling up
          if (event.deltaY > 0) {
            viewportStore.panY = viewportStore.panY - event.deltaY / verticalSpeed.value
          }
        }
      }
    }
  }

  const verticalSliderTop = computed(() => {
    const ration = (panY.value + contentTotalHeight.value * 0.9) / verticalSliderRange.value
    return ration * (wrapperHeight.value - verticalSliderHeight.value)
  })

  const horizontalSliderLeft = computed(() => {
    const ration = (panX.value + contentTotalWidth.value * 0.9) / horizontalSliderRange.value
    return ration * (wrapperWidth.value - horizontalSliderWidth.value)
  })

  const startDrag = (axis, event) => {
    event.preventDefault()
    const startClient = axis === 'y' ? event.clientY : event.clientX
    const startPan = axis === 'y' ? viewportStore.panY : viewportStore.panX

    const onMouseMove = (e) => {
      const delta = (axis === 'y' ? e.clientY : e.clientX) - startClient
      if (axis === 'y') {
        const raw = startPan + delta

        if (
          viewportStore.panY >= scrollVerticalMin.value &&
          viewportStore.panY <= scrollVerticalMax.value
        ) {
          viewportStore.panY = clamp(raw, scrollVerticalMin.value, scrollVerticalMax.value)
        }
        // } else {
        //   if (viewportStore.panY < scrollVerticalMin.value) {
        //     scrollVerticalMin.value = raw
        //   } else {
        //     scrollVerticalMax.value = raw
        //   }
        // }
      } else {
        const raw = startPan + delta
        // viewportStore.panX = raw

        if (
          viewportStore.panX >= scrollHorizontalMin.value &&
          viewportStore.panX <= scrollHorizontalMax.value
        ) {
          viewportStore.panX = clamp(raw, scrollHorizontalMin.value, scrollHorizontalMax.value)
        }
        // } else {
        //   if (viewportStore.panX < scrollHorizontalMin.value) {
        //     scrollHorizontalMin.value = raw
        //   } else {
        //     scrollHorizontalMax.value = raw
        //   }
        // }
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

  watch(zoomLevel, () => {
    updateZoomDependentDimensions()
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
