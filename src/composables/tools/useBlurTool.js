import { ref, computed, watch, watchEffect, nextTick, onMounted } from 'vue'
import { useMath } from '../common/useMath'
import { useSvgFunctions } from './useSvgFunctions'
import { useApi } from '@/composables/common/useApi'
const { addUserEvent } = useApi()
import { useConfirmModal } from '../modals/useConfirmModal'
import { useImagePipeline } from '../editor/useImagePipeline.js'

/**
 * Hide position and dimensions settings in the blur tool settings
 */
const hidePositionAndDimensions = ref(true)

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
  edgeFade: 1,
})

/**
 * Currently active blur object being edited
 */
const activeObject = ref(null)

/**
 * Logic for blur tool
 * @param {Object} imageStore - Store containing svgObjects
 * @param {Object} historyStore - History store
 * @param {Object} editorStore - Store containing editor state
 * @param {Object} uiStore - Store containing UI state
 * @param {Function} t - Translation function
 * @return {Object} Composable methods and reactive properties for blur tool
 */
export function useBlurTool(imageStore, historyStore, editorStore, uiStore, t) {
  const { round, clamp } = useMath()
  const { getObjectCenter } = useSvgFunctions(imageStore)
  const { showConfirmModal } = useConfirmModal()
  const { renderUpTo } = useImagePipeline(imageStore, uiStore)

  /**
   * String representation of SVG definitions used for blur patterns
   */
  const svgDefsString = computed(() => imageStore.svgDefs.join('\n'))

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
    localBlurSettings.value.edgeFade = editorStore.toolsConfig.blur.edgeFade
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

          console.warn('Selected object changed, loading blur settings...', { object })

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

          // Edge fade
          localBlurSettings.value.edgeFade = parseFloat(attrs['data-edge-fade']) || 10

          console.warn('Loaded blur settings from selected object:', { ...localBlurSettings.value })
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
    console.warn('Applying local blur settings to active object...', { ...localBlurSettings.value })
    if (imageStore.selectedSvgObjectId === null) return

    const object = activeObject.value
    console.warn('Active object to apply settings to:', { object })
    if (!object) return

    // const { id } = activeObject.value
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

    // Set blur strength
    attrs['data-blur-strength'] = settings.blurStrength

    // Set edge fade
    attrs['data-edge-fade'] = settings.edgeFade

    // Push to history only when explicitly requested
    if (commit) {
      saveConfigToEditorStore()

      historyStore.push(imageStore.getSnapshot(t))

      addUserEvent('applyOperation', {
        tool: 'blur',
        settings: { ...localBlurSettings.value },
      })
    }

    console.log(object)

    imageStore.blurOverlayNeedToBeRendered = true
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
  const getBlurAttributes = async () => {
    let confirmNeeded = false

    // SVG objects rasterization
    if (imageStore.needRasterizationForBlur) {
      confirmNeeded = true
      const confirmed = await showConfirmModal(
        t('tools.confirmNeedRasterization.title'),
        t('tools.confirmNeedRasterization.message'),
        t('tools.confirmNeedRasterization.cancel'),
        t('tools.confirmNeedRasterization.confirm'),
      )
      if (confirmed) {
        const result = await imageStore.rasterize('editor', {}, t)

        imageStore.addImageOperation({
          type: 'rasterize',
          params: {
            overlay: result.overlay,
          },
          cost: 'high',
          affectsGeometry: true,
        })

        addUserEvent('applyOperation', {
          tool: 'rasterize',
          settings: {},
        })

        await renderUpTo(imageStore.renderPipeline.currentOpIndex + 1, { t, imageStore })
      }
    }

    // Base image rasterization
    if (imageStore.fileType === 'pdf') {
      confirmNeeded = true
      const confirmed = await showConfirmModal(
        t('tools.confirmNeedBaseImageRasterization.title'),
        t('tools.confirmNeedBaseImageRasterization.message'),
        t('tools.confirmNeedBaseImageRasterization.cancel'),
        t('tools.confirmNeedBaseImageRasterization.confirm'),
      )
      if (confirmed) {
        imageStore.addImageOperation({
          type: 'rasterizePdf',
          params: {},
          cost: 'high',
          affectsGeometry: false,
        })

        addUserEvent('applyOperation', {
          tool: 'rasterizePdf',
          settings: {},
        })

        await renderUpTo(imageStore.renderPipeline.currentOpIndex + 1, { t, imageStore })

        historyStore.push(imageStore.getSnapshot())
      }
    }

    if (confirmNeeded) {
      return { success: false }
    }

    const settings = {
      success: true,
      ...localBlurSettings.value,
    }

    settings.name = imageStore.getNextObjectName('blur', null)

    addUserEvent('applyOperation', {
      tool: 'blur',
      settings: { ...settings },
    })

    saveConfigToEditorStore()

    return settings
  }

  onMounted(() => {
    resetBlurSettings()
  })

  /**
   * Maximum blur strength based on image dimensions
   */
  const maxBlurStrength = computed(() => {
    return imageStore.getSmallerImageDimension() / 10
  })

  /**
   * Maximum edge fade based on image dimensions
   */
  const maxEdgeFade = computed(() => {
    return imageStore.getSmallerImageDimension() / 30
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
    maxBlurStrength,
    maxEdgeFade,
  }
}
