import { ref, computed, watch, watchEffect, nextTick } from 'vue'
import { useMath } from '../common/useMath'
import { useSvgFunctions } from './useSvgFunctions'
import { useSendEvent } from '@/composables/common/useSendEvent'

/**
 * Local settings for the blur tool
 */
const localBlurSettings = ref({
  x: 0,
  y: 0,
  width: 0,
  height: 0,
  rotation: 0,
  blurType: 'black',
  fillColor: '#000000',
  patternSize: 10,
  blurStrength: 0.5,
  filter: null,
})

/**
 * Logic for blur tool
 * @param {Object} imageStore - Store containing svgObjects
 * @param {Object} historyStore - History store
 * @param {Object} editorStore - Store containing editor state
 * @param {Function} t - Translation function
 * @return {Object} Composable methods and reactive properties for blur tool
 */
export function useBlurTool(imageStore, historyStore, editorStore, t) {
  const { round, clamp } = useMath()
  const { getObjectCenter } = useSvgFunctions(imageStore)

  /**
   * String representation of SVG definitions used for blur patterns
   */
  const svgDefsString = computed(() => imageStore.svgDefs.join('\n'))

  /**
   * Convert hex color to RGB
   * @param {string} hex - Hex color
   * @returns {{r: number, g: number, b: number}}
   */
  const hexToRgb = (hex) => {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return { r, g, b }
  }

  /**
   * Convert RGB to hex color
   * @param {{r: number, g: number, b: number}} rgb
   * @returns {string}
   */
  const rgbToHex = ({ r, g, b }) => {
    const toHex = (val) => val.toString(16).padStart(2, '0')
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`
  }

  /**
   * Generate N perceptually adjusted shades from a base color
   * @param {string} baseColor - Base hex color
   * @param {number} count - Number of shades
   * @returns {string[]} Array of hex colors
   */
  const generateShadesFromColor = (baseColor, count = 16) => {
    const { r, g, b } = hexToRgb(baseColor)
    const shades = []

    for (let i = 0; i < count; i++) {
      const mix = (i + 1) / (count + 1) // range: (0, 1)
      const blendTarget = (r + g + b) / 3 > 128 ? 0 : 255

      const shade = {
        r: round(r + (blendTarget - r) * mix),
        g: round(g + (blendTarget - g) * mix),
        b: round(b + (blendTarget - b) * mix),
      }

      shades.push(rgbToHex(shade))
    }

    return shades
  }

  /**
   * Generate a numeric seed from a hex color string
   * @param {string} hex - Hex color
   * @returns {number}
   */
  const getSeedFromColor = (hex) => {
    let seed = 0
    for (let i = 0; i < hex.length; i++) {
      seed += hex.charCodeAt(i) * (i + 1)
    }
    return seed
  }

  /**
   * Create a seeded random number generator
   * @param {number} seed
   * @returns {() => number} - Random number in [0, 1)
   */
  const createSeededRandom = (seed) => {
    return () => {
      // xorshift32
      seed ^= seed << 13
      seed ^= seed >> 17
      seed ^= seed << 5
      return ((seed >>> 0) % 10000) / 10000
    }
  }

  /**
   * Deterministically shuffle array based on base color
   * @param {Array} array
   * @param {string} baseColor
   * @returns {Array}
   */
  const shuffleArrayDeterministic = (array, baseColor) => {
    const result = [...array]
    const rand = createSeededRandom(getSeedFromColor(baseColor))

    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1))
      ;[result[i], result[j]] = [result[j], result[i]]
    }

    return result
  }

  /**
   * Generate a blur pattern with variable size and dynamic color shades
   * @param {string} id - Pattern ID
   * @param {string} baseColor - Base hex color
   * @param {number} size - Base square size
   * @returns {string} - SVG pattern string
   */
  const generateCheckedPattern = (id, size = 10, baseColor, blurStrength) => {
    const columns = 4

    const shades = generateShadesFromColor(baseColor)
    const colors = shuffleArrayDeterministic(shades, baseColor)

    const rects = colors
      .map((color, index) => {
        const x = (index % columns) * size
        const y = Math.floor(index / columns) * size
        return `<rect x="${x}" y="${y}" width="${size}" height="${size}" fill="${color}" />`
      })
      .join('\n')

    return `
        <pattern id="${id}" patternUnits="userSpaceOnUse" width="${size * columns}" height="${size * Math.ceil(colors.length / columns)}">
          <g shape-rendering="crispEdges" data-default-color="${baseColor}">
            ${rects}
          </g>
        </pattern>
        <filter id="${id}-blur" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="${blurStrength}" />
        </filter>
      `.trim()
  }

  /**
   * Currently active blur object being edited
   */
  const activeObject = ref(null)

  /**
   * Options for blur types
   */
  const blurOptions = [
    { label: t('tools.blur.settings.general.blurTypes.options.black'), value: 'black' },
    { label: t('tools.blur.settings.general.blurTypes.options.checked'), value: 'checked' },
  ]

  // -------------------------------
  // Position
  // -------------------------------
  /**
   * Hide position and dimensions settings in the blur tool settings
   */
  const hidePositionAndDimensions = ref(true)

  /**
   * Calculate maximum and minimal position for blur
   */
  const maxBlurPositionX = computed(() => {
    const object = imageStore.getSvgObjectById(imageStore.selectedSvgObjectId)
    const blurWidth = object.attrs.width ?? 0
    return round(imageStore.fileDimensions.width - blurWidth)
  })
  const maxBlurPositionY = computed(() => {
    const object = imageStore.getSvgObjectById(imageStore.selectedSvgObjectId)
    const blurHeight = object.attrs.height ?? 0
    return round(imageStore.fileDimensions.height - blurHeight)
  })

  // -------------------------------
  // Dimensions
  // -------------------------------
  /**
   * Calculate maximum and minimum width for blur objects
   */
  const maxBlurWidth = computed(() => {
    return imageStore.fileDimensions.width - localBlurSettings.value.x
  })
  const maxBlurHeight = computed(() => {
    return imageStore.fileDimensions.height - localBlurSettings.value.y
  })
  /**
   * Refs for width and height inputs
   */
  const widthInputRef = ref(null)
  const heightInputRef = ref(null)
  /**
   * Temporary values to store blur width and height for link and unlink functionality
   */
  const tmpBlurWidth = ref(localBlurSettings.value.width)
  const tmpBlurHeight = ref(localBlurSettings.value.height)

  /**
   * Watch for changes in blur width and height to update temporary refs
   */
  watch(
    () => localBlurSettings.value.width,
    (value) => {
      tmpBlurWidth.value = value
    },
  )
  watch(
    () => localBlurSettings.value.height,
    (value) => {
      tmpBlurHeight.value = value
    },
  )

  /**
   * Whether the dimensions are linked
   */
  const isDimensionsLinked = ref(true)

  /**
   * Reset local blur settings to default values
   */
  const resetBlurSettings = () => {
    localBlurSettings.value.x = 0
    localBlurSettings.value.y = 0
    localBlurSettings.value.rotation = 0
    localBlurSettings.value.blurType = 'black'
    localBlurSettings.value.fillColor = '#000000'
    localBlurSettings.value.width = 0
    localBlurSettings.value.height = 0
    localBlurSettings.value.patternSize = 10
    localBlurSettings.value.blurStrength = 0.5
    localBlurSettings.value.filter = null

    activeObject.value = null
  }

  /**
   * Load settings from selected blur object
   */
  watch(
    () => imageStore.selectedSvgObjectId,
    (newId) => {
      if (newId !== null) {
        const object = imageStore.getSvgObjectById(newId)
        if (object && editorStore.selectedToolKey === 'blur') {
          activeObject.value = object
          hidePositionAndDimensions.value = false

          const { attrs } = object

          // Position
          localBlurSettings.value.x = attrs.x
          localBlurSettings.value.y = attrs.y

          // Dimensions
          localBlurSettings.value.width = attrs.width
          localBlurSettings.value.height = attrs.height

          // Rotation angle
          localBlurSettings.value.rotation = attrs.transform
            ? parseFloat(attrs.transform.match(/rotate\(([^)]+)\)/)?.[1]) || 0
            : 0

          // Blur type and settings
          localBlurSettings.value.blurType = 'black'
          localBlurSettings.value.fillColor = '#000000'
          localBlurSettings.value.patternSize = 10
          localBlurSettings.value.blurStrength = 0

          // Blur type
          const isBlack = attrs.fill === '#000000' || !attrs.fill?.startsWith('url(#')
          const isChecked = attrs.fill?.startsWith('url(#blur-pattern-')

          if (isBlack) {
            localBlurSettings.value.blurType = 'black'
          } else if (isChecked) {
            localBlurSettings.value.blurType = 'checked'

            // Extract pattern ID from fill
            const patternMatch = attrs.fill.match(/url\(#(blur-pattern-[^)]+)\)/)
            const patternId = patternMatch?.[1]

            if (patternId) {
              const defString = imageStore.getSvgDefById(patternId)
              if (defString) {
                // Extract patternSize
                const widthMatch = defString.match(/<pattern[^>]*width="(\d+)"/)
                const patternWidth = parseInt(widthMatch?.[1] || '40', 10)
                localBlurSettings.value.patternSize = round(patternWidth / 4)

                // Extract fill color (first rect fill)
                const defaultColorMatch = defString.match(/data-default-color="([^"]+)"/)
                if (defaultColorMatch) {
                  localBlurSettings.value.fillColor = defaultColorMatch[1]
                }

                // Extract blurStrength
                const filterMatch = defString.match(/stdDeviation="([^"]+)"/)
                localBlurSettings.value.blurStrength = parseFloat(filterMatch?.[1] || '0') || 0
              }
            }
          }
        }
      } else {
        hidePositionAndDimensions.value = true
      }
    },
  )

  /**
   * Update the localBlurSettings when activeObject changes outside this composable
   */
  watchEffect(() => {
    const object = activeObject.value
    if (!object || editorStore.selectedToolKey !== 'blur') return

    const { attrs } = object

    // Position
    localBlurSettings.value.x = attrs.x
    localBlurSettings.value.y = attrs.y

    // Dimensions
    localBlurSettings.value.width = attrs.width
    localBlurSettings.value.height = attrs.height

    // Rotation angle
    localBlurSettings.value.rotation = attrs.transform
      ? parseFloat(attrs.transform.match(/rotate\(([^)]+)\)/)?.[1]) || 0
      : 0
  })

  /**
   * Apply local settings to the active SVG object
   * @param {boolean} commit - When true, push to history store
   */
  const applyLocalBlurSettings = (commit = true) => {
    if (!editorStore.isSvgObjectSelected) return
    const object = activeObject.value
    if (!object) return

    const settings = localBlurSettings.value
    const { attrs } = object

    // Position
    attrs.x = settings.x
    attrs.y = settings.y

    // Dimensions
    attrs.width = settings.width
    attrs.height = settings.height

    // Rotation angle
    const { cx, cy } = getObjectCenter(object)
    attrs.transform = `rotate(${settings.rotation}, ${cx}, ${cy})`
    // Blur type
    if (settings.blurType === 'black') {
      attrs.fill = '#000000'
    } else {
      const patternId = `blur-pattern-${object.id}`
      const patternMarkup = generateCheckedPattern(
        patternId,
        settings.patternSize,
        settings.fillColor,
        settings.blurStrength,
      )
      imageStore.addOrReplaceSvgDef(patternId, patternMarkup)

      attrs.fill = `url(#${patternId})`

      // Blur filter
      const filterId = `${patternId}-blur`

      if (settings.blurStrength > 0) {
        attrs.filter = `url(#${filterId})`
      } else {
        delete attrs.filter
      }
    }

    console.log('commit:', commit)

    // Push to history only when explicitly requested
    if (commit) {
      historyStore.push(imageStore.getSnapshot(t))

      useSendEvent().sendEvent('toolSettings', 'blur', 'update', {
        settings: { ...localBlurSettings.value },
      })
    }
  }

  /**
   * Update the dimension of the blur object
   * @param {string} key - 'width' or 'height'
   * @param {number} value - New dimension value
   */
  const updateDimension = (key, value) => {
    const originalWidth = localBlurSettings.value.width
    const originalHeight = localBlurSettings.value.height

    if (key === 'width') {
      const clampedWidth = round(clamp(value, 0, maxBlurWidth.value))

      // Dimensions are linked
      if (isDimensionsLinked.value && originalWidth > 0) {
        const aspectRatio = originalHeight / originalWidth
        localBlurSettings.value.width = clampedWidth
        localBlurSettings.value.height = round(
          clamp(clampedWidth * aspectRatio, 0, maxBlurHeight.value),
        )
      } else {
        localBlurSettings.value.width = clampedWidth
      }
    } else if (key === 'height') {
      const clampedHeight = round(clamp(value, 0, maxBlurHeight.value))

      // Dimensions are linked
      if (isDimensionsLinked.value && originalHeight > 0) {
        const aspectRatio = originalWidth / originalHeight
        localBlurSettings.value.height = clampedHeight
        localBlurSettings.value.width = round(
          clamp(clampedHeight * aspectRatio, 0, maxBlurWidth.value),
        )
      } else {
        localBlurSettings.value.height = clampedHeight
      }
    }
    nextTick(() => {
      heightInputRef.value.setValue(localBlurSettings.value.height)
      widthInputRef.value.setValue(localBlurSettings.value.width)
    })

    applyLocalBlurSettings()
  }

  /**
   * Reset the rotation angle of the blur object
   */
  const resetRotationAngle = () => {
    localBlurSettings.value.rotation = 0
    applyLocalBlurSettings()
  }

  /**
   * Get the current blur attributes
   * @returns {Object} - Current blur attributes
   */
  const getBlurAttributes = (id) => {
    const settings = { ...localBlurSettings.value }

    // Blur type
    if (settings.blurType === 'black') {
      settings.fillColor = '#000000'
    } else {
      const patternId = `blur-pattern-${id}`
      const patternMarkup = generateCheckedPattern(
        patternId,
        settings.patternSize,
        settings.fillColor,
        settings.blurStrength,
      )
      imageStore.addOrReplaceSvgDef(patternId, patternMarkup)

      settings.fillColor = `url(#${patternId})`

      // Blur filter
      const filterId = `${patternId}-blur`

      if (settings.blurStrength > 0) {
        settings.filter = `url(#${filterId})`
      } else {
        settings.filter = null
      }
    }

    useSendEvent().sendEvent('toolSettings', 'blur', 'create', {
      settings: { ...settings },
    })

    return settings
  }

  return {
    localBlurSettings,
    applyLocalBlurSettings,
    resetRotationAngle,
    maxBlurPositionX,
    maxBlurPositionY,
    hidePositionAndDimensions,
    blurOptions,
    maxBlurWidth,
    maxBlurHeight,
    widthInputRef,
    heightInputRef,
    tmpBlurWidth,
    tmpBlurHeight,
    isDimensionsLinked,
    resetBlurSettings,
    updateDimension,
    getBlurAttributes,
    svgDefsString,
  }
}
