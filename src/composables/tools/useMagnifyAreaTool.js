import { editorConfig } from '@/config/editorConfig'
import { ref, computed, watch, watchEffect, onMounted } from 'vue'
import { useSendEvent } from '../common/useSendEvent'

const localMagnifyAreaSettings = ref({
  type: 'center', // center, corner
  sourceX: 0,
  sourceY: 0,
  resultX: 0,
  resultY: 0,
  resultPosition: 'top-right', // top-left, top-right, bottom-left, bottom-right
  radius: 0,
  zoom: 2,
  outlineWidth: 1,
  outlineColor: '#000000',
})

export function useMagnifyAreaTool(imageStore, historyStore, editorStore, t) {
  /**
   * Active magnify area object being edited
   */
  const activeObject = ref(null)

  /**
   * Padding between magnify area and image edges
   */
  const resultPadding = computed(() => {
    // Half of stroke width
    return localMagnifyAreaSettings.value.outlineWidth / 2
  })

  /**
   * Computed source image data URL for magnification
   */
  const magnifyImageSrc = computed(
    () => imageStore.getRenderedImage({ t, renderCall: false }).toDataURL() ?? '',
  )

  // ------------------------------
  // Position
  // ------------------------------
  /**
   * Hide position and dimensions settings in the magnify area tool settings
   */
  const hidePositionAndDimensions = ref(true)

  /**
   * Maximum position for source X and Y coordinate of source magnify area
   */
  const maxMagnifyAreaSourcePositionX = computed(() => {
    return imageStore.fileDimensions.width - localMagnifyAreaSettings.value.radius / 2
  })
  const maxMagnifyAreaSourcePositionY = computed(() => {
    return imageStore.fileDimensions.height - localMagnifyAreaSettings.value.radius / 2
  })

  // ------------------------------
  // Radius
  // ------------------------------
  /**
   * Maximum radius for the magnify area
   */
  const maxMagnifyAreaRadius = computed(() => {
    const smallerDimension = imageStore.getSmallerImageDimension()

    let radius = Math.floor(smallerDimension / localMagnifyAreaSettings.value.zoom / 2)

    // if type center, also multiply by zoom to get displayed size
    if (localMagnifyAreaSettings.value.type === 'center') {
      radius = Math.floor(radius * localMagnifyAreaSettings.value.zoom)
    }

    return radius
  })

  // ------------------------------
  // Zoom
  // ------------------------------
  /**
   * Options for the magnify area zoom levels
   */
  const magnifyAreaZoomOptions = [
    {
      value: 2,
      label: '2x',
    },
    {
      value: 3,
      label: '3x',
    },
    {
      value: 4,
      label: '4x',
    },
  ]

  // ------------------------------
  // Outline
  // ------------------------------
  /**
   * Maximum outline width
   */
  const maxOutlineWidth = computed(() => {
    return Math.max(Math.floor(localMagnifyAreaSettings.value.radius / 2), 1)
  })

  /**
   * Options for the magnify area result position
   */
  const resultPositionOptions = [
    {
      label: t('tools.magnifyArea.settings.general.resultPosition.options.top-left'),
      value: 'top-left',
    },
    {
      label: t('tools.magnifyArea.settings.general.resultPosition.options.top-right'),
      value: 'top-right',
    },
    {
      label: t('tools.magnifyArea.settings.general.resultPosition.options.bottom-left'),
      value: 'bottom-left',
    },
    {
      label: t('tools.magnifyArea.settings.general.resultPosition.options.bottom-right'),
      value: 'bottom-right',
    },
  ]

  /**
   * Options for the magnify area type (center or corner)
   */
  const magnifyAreaTypeOptions = [
    {
      label: t('tools.magnifyArea.settings.general.type.options.center'),
      value: 'center',
    },
    {
      label: t('tools.magnifyArea.settings.general.type.options.corner'),
      value: 'corner',
    },
  ]

  /**
   * Save current config to editor store
   */
  const saveConfigToEditorStore = () => {
    for (const key in editorStore.toolsConfig.magnifyArea) {
      if (key in localMagnifyAreaSettings.value) {
        editorStore.toolsConfig.magnifyArea[key] = localMagnifyAreaSettings.value[key]
      }
    }
  }

  /**
   * Generate SVG pattern for magnify area
   *
   * @param {string} patternId - Unique ID for the pattern
   * @param {number} sourceX - X coordinate of the source magnify area
   * @param {number} sourceY - Y coordinate of the source magnify area
   * @param {number} resultX - X coordinate of the result magnify area
   * @param {number} resultY - Y coordinate of the result magnify area
   * @param {number} zoom - Zoom factor for the magnification
   * @return {string} SVG pattern string
   */
  const generateMagnifyPattern = (patternId, sourceX, sourceY, resultX, resultY) => {
    const offsetX = resultX - sourceX * localMagnifyAreaSettings.value.zoom
    const offsetY = resultY - sourceY * localMagnifyAreaSettings.value.zoom
    const transform = `translate(${offsetX}, ${offsetY}) scale(${localMagnifyAreaSettings.value.zoom})`

    return `
    <pattern id="${patternId}" patternUnits="userSpaceOnUse"
      width="${imageStore.fileDimensions.width}" height="${imageStore.fileDimensions.height}">
      <image href="${magnifyImageSrc.value}"
        x="0" y="0"
        width="${imageStore.fileDimensions.width}" height="${imageStore.fileDimensions.height}"
        transform="${transform}" />
    </pattern>
  `.trim()
  }

  /**
   * Watch selected object and load magnify settings
   */
  watch(
    () => imageStore.selectedSvgObjectId,
    (newId) => {
      if (newId !== null) {
        const object = imageStore.getSvgObjectById(newId)
        if (!object || object.class !== 'magnifyArea') return

        activeObject.value = object
        hidePositionAndDimensions.value = false

        const padding = resultPadding.value

        const source =
          object.subClass === 'magnify-source'
            ? object
            : imageStore.getSvgObjectById(object.linkedSourceId)
        const result =
          object.subClass === 'magnify-result'
            ? object
            : imageStore.getSvgObjectById(object.linkedResultId)

        if (!source || !result) return

        // Set type
        if (source.attrs.cx === result.attrs.cx && source.attrs.cy === result.attrs.cy) {
          localMagnifyAreaSettings.value.type = 'center'
        } else {
          localMagnifyAreaSettings.value.type = 'corner'
        }

        // Source position
        localMagnifyAreaSettings.value.sourceX = source.attrs.cx
        localMagnifyAreaSettings.value.sourceY = source.attrs.cy

        // Result position
        localMagnifyAreaSettings.value.resultX = result.attrs.cx
        localMagnifyAreaSettings.value.resultY = result.attrs.cy

        // Radius
        let radius = source.attrs.rx

        // Zoom
        const zoom = result.attrs.rx / radius
        localMagnifyAreaSettings.value.zoom = zoom

        // Displayed radius (if type is center, show radius of result area)
        if (localMagnifyAreaSettings.value.type === 'center') {
          radius *= zoom
        }
        localMagnifyAreaSettings.value.radius = radius

        // Compute result radius
        const resultRadius = radius * zoom
        const { width, height } = imageStore.fileDimensions

        // Get resultPosition from coordinates
        let resultPosition = 'bottom-right'
        const posX = result.attrs.cx
        const posY = result.attrs.cy

        if (Math.abs(posX - (padding + resultRadius)) < 2) {
          if (Math.abs(posY - (padding + resultRadius)) < 2) {
            resultPosition = 'top-left'
          } else if (Math.abs(posY - (height - padding - resultRadius)) < 2) {
            resultPosition = 'bottom-left'
          }
        } else if (Math.abs(posX - (width - padding - resultRadius)) < 2) {
          if (Math.abs(posY - (padding + resultRadius)) < 2) {
            resultPosition = 'top-right'
          } else if (Math.abs(posY - (height - padding - resultRadius)) < 2) {
            resultPosition = 'bottom-right'
          }
        }

        // Result position
        localMagnifyAreaSettings.value.resultPosition = resultPosition

        // Outline width
        localMagnifyAreaSettings.value.outlineWidth = source.attrs['stroke-width']

        // Outline color
        localMagnifyAreaSettings.value.outlineColor = source.attrs.stroke

        activeObject.value = source
      } else {
        activeObject.value = null
        hidePositionAndDimensions.value = true
      }
    },
    { immediate: true },
  )

  /**
   * Update the localMagnifyAreaSettings when activeObject changes outside this composable
   */
  watchEffect(() => {
    const object = activeObject.value
    if (!object || editorStore.selectedToolKey !== 'magnifyArea') return

    if (object.class === 'magnifyArea') {
      if (object.subClass === 'magnify-source') {
        // Source position
        localMagnifyAreaSettings.value.sourceX = object.attrs.cx
        localMagnifyAreaSettings.value.sourceY = object.attrs.cy
      }
    }
  })

  /**
   * Apply changes to both objects
   * @param {boolean} commit - When true, push to history store
s
   */
  const applyLocalMagnifyAreaSettings = (commit = true) => {
    if (!activeObject.value) return

    const settings = localMagnifyAreaSettings.value
    const source = activeObject.value
    if (!source) return

    const result = imageStore.getSvgObjectById(source.linkedResultId)
    if (!result) return

    let radius = settings.radius
    // If type is center, adjust radius to match displayed size
    if (settings.type === 'center') {
      radius /= settings.zoom
    }

    const zoom = settings.zoom
    const resultRadius = radius * zoom
    const padding = resultPadding.value

    const imageWidth = imageStore.fileDimensions.width
    const imageHeight = imageStore.fileDimensions.height

    // Compute result position based on selected corner
    let resultX = 0
    let resultY = 0

    if (settings.type === 'center') {
      resultX = settings.sourceX
      resultY = settings.sourceY
      source.attrs.type = 'center'
      result.attrs.type = 'center'
    } else {
      source.attrs.type = 'corner'
      result.attrs.type = 'corner'
      switch (settings.resultPosition) {
        case 'top-left':
          resultX = padding + resultRadius
          resultY = padding + resultRadius
          break
        case 'top-right':
          resultX = imageWidth - padding - resultRadius
          resultY = padding + resultRadius
          break
        case 'bottom-left':
          resultX = padding + resultRadius
          resultY = imageHeight - padding - resultRadius
          break
        case 'bottom-right':
        default:
          resultX = imageWidth - padding - resultRadius
          resultY = imageHeight - padding - resultRadius
          break
      }
    }

    console.log('Apply magnify area settings', settings, source, result)

    // Update source object
    source.attrs.cx = settings.sourceX
    source.attrs.cy = settings.sourceY
    source.attrs.rx = radius
    source.attrs.ry = radius

    source.attrs.visibility =
      localMagnifyAreaSettings.value.type === 'center' ? 'hidden' : 'visible'

    // Update result object
    result.attrs.cx = resultX
    result.attrs.cy = resultY
    result.attrs.rx = resultRadius
    result.attrs.ry = resultRadius

    // Generate pattern
    const patternId = `magnify-fill-${result.id}`
    const pattern = generateMagnifyPattern(
      patternId,
      settings.sourceX,
      settings.sourceY,
      resultX,
      resultY,
    )

    // Add pattern to image store
    imageStore.addOrReplaceSvgDef(patternId, pattern)
    result.attrs.fill = `url(#${patternId})`

    // Outline settings
    source.attrs['stroke-width'] = settings.outlineWidth
    source.attrs.stroke = settings.outlineColor
    result.attrs['stroke-width'] = settings.outlineWidth
    result.attrs.stroke = settings.outlineColor

    // Source fill
    source.attrs.fill = settings.outlineColor

    if (settings.type === 'corner') {
      imageStore.selectedSvgObjectId = source.id
    } else {
      imageStore.selectedSvgObjectId = result.id
    }

    // Push to history only when explicitly requested
    if (commit) {
      useSendEvent().sendEvent('toolSettings', 'magnifyArea', 'update', {
        settings: { ...localMagnifyAreaSettings.value },
      })

      saveConfigToEditorStore()

      historyStore.push(imageStore.getSnapshot(t))
    }
  }

  /**
   * Add a new magnify area
   * @param {number} x - X coordinate of the source magnify area
   * @param {number} y - Y coordinate of the source magnify area
   */
  const addMagnifyArea = (x, y) => {
    const sourceId = Date.now()
    const resultId = sourceId + 1

    let radius = localMagnifyAreaSettings.value.radius
    // If type is center, adjust radius to match displayed size
    if (localMagnifyAreaSettings.value.type === 'center') {
      radius /= localMagnifyAreaSettings.value.zoom
    }

    const zoom = localMagnifyAreaSettings.value.zoom
    const resultRadius = radius * zoom
    const padding = resultPadding.value

    const imageWidth = imageStore.fileDimensions.width
    const imageHeight = imageStore.fileDimensions.height

    // Result position
    let outputX = 0
    let outputY = 0

    if (localMagnifyAreaSettings.value.type === 'center') {
      outputX = x
      outputY = y
    } else {
      switch (localMagnifyAreaSettings.value.resultPosition) {
        case 'top-left':
          outputX = padding + resultRadius
          outputY = padding + resultRadius
          break
        case 'top-right':
          outputX = imageWidth - padding - resultRadius
          outputY = padding + resultRadius
          break
        case 'bottom-left':
          outputX = padding + resultRadius
          outputY = imageHeight - padding - resultRadius
          break
        case 'bottom-right':
        default:
          outputX = imageWidth - padding - resultRadius
          outputY = imageHeight - padding - resultRadius
          break
      }
    }

    // Pattern
    const patternId = `magnify-fill-${resultId}`
    const pattern = generateMagnifyPattern(patternId, x, y, outputX, outputY)

    imageStore.addOrReplaceSvgDef(patternId, pattern)

    // Set source
    const source = {
      id: sourceId,
      name: imageStore.getNextObjectName('magnifyArea', null),
      tag: 'ellipse',
      class: 'magnifyArea',
      subClass: 'magnify-source',
      attrs: {
        type: localMagnifyAreaSettings.value.type,
        cx: x,
        cy: y,
        rx: radius,
        ry: radius,
        stroke: localMagnifyAreaSettings.value.outlineColor,
        'stroke-width': localMagnifyAreaSettings.value.outlineWidth,
        fill: localMagnifyAreaSettings.value.outlineColor,
        'fill-opacity': 0.1,
        visibility: localMagnifyAreaSettings.value.type === 'center' ? 'hidden' : 'visible',
      },
      linkedResultId: resultId,
    }

    // Set result
    const result = {
      id: resultId,
      name: imageStore.getNextObjectName('magnifyArea', null),
      tag: 'ellipse',
      class: 'magnifyArea',
      subClass: 'magnify-result',
      attrs: {
        type: localMagnifyAreaSettings.value.type,
        cx: outputX,
        cy: outputY,
        rx: resultRadius,
        ry: resultRadius,
        stroke: localMagnifyAreaSettings.value.outlineColor,
        'stroke-width': localMagnifyAreaSettings.value.outlineWidth,
        fill: `url(#${patternId})`,
      },
      linkedSourceId: sourceId,
    }

    // Add svg objects
    imageStore.svgObjects.push(source)
    imageStore.svgObjects.push(result)

    if (localMagnifyAreaSettings.value.type === 'center') {
      imageStore.selectedSvgObjectId = resultId
    } else {
      imageStore.selectedSvgObjectId = sourceId
    }

    console.log('selected', imageStore.selectedSvgObjectId)

    useSendEvent().sendEvent('toolSettings', 'magnifyArea', 'create', {
      settings: { ...localMagnifyAreaSettings.value },
    })

    saveConfigToEditorStore()

    historyStore.push(imageStore.getSnapshot(t))
  }

  onMounted(() => {
    localMagnifyAreaSettings.value.type = editorStore.toolsConfig.magnifyArea.type
    localMagnifyAreaSettings.value.zoom = editorStore.toolsConfig.magnifyArea.zoom
    localMagnifyAreaSettings.value.outlineWidth = editorStore.toolsConfig.magnifyArea.outlineWidth
    localMagnifyAreaSettings.value.outlineColor = editorStore.toolsConfig.magnifyArea.outlineColor

    if (editorStore.toolsConfig.magnifyArea.radius !== 0) {
      localMagnifyAreaSettings.value.radius = editorStore.toolsConfig.magnifyArea.radius
    } else {
      localMagnifyAreaSettings.value.radius = Math.floor(
        // Set default radius to 10 percent of smaller dimension of image
        imageStore.getSmallerImageDimension() * editorConfig.magnifyAreaDefaultRadiusFromImage,
      )

      editorStore.toolsConfig.magnifyArea.radius = localMagnifyAreaSettings.value.radius
    }
  })

  return {
    applyLocalMagnifyAreaSettings,
    localMagnifyAreaSettings,
    maxMagnifyAreaRadius,
    hidePositionAndDimensions,
    addMagnifyArea,
    maxMagnifyAreaSourcePositionX,
    maxMagnifyAreaSourcePositionY,
    generateMagnifyPattern,
    magnifyAreaZoomOptions,
    resultPositionOptions,
    maxOutlineWidth,
    magnifyAreaTypeOptions,
  }
}
