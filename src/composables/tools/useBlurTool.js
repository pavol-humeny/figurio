import { ref, computed, watch, watchEffect, nextTick, onMounted } from 'vue'
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
  blurStrength: 5,
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
   * Currently active blur object being edited
   */
  const activeObject = ref(null)

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

  // --------------------------------
  // Defs
  // --------------------------------
  /**
   * Adds or replaces a clipPath definition for the blur object
   * @param {string} id - The ID of the blur object
   * @param {Object} params - The parameters for the clipPath
   * @param {number} params.x - The x position of the clipPath
   * @param {number} params.y - The y position of the clipPath
   * @param {number} params.width - The width of the clipPath
   * @param {number} params.height - The height of the clipPath
   * @param {number} params.rotation - The rotation of the clipPath
   */
  const addOrReplaceClipDef = (id, { x, y, width, height, rotation }) => {
    const cx = x + width / 2
    const cy = y + height / 2
    const transform = rotation !== 0 ? ` transform="rotate(${rotation}, ${cx}, ${cy})"` : ''
    const def = `
      <clipPath id="clip-${id}">
        <rect x="${x}" y="${y}" width="${width}" height="${height}"${transform} />
      </clipPath>
    `

    imageStore.addOrReplaceSvgDef(`clip-${id}`, def)
  }

  /**
   * Adds or replaces a filter definition for the blur object
   * @param {string} id - The ID of the blur object
   * @param {number} blurStrength - The strength of the blur
   */
  const addOrReplaceFilterDef = (id, blurStrength) => {
    const def = `
      <filter id="blur-filter-${id}" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="${blurStrength}" />
      </filter>
    `

    imageStore.addOrReplaceSvgDef(`blur-filter-${id}`, def)
  }

  /**
   * Adds a <image> element for the blur object to the blurImages array
   * @param {string} id - The ID of the blur object
   */
  const addBlurImage = (id) => {
    const imageString = `
    <image
      id="blur-image-${id}"
      href="${imageStore.blurPreviewUrl}"
      x="0"
      y="0"
      width="${imageStore.fileDimensions.width}"
      height="${imageStore.fileDimensions.height}"
      clip-path="url(#clip-${id})"
      filter="url(#blur-filter-${id})"
    />
  `

    imageStore.blurImages.push(imageString)
  }

  /**
   * Save current config to editor store
   */
  const saveConfigToEditorStore = () => {
    editorStore.toolsConfig.blur.blurStrength = localBlurSettings.value.blurStrength
  }

  /**
   * Reset local blur settings to default values
   */
  const resetBlurSettings = () => {
    // localBlurSettings.value.x = 0
    // localBlurSettings.value.y = 0
    // localBlurSettings.value.width = 0
    // localBlurSettings.value.height = 0
    // localBlurSettings.value.rotation = 0
    // localBlurSettings.value.blurStrength = 5

    activeObject.value = null

    localBlurSettings.value.blurStrength = editorStore.toolsConfig.blur.blurStrength
  }

  /**
   * Load settings from selected blur object
   */
  watch(
    () => imageStore.selectedSvgObjectId,
    async (newId) => {
      if (newId !== null) {
        await nextTick()
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

          // Blur strength
          localBlurSettings.value.blurStrength = parseFloat(attrs['data-blur-strength']) || 5
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

    // Update clip path
    addOrReplaceClipDef(object.id, {
      x: attrs.x,
      y: attrs.y,
      width: attrs.width,
      height: attrs.height,
      rotation: attrs.transform
        ? parseFloat(attrs.transform.match(/rotate\(([^)]+)\)/)?.[1]) || 0
        : 0,
    })
  })

  watch(
    () => imageStore.blurObjects,
    (newVal, oldVal) => {
      if (imageStore.historyWasChanged) {
        activeObject.value = null
      }
      // Find changed object by shallow comparison of attributes
      newVal.forEach((obj, i) => {
        const oldObj = oldVal?.[i]
        if (!oldObj) return

        // Compare keys to detect a change
        const changed = Object.keys(obj).some((key) => {
          // Ignore Vue internals
          if (key.startsWith('__v')) return false
          return JSON.stringify(obj[key]) !== JSON.stringify(oldObj[key])
        })

        // Add or replace clip for changed object
        if (changed) {
          const { attrs } = obj
          addOrReplaceClipDef(obj.id, {
            x: attrs.x,
            y: attrs.y,
            width: attrs.width,
            height: attrs.height,
            rotation: attrs.transform
              ? parseFloat(attrs.transform.match(/rotate\(([^)]+)\)/)?.[1]) || 0
              : 0,
          })
        }
      })
    },
    { deep: true },
  )

  /**
   * Apply local settings to the active SVG object
   * @param {boolean} commit - When true, push to history store
   */
  const applyLocalBlurSettings = (commit = true) => {
    if (imageStore.selectedSvgObjectId === null) return

    const object = activeObject.value
    if (!object) return

    const { id } = activeObject.value
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

    // Defs
    addOrReplaceClipDef(id, {
      x: settings.x,
      y: settings.y,
      width: settings.width,
      height: settings.height,
      rotation: settings.rotation,
    })

    addOrReplaceFilterDef(id, settings.blurStrength)

    // Set blur strength
    attrs['data-blur-strength'] = settings.blurStrength

    // Push to history only when explicitly requested
    if (commit) {
      saveConfigToEditorStore()

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

    // Create new defs for new object
    addOrReplaceClipDef(id, {
      x: settings.x,
      y: settings.y,
      width: settings.width,
      height: settings.height,
      rotation: settings.rotation,
    })
    addOrReplaceFilterDef(id, settings.blurStrength)

    addBlurImage(id)

    settings.name = imageStore.getNextObjectName('blur', null)

    useSendEvent().sendEvent('toolSettings', 'blur', 'create', {
      settings: { ...settings },
    })

    saveConfigToEditorStore()

    return settings
  }

  onMounted(() => {
    resetBlurSettings()
  })

  return {
    localBlurSettings,
    applyLocalBlurSettings,
    resetRotationAngle,
    maxBlurPositionX,
    maxBlurPositionY,
    hidePositionAndDimensions,
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
    addOrReplaceClipDef,
    addOrReplaceFilterDef,
    addBlurImage,
  }
}
