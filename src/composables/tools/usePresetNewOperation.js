/**
 * @file: usePresetNewOperation.js
 * @author: Pavol Humeny
 * @date: 15.5.2026
 * @description: Composable for managing new preset operation creation, including logic for handling different operation types (rotation, flip, crop, resize), managing operation parameters, and ensuring that parameter values are valid.
 */
import { useMath } from '@/composables/common/useMath'
import { editorConfig } from '@/config/editorConfig'
import { ref, computed, watch, reactive, nextTick } from 'vue'

/**
 * Logic for managing new preset operation creation
 *
 * @param {ReturnType<typeof import('@/stores/imageStore').useImageStore>} imageStore - Image store
 * @param {{ operation?: Object }} props - Component props with optional initial operation
 * @param {(event: string, value: any) => void} emit - Emit function
 * @param {(key: string) => string} t - Translation function
 * @returns {Object}
 */
export function usePresetNewOperation(imageStore, props, emit, t) {
  const { clamp, round } = useMath()

  /**
   * Available rotation angle options
   */
  const rotationOptions = [
    { label: '90°', value: 90 },
    { label: '180°', value: 180 },
    { label: '-90°', value: -90 },
  ]

  /**
   * Flip direction options with localized labels
   */
  const flipOptions = [
    {
      label: t('tools.preset.settings.myPresets.presetValues.transformations.horizontalFlip'),
      value: 'horizontal',
    },
    {
      label: t('tools.preset.settings.myPresets.presetValues.transformations.verticalFlip'),
      value: 'vertical',
    },
  ]

  /**
   * Available operation types for user to choose from
   */
  const baseOperationOptions = [
    {
      label: t('tools.preset.settings.myPresets.presetValues.transformations.rotation'),
      value: 'rotation',
    },
    {
      label: t('tools.preset.settings.myPresets.presetValues.transformations.flip'),
      value: 'flip',
    },
    {
      label: t('tools.preset.settings.myPresets.presetValues.autoCrop.label'),
      value: 'autoCrop',
    },
    {
      label: t('tools.preset.settings.myPresets.presetValues.grayscale.label'),
      value: 'grayscale',
    },
    {
      label: t('tools.preset.settings.myPresets.presetValues.crop.label'),
      value: 'crop',
    },
    {
      label: t('tools.preset.settings.myPresets.presetValues.resize.label'),
      value: 'resize',
    },
    // UPDATE new tool
  ]

  /**
   * Available grayscale options for the preset
   */
  const presetGrayscaleOptions = computed(() => [
    { value: 'luminance', label: t('tools.grayscale.settings.options.luminance') },
    { value: 'average', label: t('tools.grayscale.settings.options.average') },
    { value: 'lightness', label: t('tools.grayscale.settings.options.lightness') },
  ])

  /**
   * Computed operation options based on existing image operations
   * Do not return grayscale or autoCrop if it is already applied
   */
  const operationOptions = computed(() => {
    const existingTypes = props.localImageOperations?.map((op) => op.type) || []
    return baseOperationOptions.filter((opt) => {
      // If grayscale already exists, don't return it
      if (opt.value === 'grayscale' && existingTypes.includes('grayscale')) {
        return false
      }
      if (opt.value === 'autoCrop' && existingTypes.includes('autoCrop')) {
        return false
      }
      return true
    })
  })

  /**
   * Currently selected operation type
   */
  const selectedType = ref(props.operation?.type || '')

  /**
   * Parameters for all supported operations
   */
  const params = reactive({
    angle: 90,
    direction: 'horizontal',
    cropBox: {
      x: 0,
      y: 0,
      width: imageStore.fileDimensions.width,
      height: imageStore.fileDimensions.height,
    },
    resizeDimensions: {
      width: imageStore.fileDimensions.width,
      height: imageStore.fileDimensions.height,
    },
    grayscaleType: 'luminance',
    // UPDATE new tool
  })

  /**
   * Temporary values used for pre-filling crop dimensions
   */
  const tmpCropWidth = ref(imageStore.fileDimensions.width)
  const tmpCropHeight = ref(imageStore.fileDimensions.height)

  /**
   * Input element refs for syncing programmatic updates
   */
  const cropPositionXInputRef = ref(null)
  const cropPositionYInputRef = ref(null)
  const cropWidthInputRef = ref(null)
  const cropHeightInputRef = ref(null)

  /**
   * Maximum crop positions and sizes based on image dimensions
   */
  const maxCropPositionX = computed(() => imageStore.fileDimensions.width - params.cropBox.width)
  const maxCropPositionY = computed(() => imageStore.fileDimensions.height - params.cropBox.height)
  const maxCropWidth = computed(() => imageStore.fileDimensions.width - params.cropBox.x)
  const maxCropHeight = computed(() => imageStore.fileDimensions.height - params.cropBox.y)
  const minCropWidth = computed(() => editorConfig.minCropSize)
  const minCropHeight = computed(() => editorConfig.minCropSize)

  /**
   * Emits operation template when selected type changes
   */
  watch(selectedType, (type) => {
    let op = null
    // UPDATE new tool
    if (type === 'rotation') {
      op = { type, angle: 90 }
    } else if (type === 'flip') {
      op = { type, direction: 'horizontal' }
    } else if (type === 'autoCrop') {
      op = { type }
    } else if (type === 'grayscale') {
      op = { type, grayscaleType: 'none' }
    } else if (type === 'crop') {
      op = {
        type,
        cropBox: {
          x: 0,
          y: 0,
          width: imageStore.fileDimensions.width,
          height: imageStore.fileDimensions.height,
        },
      }
    } else if (type === 'resize') {
      op = {
        type,
        resizeDimensions: {
          width: imageStore.fileDimensions.width,
          height: imageStore.fileDimensions.height,
        },
      }
    } else {
      op = null
    }
    emit('update:operation', op)
  })

  /**
   * Emits updated operation whenever parameters change
   */
  watch(
    () => [params.angle, params.direction, params.cropBox],
    () => {
      if (!selectedType.value) return
      const op = { type: selectedType.value }
      if (selectedType.value === 'rotation') op.angle = params.angle
      if (selectedType.value === 'flip') op.direction = params.direction
      if (selectedType.value === 'grayscale') {
        op.grayscaleType = params.grayscaleType
      }
      if (selectedType.value === 'crop') {
        op.cropBox = { ...params.cropBox }
      }
      if (selectedType.value === 'resize') {
        op.resizeDimensions = { ...params.resizeDimensions }
      }
      // UPDATE new tool

      emit('update:operation', op)
    },
    { deep: true, immediate: true },
  )

  /**
   * Updates crop position (X or Y), clamps to bounds and syncs inputs
   *
   * @param {'x' | 'y'} key - Property to update
   * @param {number} value - New value
   */
  const updatePosition = (key, value) => {
    if (key === 'x') {
      params.cropBox.x = round(clamp(value, 0, maxCropPositionX.value))
    } else if (key === 'y') {
      params.cropBox.y = round(clamp(value, 0, maxCropPositionY.value))
    }
    nextTick(() => {
      cropPositionXInputRef.value?.setValue(params.cropBox.x)
      cropPositionYInputRef.value?.setValue(params.cropBox.y)
    })
  }

  /**
   * Updates crop dimensions (width or height), respects aspect ratio if linked
   *
   * @param {'width' | 'height'} key - Dimension to update
   * @param {number} value - New size
   */
  const updateDimension = (key, value) => {
    if (key === 'width') {
      const clampedWidth = round(clamp(value, minCropWidth.value, maxCropWidth.value))

      params.cropBox.width = clampedWidth
    } else if (key === 'height') {
      const clampedHeight = round(clamp(value, minCropHeight.value, maxCropHeight.value))

      params.cropBox.height = clampedHeight
    }
    nextTick(() => {
      cropHeightInputRef.value?.setValue(params.cropBox.height)
      cropWidthInputRef.value?.setValue(params.cropBox.width)
    })
  }

  return {
    rotationOptions,
    flipOptions,
    operationOptions,
    selectedType,
    params,
    tmpCropWidth,
    tmpCropHeight,
    cropPositionXInputRef,
    cropPositionYInputRef,
    cropWidthInputRef,
    cropHeightInputRef,
    maxCropPositionX,
    maxCropPositionY,
    maxCropWidth,
    maxCropHeight,
    updatePosition,
    updateDimension,
    presetGrayscaleOptions,
    minCropHeight,
    minCropWidth,
  }
}
