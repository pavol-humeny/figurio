import { computed, ref, nextTick, onMounted, watch, onBeforeUnmount } from 'vue'
import { viewportConfig } from '@/config/viewportConfig'
import { useMath } from '@/composables/common/useMath'
import { useThrottleFn } from '@vueuse/core'

/**
 * Logic for managing zooming, panning, scrolling and viewport dimensions
 *
 * @param {ReturnType<typeof import('@/stores/viewportStore').useViewportStore>} viewportStore - Store for viewport state
 * @param {ReturnType<typeof import('@/stores/imageStore').useImageStore>} imageStore - Store for image and its dimensions
 * @param {ReturnType<typeof import('@/stores/workspaceStore').useWorkspaceStore>} editorStore - Editor store
 * @param {import('vue').Ref<HTMLElement>} contentRef - Ref to the .viewport-content element
 * @returns {Object}
 */
export function useViewportWrapper(viewportStore, imageStore, editorStore, uiStore, contentRef, t) {
  const { clamp, round } = useMath()

  /**
   * Ref to the outer wrapper element
   */
  const wrapperRef = ref(null)

  /**
   * Width and height of the wrapper element
   */
  const wrapperSize = ref({ width: 0, height: 0 })

  // ------------------------------
  // Panning
  // ------------------------------

  /**
   * Horizontal pan offset
   */
  const panX = computed({
    get: () => viewportStore.panX,
    set: (val) => (viewportStore.panX = val),
  })

  /**
   * Vertical pan offset
   */
  const panY = computed({
    get: () => viewportStore.panY,
    set: (val) => (viewportStore.panY = val),
  })

  /**
   * Start panning the viewport using middle mouse button
   * @param {MouseEvent} event - Mouse event
   */
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

  // ------------------------------
  // Scroll and zoom
  // ------------------------------

  /**
   * Current zoom level from the store
   */
  const zoomLevel = computed(() => viewportStore.realZoomLevel)

  /**
   * Horizontal scroll speed (pixels per event unit)
   */
  const horizontalSpeed = viewportConfig.scrollHorizontalSpeed
  /**
   * Vertical scroll speed (pixels per event unit)
   */
  const verticalSpeed = viewportConfig.scrollVerticalSpeed

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

  // ------------------------------
  // Wrapper and content dimensions
  // ------------------------------

  /**
   * Width and height of the wrapper element
   */
  const wrapperWidth = ref(1)
  const wrapperHeight = ref(1)
  /**
   * Width and height of the content element
   */
  const contentWidth = ref(1)
  const contentHeight = ref(1)

  /**
   * Width and height of content scaled by zoom
   */
  const contentTotalWidth = ref(1)
  const contentTotalHeight = ref(1)

  /**
   * Update wrapper and content dimensions from DOM
   */
  const updateInitialDimensions = () => {
    wrapperWidth.value = wrapperRef.value?.clientWidth || 1
    wrapperHeight.value = wrapperRef.value?.clientHeight || 1
    contentWidth.value = contentRef.value?.offsetWidth || 1
    contentHeight.value = contentRef.value?.offsetHeight || 1
  }

  /**
   * Update calculated dimensions based on current zoom level
   */
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

  // ------------------------------
  // Scrollbar slider
  // ------------------------------

  /**
   * Vertical and horizontal slider range (max - min)
   */
  const verticalSliderRange = ref(0)
  const horizontalSliderRange = ref(0)

  /**
   * Minimum pixel size of scrollbar thumb
   */
  const minSliderSize = 30

  /**
   * Scroll limits (boundaries)
   */
  const scrollVerticalMin = ref(0)
  const scrollVerticalMax = ref(0)
  const scrollHorizontalMin = ref(0)
  const scrollHorizontalMax = ref(0)

  /**
   * Height and width of vertical and horizontal scrollbar thumb
   */
  const verticalSliderHeight = computed(() => {
    const visibleRatio = wrapperHeight.value / contentTotalHeight.value
    return clamp((wrapperHeight.value / 3) * visibleRatio, minSliderSize, wrapperHeight.value / 3)
  })
  const horizontalSliderWidth = computed(() => {
    const visibleRatio = wrapperWidth.value / contentTotalWidth.value
    return clamp((wrapperWidth.value / 3) * visibleRatio, minSliderSize, wrapperWidth.value / 3)
  })

  /**
   * Top position of vertical scrollbar thumb
   * Left position of horizontal scrollbar thumb
   */
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

  // ------------------------------
  // Dragging
  // ------------------------------

  /**
   * Minimum speed threshold for drag
   */
  const dragSpeedMin = 2
  /**
   * Maximum drag speed relative to zoom
   */
  const dragSpeedMax = viewportConfig.maxZoomLevel

  /**
   * Whether the user is currently dragging the viewport
   */
  const isDraggingHorizontal = ref(false)
  const isDraggingVertical = ref(false)
  const isMiddleDragging = ref(false)

  /**
   * Start dragging in the specified axis direction
   * @param {string} axis - 'x' or 'y' for horizontal or vertical dragging
   * @param {MouseEvent} event - Mouse event
   */
  const startDrag = (axis, event) => {
    event.preventDefault()
    const startClient = axis === 'y' ? event.clientY : event.clientX
    const startPan = axis === 'y' ? viewportStore.panY : viewportStore.panX

    const onMouseMove = (e) => {
      const delta = (axis === 'y' ? e.clientY : e.clientX) - startClient
      const speed = clamp(zoomLevel.value, dragSpeedMin, dragSpeedMax)

      if (axis === 'y') {
        isDraggingVertical.value = true
        viewportStore.panY = clamp(
          startPan - delta * speed,
          scrollVerticalMin.value,
          scrollVerticalMax.value,
        )
      } else {
        isDraggingHorizontal.value = true
        viewportStore.panX = clamp(
          startPan - delta * speed,
          scrollHorizontalMin.value,
          scrollHorizontalMax.value,
        )
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

  // ------------------------------
  // Centering and fitting the image
  // ------------------------------

  /**
   * Center the image in the viewport
   */
  const centerImage = () => {
    console.log('------- Centering image ')
    if (!wrapperRef.value || !contentRef.value) return
    viewportStore.resetZoom()

    fitToScreenZoomLevel()

    centerImagePosition()
  }

  /**
   * Center the image position in the viewport
   */
  const centerImagePosition = () => {
    if (!wrapperRef.value || !contentRef.value) return

    updateInitialDimensions()
    updateZoomDependentDimensions()

    const slidersCorrection = uiStore.rulersEnabled ? 0 : 7.5

    panX.value = wrapperWidth.value / 2 - (contentWidth.value * zoomLevel.value) / 2
    panY.value =
      wrapperHeight.value / 2 - (contentHeight.value * zoomLevel.value) / 2 - slidersCorrection

    viewportStore.defaultPanX = wrapperWidth.value / 2 - (contentWidth.value * zoomLevel.value) / 2
    viewportStore.defaultPanY =
      wrapperHeight.value / 2 - (contentHeight.value * zoomLevel.value) / 2 - slidersCorrection
  }

  /**
   * Set values for centering the image after zoom changes
   */
  const setValuesForCenterImage = () => {
    if (!wrapperRef.value || !contentRef.value) return
    // Reset zoom
    const tmpZoomLevel = viewportStore.zoomLevel
    viewportStore.resetZoom() // TODO - delete if everything works (closing right panel with different zoom than 100 was moving image)

    updateInitialDimensions()
    updateZoomDependentDimensions()

    const slidersCorrection = uiStore.rulersEnabled ? 0 : 7.5

    viewportStore.defaultPanX = wrapperWidth.value / 2 - (contentWidth.value * zoomLevel.value) / 2
    viewportStore.defaultPanY =
      wrapperHeight.value / 2 - (contentHeight.value * zoomLevel.value) / 2 - slidersCorrection

    viewportStore.setZoomLevel(tmpZoomLevel)
  }

  /**
   * Fit the image to the screen based on current wrapper size
   */
  const fitToScreenZoomLevel = () => {
    updateInitialDimensions()

    const frameWidth = imageStore.frame?.enabled ? imageStore.frame.width * 2 : 0
    let frameHeight = imageStore.frame?.enabled ? imageStore.frame.height * 2 : 0
    if (imageStore.frame?.headerSize > 0) {
      frameHeight = imageStore.frame.headerSize + imageStore.frame.height
    } else if (imageStore.frame?.footerSize > 0) {
      frameHeight = imageStore.frame.footerSize + imageStore.frame.height
    }

    const rulerCorrection = uiStore.rulersEnabled ? 30 : 15 // 15 - ruler size

    const mode = viewportStore.zoomMode

    if (mode === 'classic') {
      // Classic fit
      const scaleX = (wrapperWidth.value - rulerCorrection) / (contentWidth.value + frameWidth)
      const scaleY = (wrapperHeight.value - rulerCorrection) / (contentHeight.value + frameHeight)

      const optimalZoom = Math.min(scaleX, scaleY)

      viewportStore.fitZoomLevel = (viewportStore.zoomLevel / optimalZoom) * 1.1
    } else if (mode === 'text') {
      // Text fit
      const scale = viewportStore.textWidth / viewportConfig.a4paperWidth

      const scaleX =
        ((wrapperWidth.value - rulerCorrection) * scale) / (contentWidth.value + frameHeight)

      viewportStore.fitZoomLevel = viewportStore.zoomLevel / scaleX
    }

    updateZoomDependentDimensions()
  }

  /**
   * Center image if reset zoom was pressed
   */
  watch(
    () => viewportStore.shouldFitToScreen,
    (shouldFit) => {
      if (shouldFit) {
        console.log('should fit to screen')
        centerImage()
        viewportStore.shouldFitToScreen = false
      }
    },
    // { immediate: true },
  )

  /**
   * Center image position when close or open right panel
   */
  watch(
    () => uiStore.rightPanelOpen,
    () => {
      nextTick(() => {
        centerImagePosition()
      })
    },
    { immediate: true },
  )

  /**
   * Center image after zoom mode changing
   */
  watch(
    [() => viewportStore.zoomMode, () => viewportStore.textWidth],
    () => {
      console.log('Zoom mode or text width changed')
      centerImage()
      viewportStore.resetZoom()
      viewportStore.resetPan()
      viewportStore.shouldFitToScreen = true
    },
    // { immediate: true },
  )

  // ------------------------------
  // Ruler
  // ------------------------------

  /**
   * Dynamic step size for ruler marks based on zoom level
   */
  const dynamicStep = computed(() => {
    const z = zoomLevel.value
    if (z >= 4) return 5
    if (z >= 2) return 10
    if (z >= 1.5) return 20
    if (z >= 1.0) return 40
    if (z >= 0.5) return 80
    if (z >= 0.25) return 160
    if (z >= 0.2) return 320
    if (z >= 0.1) return 640

    return 1020
  })

  /**
   * Horizontal and vertical ruler marks
   */
  const horizontalRulerMarks = ref([])
  const verticalRulerMarks = ref([])

  /**
   * Update horizontal ruler marks based on current pan and zoom
   */
  const updateHorizontalRulerMarks = () => {
    const spacing = dynamicStep.value * zoomLevel.value
    const width = wrapperSize.value.width || 0
    const start = Math.floor(-panX.value / spacing) - 1
    const end = Math.ceil((width - panX.value) / spacing) + 1

    const marks = []

    for (let i = start; i < end; i++) {
      const base = i * spacing + panX.value
      marks.push({ left: base, label: i * dynamicStep.value, isSub: false })
      for (let j = 1; j < 5; j++) {
        const subLeft = base + (j * spacing) / 5
        marks.push({ left: subLeft, label: '', isSub: true })
      }
    }

    horizontalRulerMarks.value = marks
  }
  /**
   * Update vertical ruler marks based on current pan and zoom
   */
  const updateVerticalRulerMarks = () => {
    const spacing = dynamicStep.value * zoomLevel.value
    const height = wrapperSize.value.height || 0
    const start = Math.floor(-panY.value / spacing) - 1
    const end = Math.ceil((height - panY.value) / spacing) + 1

    const marks = []

    for (let i = start; i < end; i++) {
      const base = i * spacing + panY.value
      marks.push({ top: base, label: i * dynamicStep.value, isSub: false })
      for (let j = 1; j < 5; j++) {
        const subTop = base + (j * spacing) / 5
        marks.push({ top: subTop, label: '', isSub: true })
      }
    }

    verticalRulerMarks.value = marks
  }

  /**
   * Throttle updates to ruler marks to avoid performance issues
   * This will update the marks at approximately 30 FPS
   */
  const throttledUpdateRulers = useThrottleFn(() => {
    setTimeout(() => {
      // Needed because when side panel was opened/closed it calculate marks without waiting for wrapper size change
      updateHorizontalRulerMarks()
      updateVerticalRulerMarks()
    }, 0)
  }, 50) // Run one time each 50 ms

  watch([panX, panY, zoomLevel, () => uiStore.rightPanelOpen], throttledUpdateRulers, {
    immediate: true,
  })

  /**
   * Mouse position relative to the viewport
   * Used for displaying cursor coordinates
   */
  const mouseX = ref(null)
  const mouseY = ref(null)

  /**
   * Update mouse position relative to the wrapper element
   * @param {MouseEvent} event - Mouse event
   */
  const onMouseMove = (event) => {
    const rect = wrapperRef.value?.getBoundingClientRect()
    if (!rect) return

    mouseX.value = event.clientX - rect.left
    mouseY.value = event.clientY - rect.top
  }

  /**
   * Computed cursor position in image coordinates for displaying position of the mouse cursor on rulers
   */
  const cursorPosX = computed(() => round((mouseX.value - panX.value) / zoomLevel.value))
  const cursorPosY = computed(() => round((mouseY.value - panY.value) / zoomLevel.value))

  /**
   * Check if cursor position is at the edges of the image
   * Used for displaying special markers on rulers
   */
  const cursorPosXSameAsImageWidth = computed(() => {
    return cursorPosX.value == imageStore.fileDimensions.width || cursorPosX.value == 0
  })
  const cursorPosYSameAsImageHeight = computed(() => {
    return cursorPosY.value == imageStore.fileDimensions.height || cursorPosY.value == 0
  })

  // ------------------------------
  // Guide lines
  // ------------------------------
  /**
   * Guide line definition (center point + angle in degrees)
   */
  const guideLines = computed(() => {
    return viewportStore.guideLines
  })

  // ------------------------------
  // Initialization and cleanup
  // ------------------------------

  /**
   * Resizing observer to adjust centering on wrapper size changes
   */
  let resizeObserver

  //Set initial values for centering the image
  onMounted(() => {
    viewportStore.viewportContentRect = contentRef.value?.getBoundingClientRect() || {}

    nextTick(() => {
      console.log('Mounted viewport wrapper')
      centerImage()

      // Center the image after resizing the wrapper
      if (wrapperRef.value) {
        resizeObserver = new ResizeObserver(() => {
          wrapperSize.value = {
            width: wrapperRef.value.clientWidth,
            height: wrapperRef.value.clientHeight,
          }

          setValuesForCenterImage()

          throttledUpdateRulers()
        })
        resizeObserver.observe(wrapperRef.value)
      }
    })
  })

  // Cleanup on unmount
  onBeforeUnmount(() => {
    if (resizeObserver && wrapperRef.value) {
      resizeObserver.unobserve(wrapperRef.value)
    }
  })

  /**
   * Watch for changes of zoom level and update dimensions
   */
  watch(zoomLevel, () => {
    updateZoomDependentDimensions()
  })

  /**
   * Center the image when the rendered image changes
   */
  watch(
    () => imageStore.getRenderedImage({ t, renderCall: false }),
    () => {
      nextTick(() => {
        if (viewportStore.fitImageOnLoad && !uiStore.isLoading) {
          viewportStore.resetZoom()
          console.log('Render image')
          centerImage()

          viewportStore.fitImageOnLoad = false
        }
      })
    },
  )

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
    onMouseMove,
    mouseX,
    mouseY,
    cursorPosX,
    cursorPosY,
    cursorPosXSameAsImageWidth,
    cursorPosYSameAsImageHeight,
    guideLines,
  }
}
