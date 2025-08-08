import { editorConfig } from '@/config/editorConfig'
import { ref, computed, watch, watchEffect, onMounted } from 'vue'

const localMagnifyAreaSettings = ref({
  sourceX: 0,
  sourceY: 0,
  resultX: 0,
  resultY: 0,
  resultPosition: 'top-right', // top-left, top-right, bottom-left, bottom-right
  radius: 60, // TODO - make it dynamic based on image size
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
  const magnifyImageSrc = computed(() => imageStore.renderedImage?.toDataURL() ?? '')

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

    return Math.floor(smallerDimension / localMagnifyAreaSettings.value.zoom / 2)
  })

  /**
   * Options for the magnify area radius
   */
  const magnifyAreaRadiusOptions = computed(() => {
    const options = []
    const maxRadius = maxMagnifyAreaRadius.value
    for (let i = 1; i <= maxRadius; i = i + 5) {
      options.push(i)
    }
    return options
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
   * Reset magnify area settings to default values
   */
  const resetMagnifyAreaSettings = () => {
    localMagnifyAreaSettings.value.sourceX = 0
    localMagnifyAreaSettings.value.sourceY = 0
    localMagnifyAreaSettings.value.resultX = 0
    localMagnifyAreaSettings.value.resultY = 0
    localMagnifyAreaSettings.value.resultPosition = 'top-right' // Reset to default position
    localMagnifyAreaSettings.value.radius = 60 // TODO - make it dynamic based on image size
    localMagnifyAreaSettings.value.zoom = 2
    localMagnifyAreaSettings.value.outlineWidth = 1
    localMagnifyAreaSettings.value.outlineColor = '#000000'
    activeObject.value = null
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
            : imageStore.getSvgObjectById(object.linkedZoomId)

        if (!source || !result) return

        // Source position
        localMagnifyAreaSettings.value.sourceX = source.attrs.cx
        localMagnifyAreaSettings.value.sourceY = source.attrs.cy

        // Result position
        localMagnifyAreaSettings.value.resultX = result.attrs.cx
        localMagnifyAreaSettings.value.resultY = result.attrs.cy

        // Radius
        const radius = source.attrs.rx
        localMagnifyAreaSettings.value.radius = radius

        // Zoom
        const zoom = result.attrs.rx / radius
        localMagnifyAreaSettings.value.zoom = zoom

        const resultRadius = radius * zoom
        const { width, height } = imageStore.fileDimensions

        // Infer resultPosition from coordinates
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
   */
  const applyLocalMagnifyAreaSettings = () => {
    if (!activeObject.value) return

    const settings = localMagnifyAreaSettings.value
    const source = activeObject.value
    if (!source) return

    const result = imageStore.getSvgObjectById(source.linkedZoomId)
    if (!result) return

    const radius = settings.radius
    const zoom = settings.zoom
    const resultRadius = radius * zoom
    const padding = resultPadding.value

    const imageWidth = imageStore.fileDimensions.width
    const imageHeight = imageStore.fileDimensions.height

    // Compute result position based on selected corner
    let resultX = 0
    let resultY = 0

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

    // Update source object
    source.attrs.cx = settings.sourceX
    source.attrs.cy = settings.sourceY
    source.attrs.rx = radius
    source.attrs.ry = radius

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

    historyStore.push(imageStore.getSnapshot(t))
  }

  /**
   * Add a new magnify area
   * @param {number} x - X coordinate of the source magnify area
   * @param {number} y - Y coordinate of the source magnify area
   */
  const addMagnifyArea = (x, y) => {
    const sourceId = Date.now()
    const resultId = sourceId + 1

    const radius = localMagnifyAreaSettings.value.radius
    const zoom = localMagnifyAreaSettings.value.zoom
    const resultRadius = radius * zoom
    const padding = resultPadding.value

    const imageWidth = imageStore.fileDimensions.width
    const imageHeight = imageStore.fileDimensions.height

    // Result position
    let outputX = 0
    let outputY = 0

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

    // Pattern
    const patternId = `magnify-fill-${resultId}`
    const pattern = generateMagnifyPattern(patternId, x, y, outputX, outputY)

    imageStore.addOrReplaceSvgDef(patternId, pattern)

    // Set source
    const source = {
      id: sourceId,
      tag: 'ellipse',
      class: 'magnifyArea',
      subClass: 'magnify-source',
      attrs: {
        cx: x,
        cy: y,
        rx: radius,
        ry: radius,
        stroke: localMagnifyAreaSettings.value.outlineColor,
        'stroke-width': localMagnifyAreaSettings.value.outlineWidth,
        fill: localMagnifyAreaSettings.value.outlineColor,
        'fill-opacity': 0.1,
      },
      linkedZoomId: resultId,
    }

    // Set result
    const result = {
      id: resultId,
      tag: 'ellipse',
      class: 'magnifyArea',
      subClass: 'magnify-result',
      attrs: {
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

    imageStore.selectedSvgObjectId = resultId
    historyStore.push(imageStore.getSnapshot(t))
  }

  onMounted(() => {
    // Set default radius to 10 percent of smaller dimension of image
    const defaultRadius = Math.floor(
      imageStore.getSmallerImageDimension() * editorConfig.magnifyAreaDefaultRadiusFromImage,
    )
    localMagnifyAreaSettings.value.radius = defaultRadius
  })

  return {
    applyLocalMagnifyAreaSettings,
    localMagnifyAreaSettings,
    maxMagnifyAreaRadius,
    magnifyAreaRadiusOptions,
    hidePositionAndDimensions,
    resetMagnifyAreaSettings,
    addMagnifyArea,
    maxMagnifyAreaSourcePositionX,
    maxMagnifyAreaSourcePositionY,
    generateMagnifyPattern,
    magnifyAreaZoomOptions,
    resultPositionOptions,
    maxOutlineWidth,
  }
}
