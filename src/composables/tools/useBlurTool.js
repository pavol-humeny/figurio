import { ref, computed, watch, watchEffect, nextTick } from 'vue'
import { useMath } from '../common/useMath'
import { useSvgFunctions } from './useSvgFunctions'

const localBlurSettings = ref({
  x: 0,
  y: 0,
  width: 0,
  height: 0,
  rotation: 0,
  blurType: 'none',
  fillColor: '#1b57b3ff',
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
   * Hide position settings in the blur tool settings
   */
  const hidePositionAndDimensions = ref(true)

  /**
   * Currently active blur object being edited
   */
  const activeObject = ref(null)

  const blurOptions = [
    { label: t('tools.blur.settings.general.blurType.none'), value: 'none' },
    { label: t('tools.blur.settings.general.blurType.gaussian'), value: 'gaussian' },
    { label: t('tools.blur.settings.general.blurType.box'), value: 'box' },
    { label: t('tools.blur.settings.general.blurType.motion'), value: 'motion' },
  ]

  // -------------------------------
  // Position
  // -------------------------------
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
   * Temporary refs to store blur width and height for syncing with external components
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
    localBlurSettings.value.blurType = 'none'

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
   */
  const applyLocalBlurSettings = () => {
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

    historyStore.push(imageStore.getSnapshot(t))
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
      const clampedWidth = Math.round(clamp(value, 0, maxBlurWidth.value))

      // Dimensions are linked
      if (isDimensionsLinked.value && originalWidth > 0) {
        const aspectRatio = originalHeight / originalWidth
        localBlurSettings.value.width = clampedWidth
        localBlurSettings.value.height = Math.round(
          clamp(clampedWidth * aspectRatio, 0, maxBlurHeight.value),
        )
      } else {
        localBlurSettings.value.width = clampedWidth
      }
    } else if (key === 'height') {
      const clampedHeight = Math.round(clamp(value, 0, maxBlurHeight.value))

      // Dimensions are linked
      if (isDimensionsLinked.value && originalHeight > 0) {
        console.log('Updating height with aspect ratio')
        const aspectRatio = originalWidth / originalHeight
        localBlurSettings.value.height = clampedHeight
        localBlurSettings.value.width = Math.round(
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

  const getBlurAttributes = () => {
    return { ...localBlurSettings.value }
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
  }
}
