import { computed, ref, watch, watchEffect, nextTick } from 'vue'
import { useMath } from '../common/useMath'

const localObjectSettings = ref({
  type: 'none', // Default type
  fillEnabled: true, // Default fill enabled
  fillColor: '#000000', // Default fill color
  strokeColor: '#000000', // Default outline color
  strokeWidth: 0, // Default outline width
  width: 0, // Default width
  height: 0, // Default height
  x: 0, // Default x position
  y: 0, // Default y position
})

const activeObject = ref(null)

export function useShapeTool(editorStore, imageStore) {
  const { clamp } = useMath()

  const hidePositionAndDimensions = ref(false)

  const resetObjectSettings = () => {
    localObjectSettings.value.fillEnabled = true
    localObjectSettings.value.fillColor = '#000000'
    localObjectSettings.value.strokeColor = '#000000'
    localObjectSettings.value.strokeWidth = localObjectSettings.value.type === 'line' ? 1 : 0
    localObjectSettings.value.width = 0
    localObjectSettings.value.height = 0
    localObjectSettings.value.x = 0
    localObjectSettings.value.y = 0

    activeObject.value = null
  }

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

  watch(
    () => editorStore.selectedTabPerTool['shape'],
    (newTab) => {
      if (newTab === localObjectSettings.value.type) return

      localObjectSettings.value.type = newTab
      imageStore.selectedSvgObjectId = null // Reset selection when tab changes
      editorStore.isSvgObjectSelected = false // Reset selection state

      resetObjectSettings()
    },
    { immediate: true },
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

          console.log('localObjectSettings.value.type', localObjectSettings.value.type)

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

          localObjectSettings.value.fillEnabled = attrs.fill !== 'none'
          if (localObjectSettings.value.fillEnabled) {
            localObjectSettings.value.fillColor = attrs.fill
          }

          if (attrs['stroke-width'] > 0) {
            localObjectSettings.value.strokeColor = attrs.stroke
            localObjectSettings.value.strokeWidth = attrs['stroke-width']
          }
        }
      } else {
        hidePositionAndDimensions.value = true
      }
    },
    { immediate: true },
  )

  /**
   * Update the localObjectSettings when activeObject changes
   */
  watchEffect(() => {
    const object = activeObject.value
    if (!object || editorStore.selectedToolKey !== 'shape') return

    const { attrs, tag } = object

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

    localObjectSettings.value.fillEnabled = attrs.fill !== 'none'
    if (localObjectSettings.value.fillEnabled) {
      localObjectSettings.value.fillColor = attrs.fill
    }

    if (attrs['stroke-width'] > 0) {
      localObjectSettings.value.strokeColor = attrs.stroke
      localObjectSettings.value.strokeWidth = attrs['stroke-width']
    }
  })

  /**
   * Apply local settings to the active SVG object
   */
  const applyLocalSettings = () => {
    if (!editorStore.isSvgObjectSelected) return
    console.log('Applying local settings to active object')
    console.log('strokeWidth', localObjectSettings.value.strokeWidth)
    const object = activeObject.value
    if (!object) return

    const settings = localObjectSettings.value
    const { tag, attrs } = object

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
  }

  /**
   * Get the current shape attributes for external use
   */
  const getShapeAttributes = () => {
    return { ...localObjectSettings.value }
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
      const clampedWidth = Math.round(clamp(value, 0, maxShapeWidth.value))

      // Dimensions are linked
      if (isDimensionsLinked.value && originalWidth > 0) {
        const aspectRatio = originalHeight / originalWidth
        localObjectSettings.value.width = clampedWidth
        localObjectSettings.value.height = Math.round(
          clamp(clampedWidth * aspectRatio, 0, maxShapeHeight.value),
        )
      } else {
        localObjectSettings.value.width = clampedWidth
      }
    } else if (key === 'height') {
      const clampedHeight = Math.round(clamp(value, 0, maxShapeHeight.value))

      // Dimensions are linked
      if (isDimensionsLinked.value && originalHeight > 0) {
        console.log('Updating height with aspect ratio')
        const aspectRatio = originalWidth / originalHeight
        localObjectSettings.value.height = clampedHeight
        localObjectSettings.value.width = Math.round(
          clamp(clampedHeight * aspectRatio, 0, maxShapeWidth.value),
        )

        console.log(
          'aspectRation, h, w, max w, max h',
          aspectRatio,
          clampedHeight,
          localObjectSettings.value.width,
          maxShapeWidth.value,
          maxShapeHeight.value,
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
  }
}
