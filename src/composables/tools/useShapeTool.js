import { computed, ref, watch, watchEffect, nextTick } from 'vue'
import { useMath } from '../common/useMath'
import { useSvgFunctions } from './useSvgFunctions'
import { useSendEvent } from '../common/useSendEvent'

/**
 * Local editable settings for shape tool
 */
const localObjectSettings = ref({
  type: 'none',
  fillEnabled: true,
  fillColor: '#000000',
  strokeColor: '#000000',
  strokeWidth: 0,
  width: 0,
  height: 0,
  x: 0,
  y: 0,
  rotation: 0,
  opacity: 1,
  cornerRadius: 0,
  lineType: 'solid',
  lineArrowStart: 'none',
  lineArrowEnd: 'none',
})

/**
 * Active SVG object reference
 */
const activeObject = ref(null)

/**
 * Logic for shape editing in SVG
 * @param {Object} editorStore - Store containing editor state
 * @param {Object} imageStore - Store containing svgObjects and file dimensions
 * @param {Object} historyStore - History store
 * @param {Function} t - Translation function
 * @returns {Object} Composable methods and reactive properties for shape tool
 */
export function useShapeTool(editorStore, imageStore, historyStore, t) {
  const { clamp, round } = useMath()
  const { getObjectCenter } = useSvgFunctions(imageStore)

  /**
   * Hide position and dimensions settings in the shape tool settings
   */
  const hidePositionAndDimensions = ref(true)

  /**
   * Reset the local object settings to default values
   */
  const resetObjectSettings = () => {
    localObjectSettings.value.fillEnabled = true
    localObjectSettings.value.fillColor = '#000000'
    localObjectSettings.value.strokeColor = '#000000'
    localObjectSettings.value.strokeWidth = localObjectSettings.value.type === 'line' ? 1 : 0
    localObjectSettings.value.width = 0
    localObjectSettings.value.height = 0
    localObjectSettings.value.x = 0
    localObjectSettings.value.y = 0
    localObjectSettings.value.rotation = 0
    localObjectSettings.value.opacity = 1
    localObjectSettings.value.cornerRadius = 0
    localObjectSettings.value.lineType = 'solid'
    localObjectSettings.value.lineArrowStart = 'none'
    localObjectSettings.value.lineArrowEnd = 'none'
    activeObject.value = null
  }

  watch(
    () => imageStore.file,
    () => {
      localObjectSettings.value.cornerRadius = 0
    },
  )

  /**
   * Calculate maximum and minimal position for shape objects
   */
  const maxShapePositionX = computed(() => {
    return imageStore.fileDimensions.width - localObjectSettings.value.width
  })
  const maxShapePositionY = computed(() => {
    return imageStore.fileDimensions.height - localObjectSettings.value.height
  })

  // -------------------------------
  // Dimensions
  // -------------------------------
  /**
   * Calculate maximum and minimum width for shape objects
   */
  const maxShapeWidth = computed(() => {
    return imageStore.fileDimensions.width - localObjectSettings.value.x
  })
  const maxShapeHeight = computed(() => {
    return imageStore.fileDimensions.height - localObjectSettings.value.y
  })
  /**
   * Refs for width and height inputs
   */
  const widthInputRef = ref(null)
  const heightInputRef = ref(null)
  /**
   * Temporary refs to store shape width and height for syncing with external components
   */
  const tmpShapeWidth = ref(localObjectSettings.value.width)
  const tmpShapeHeight = ref(localObjectSettings.value.height)
  /**
   * Watch for changes in shape width and height to update temporary refs
   */
  watch(
    () => localObjectSettings.value.width,
    (value) => {
      tmpShapeWidth.value = value
    },
  )
  watch(
    () => localObjectSettings.value.height,
    (value) => {
      tmpShapeHeight.value = value
    },
  )

  /**
   * Whether the dimensions are linked
   */
  const isDimensionsLinked = ref(true)

  /**
   * Line type options for the line shape
   */
  const lineTypeOptions = computed(() => [
    { value: 'solid', label: t('tools.shape.settings.lineType.options.solid') },
    { value: 'dashed', label: t('tools.shape.settings.lineType.options.dashed') },
    { value: 'dotted', label: t('tools.shape.settings.lineType.options.dotted') },
    { value: 'dashDot', label: t('tools.shape.settings.lineType.options.dashDot') },
  ])

  /**
   * Line arrow options for the line shape
   */
  const lineArrowOptions = computed(() => [
    { value: 'none', label: t('tools.shape.settings.lineArrow.options.none') },
    { value: 'arrow', label: t('tools.shape.settings.lineArrow.options.arrow') },
    // { value: 'square', label: t('tools.shape.settings.lineArrow.options.square') },
    // { value: 'circle', label: t('tools.shape.settings.lineArrow.options.circle') },
  ])

  /**
   * Mapping of lineType to pattern ratios relative to stroke-width
   */
  const lineDashPatternMap = {
    solid: [],
    dashed: [4, 2], // 4x strokeWidth dash, 2x strokeWidth gap
    dotted: [1, 2], // 1x strokeWidth dot, 2x strokeWidth gap
    dashDot: [4, 2, 1, 2], // dash, gap, dot, gap
  }

  /**
   * Mapping of marker types to SVG marker URLs
   */
  const markerMap = {
    none: '',
    arrow: 'url(#arrow-end)',
    circle: 'url(#circle-end)',
    square: 'url(#square-end)',
  }

  /**
   * Get stroke-dasharray string based on lineType and strokeWidth
   * @param {'solid' | 'dashed' | 'dotted' | 'dashDot'} lineType
   * @param {number} strokeWidth
   * @returns {string}
   */
  const getDashArrayFromLineType = (lineType, strokeWidth) => {
    const pattern = lineDashPatternMap[lineType]
    if (!pattern || pattern.length === 0) return ''
    return pattern.map((mult) => (mult * strokeWidth).toFixed(2)).join(',')
  }

  /**
   * Convert stroke-dasharray value to lineType based on strokeWidth
   * @param {string | undefined} dashArray - Value from attrs['stroke-dasharray']
   * @param {number} strokeWidth
   * @returns {'solid' | 'dashed' | 'dotted' | 'dashDot'}
   */
  const mapDashArrayToLineType = (dashArray, strokeWidth) => {
    if (!dashArray || dashArray === 'none' || dashArray.trim() === '') {
      return 'solid'
    }

    const parts = dashArray.split(',').map((n) => parseFloat(n.trim()))
    if (parts.some(isNaN) || strokeWidth <= 0) return 'solid'

    // Normalize to ratio against strokeWidth
    const ratios = parts.map((n) => round(n / strokeWidth))

    // Compare with known patterns
    const match = (a, b) => a.length === b.length && a.every((v, i) => v === b[i])

    if (match(ratios, lineDashPatternMap.dashed)) return 'dashed'
    if (match(ratios, lineDashPatternMap.dotted)) return 'dotted'
    if (match(ratios, lineDashPatternMap.dashDot)) return 'dashDot'

    return 'solid' // fallback
  }

  /**
   * Reset the local object settings to default values when the shape is changed
   */
  watch(
    () => editorStore.selectedTabPerTool['shape'],
    (newTab) => {
      if (newTab === localObjectSettings.value.type) return

      // Reset only when not coming from select tool
      if (editorStore.previousToolKey !== 'select') {
        console.log('Shape tab changed, resetting settings: ', newTab)
        localObjectSettings.value.type = newTab
        imageStore.selectedSvgObjectId = null // Reset selection when tab changes
        imageStore.selectedSvgObjectIds = [] // Reset multi-selection
        editorStore.isSvgObjectSelected = false // Reset selection state

        resetObjectSettings()
      }
    },
  )

  /**
   * Load shape settings when shape object is selected
   */
  watch(
    () => imageStore.selectedSvgObjectId,
    (newId) => {
      if (newId !== null) {
        const object = imageStore.getSvgObjectById(newId)
        if (object && editorStore.selectedToolKey === 'shape') {
          activeObject.value = object
          hidePositionAndDimensions.value = false

          const { attrs, tag } = object

          // Change selectedTabPerTool according to the object type
          let newTab = tag
          if (tag === 'rect') {
            newTab = 'rectangle'
          }
          editorStore.selectTab(newTab)

          localObjectSettings.value.type = tag

          // Position and dimensions
          if (tag === 'rect') {
            localObjectSettings.value.x = attrs.x
            localObjectSettings.value.y = attrs.y
            localObjectSettings.value.width = attrs.width
            localObjectSettings.value.height = attrs.height
          } else if (tag === 'ellipse') {
            localObjectSettings.value.x = attrs.cx - attrs.rx
            localObjectSettings.value.y = attrs.cy - attrs.ry
            localObjectSettings.value.width = attrs.rx * 2
            localObjectSettings.value.height = attrs.ry * 2
          } else if (tag === 'line') {
            localObjectSettings.value.x = attrs.x1
            localObjectSettings.value.y = attrs.y1
            localObjectSettings.value.width = attrs.x2 - attrs.x1
            localObjectSettings.value.height = attrs.y2 - attrs.y1
          }

          // Fill and stroke settings
          localObjectSettings.value.fillEnabled = attrs.fill !== 'none'
          if (localObjectSettings.value.fillEnabled) {
            localObjectSettings.value.fillColor = attrs.fill
          } else {
            localObjectSettings.value.fillColor = '#000000'
          }

          if (attrs['stroke-width'] > 0) {
            localObjectSettings.value.strokeColor = attrs.stroke
            localObjectSettings.value.strokeWidth = attrs['stroke-width']
          } else {
            localObjectSettings.value.strokeColor = '#000000'
            localObjectSettings.value.strokeWidth = 0
          }

          // Rotation angle
          localObjectSettings.value.rotation = attrs.transform
            ? parseFloat(attrs.transform.match(/rotate\(([^)]+)\)/)?.[1]) || 0
            : 0

          // Opacity
          localObjectSettings.value.opacity = attrs.opacity !== undefined ? attrs.opacity : 1

          // Corner radius for rectangles
          if (tag === 'rect') {
            localObjectSettings.value.cornerRadius = attrs.rx || 0 // Use rx as corner radius if available
          } else {
            localObjectSettings.value.cornerRadius = 0 // Reset for other shapes
          }

          // Line type for line shapes
          if (tag === 'line') {
            localObjectSettings.value.lineType = mapDashArrayToLineType(
              attrs['stroke-dasharray'],
              attrs['stroke-width'] || 1,
            )
          }

          // Line arrow types for line shapes
          if (tag === 'line') {
            localObjectSettings.value.lineArrowStart =
              attrs['marker-start'] && attrs['marker-start'].includes('arrow')
                ? 'arrow'
                : attrs['marker-start'] && attrs['marker-start'].includes('circle')
                  ? 'circle'
                  : attrs['marker-start'] && attrs['marker-start'].includes('square')
                    ? 'square'
                    : 'none'

            localObjectSettings.value.lineArrowEnd =
              attrs['marker-end'] && attrs['marker-end'].includes('arrow')
                ? 'arrow'
                : attrs['marker-end'] && attrs['marker-end'].includes('circle')
                  ? 'circle'
                  : attrs['marker-end'] && attrs['marker-end'].includes('square')
                    ? 'square'
                    : 'none'
          }
        }
      } else {
        hidePositionAndDimensions.value = true
      }
    },
    { immediate: true },
  )

  /**
   * Update the localObjectSettings when activeObject changes outside this composable
   */
  watchEffect(() => {
    const object = activeObject.value
    if (!object || editorStore.selectedToolKey !== 'shape') return

    const { attrs, tag } = object

    // Position and dimensions
    if (tag === 'rect') {
      localObjectSettings.value.x = attrs.x
      localObjectSettings.value.y = attrs.y
      localObjectSettings.value.width = attrs.width
      localObjectSettings.value.height = attrs.height
    } else if (tag === 'ellipse') {
      localObjectSettings.value.x = attrs.cx - attrs.rx
      localObjectSettings.value.y = attrs.cy - attrs.ry
      localObjectSettings.value.width = attrs.rx * 2
      localObjectSettings.value.height = attrs.ry * 2
    } else if (tag === 'line') {
      localObjectSettings.value.x = attrs.x1
      localObjectSettings.value.y = attrs.y1
      localObjectSettings.value.width = attrs.x2 - attrs.x1
      localObjectSettings.value.height = attrs.y2 - attrs.y1
    }

    // Rotation angle
    localObjectSettings.value.rotation = attrs.transform
      ? parseFloat(attrs.transform.match(/rotate\(([^)]+)\)/)?.[1]) || 0
      : 0
  })

  /**
   * Apply local settings to the active SVG object
   */
  const applyLocalSettings = () => {
    if (!editorStore.isSvgObjectSelected) return
    const object = activeObject.value
    if (!object) return

    const settings = localObjectSettings.value
    const { tag, attrs } = object

    // Position and dimensions
    if (tag === 'rect') {
      attrs.x = settings.x
      attrs.y = settings.y
      attrs.width = settings.width
      attrs.height = settings.height
    } else if (tag === 'ellipse') {
      attrs.rx = settings.width / 2
      attrs.ry = settings.height / 2
      attrs.cx = settings.x + attrs.rx
      attrs.cy = settings.y + attrs.ry
    } else if (tag === 'line') {
      attrs.x1 = settings.x
      attrs.y1 = settings.y
      attrs.x2 = settings.x + settings.width
      attrs.y2 = settings.y + settings.height
    }

    // Fill and stroke settings
    if (settings.fillEnabled) {
      attrs.fill = settings.fillColor
    } else {
      attrs.fill = 'none'
    }

    if (settings.strokeWidth > 0) {
      attrs['stroke-width'] = settings.strokeWidth
      attrs.stroke = settings.strokeColor
    } else {
      attrs['stroke-width'] = 0
      attrs.stroke = 'none'
    }

    // Rotation angle
    const { cx, cy } = getObjectCenter(object)
    attrs.transform = `rotate(${settings.rotation}, ${cx}, ${cy})`

    // Opacity
    attrs.opacity = settings.opacity

    // Corner radius for rectangles
    if (tag === 'rect') {
      attrs.rx = settings.cornerRadius
    }

    if (tag === 'line') {
      // Line type
      attrs['stroke-dasharray'] = getDashArrayFromLineType(settings.lineType, settings.strokeWidth)

      // Line arrow types
      attrs['marker-start'] = markerMap[settings.lineArrowStart]
      attrs['marker-end'] = markerMap[settings.lineArrowEnd]
      attrs.fill = settings.strokeColor
    }

    useSendEvent().sendEvent('toolSettings', 'shape', 'update', {
      settings: { ...localObjectSettings.value },
    })

    historyStore.push(imageStore.getSnapshot(t))
  }

  /**
   * Get the current shape attributes for external use
   */
  const getShapeAttributes = () => {
    const settings = { ...localObjectSettings.value }

    // If it is line remap line type
    if (settings.type === 'line') {
      settings.lineType = getDashArrayFromLineType(settings.lineType, settings.strokeWidth)

      settings.lineArrowStart = markerMap[settings.lineArrowStart]
      settings.lineArrowEnd = markerMap[settings.lineArrowEnd]
    }

    useSendEvent().sendEvent('toolSettings', 'shape', 'create', {
      settings: { ...settings },
    })

    return settings
  }

  /**
   * Update the dimension of the shape object
   * @param {string} key - 'width' or 'height'
   * @param {number} value - New dimension value
   */
  const updateDimension = (key, value) => {
    const originalWidth = localObjectSettings.value.width
    const originalHeight = localObjectSettings.value.height

    if (key === 'width') {
      const clampedWidth = round(clamp(value, 0, maxShapeWidth.value))

      // Dimensions are linked
      if (isDimensionsLinked.value && originalWidth > 0) {
        const aspectRatio = originalHeight / originalWidth
        localObjectSettings.value.width = clampedWidth
        localObjectSettings.value.height = round(
          clamp(clampedWidth * aspectRatio, 0, maxShapeHeight.value),
        )
      } else {
        localObjectSettings.value.width = clampedWidth
      }
    } else if (key === 'height') {
      const clampedHeight = round(clamp(value, 0, maxShapeHeight.value))

      // Dimensions are linked
      if (isDimensionsLinked.value && originalHeight > 0) {
        console.log('Updating height with aspect ratio')
        const aspectRatio = originalWidth / originalHeight
        localObjectSettings.value.height = clampedHeight
        localObjectSettings.value.width = round(
          clamp(clampedHeight * aspectRatio, 0, maxShapeWidth.value),
        )
      } else {
        localObjectSettings.value.height = clampedHeight
      }
    }
    nextTick(() => {
      heightInputRef.value.setValue(localObjectSettings.value.height)
      widthInputRef.value.setValue(localObjectSettings.value.width)
    })

    applyLocalSettings()
  }

  /**
   * Reset the rotation angle of the shape object
   */
  const resetRotationAngle = () => {
    localObjectSettings.value.rotation = 0
    applyLocalSettings()
  }

  /**
   * Reset the opacity of the shape object
   */
  const resetOpacity = () => {
    localObjectSettings.value.opacity = 1
    applyLocalSettings()
  }

  /**
   * Reset the corner radius of the rectangle object
   */
  const resetCornerRadius = () => {
    localObjectSettings.value.cornerRadius = 0
    applyLocalSettings()
  }

  return {
    localObjectSettings,
    resetObjectSettings,
    getShapeAttributes,
    maxShapePositionX,
    maxShapePositionY,
    maxShapeWidth,
    maxShapeHeight,
    applyLocalSettings,
    widthInputRef,
    heightInputRef,
    updateDimension,
    isDimensionsLinked,
    tmpShapeHeight,
    tmpShapeWidth,
    hidePositionAndDimensions,
    resetRotationAngle,
    resetOpacity,
    resetCornerRadius,
    lineTypeOptions,
    lineArrowOptions,
  }
}
