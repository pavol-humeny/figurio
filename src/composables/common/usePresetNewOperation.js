import { useMath } from '@/composables/common/useMath'
import { ref, computed, watch, reactive, nextTick } from 'vue'

export function usePresetNewOperation(imageStore, props, emit, t) {
  const { clamp } = useMath()

  const rotationOptions = [
    { label: '180°', value: 180 },
    { label: '270°', value: 270 },
    { label: '0°', value: 0 },
    { label: '-90°', value: -90 },
    { label: '-180°', value: -180 },
  ]

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

  const operationOptions = [
    {
      label: t('tools.preset.settings.myPresets.presetValues.transformations.rotation'),
      value: 'rotation',
    },
    {
      label: t('tools.preset.settings.myPresets.presetValues.transformations.flip'),
      value: 'flip',
    },
    {
      label: t('tools.preset.settings.myPresets.presetValues.smartCrop.label'),
      value: 'smartCrop',
    },
    {
      label: t('tools.preset.settings.myPresets.presetValues.grayscale.label'),
      value: 'grayscale',
    },
    {
      label: t('tools.preset.settings.myPresets.presetValues.crop.label'),
      value: 'crop',
    },
    // UPDATE
  ]

  const selectedType = ref(props.operation?.type || '')

  const params = reactive({
    angle: 0,
    direction: 'horizontal',
    color: '#000000',
    cropBox: { x: 0, y: 0, width: 0, height: 0 },
  })

  const isDimensionsLinked = ref(true)
  const tmpCropWidth = ref(0)
  const tmpCropHeight = ref(0)

  const cropPositionXInputRef = ref(null)
  const cropPositionYInputRef = ref(null)
  const cropWidthInputRef = ref(null)
  const cropHeightInputRef = ref(null)

  const maxCropPositionX = computed(() => imageStore.fileDimensions.width - params.cropBox.width)
  const maxCropPositionY = computed(() => imageStore.fileDimensions.height - params.cropBox.height)
  const maxCropWidth = computed(() => imageStore.fileDimensions.width - params.cropBox.x)
  const maxCropHeight = computed(() => imageStore.fileDimensions.height - params.cropBox.y)

  watch(selectedType, (type) => {
    let op = null
    if (type === 'rotation') {
      op = { type, angle: 0 }
    } else if (type === 'flip') {
      op = { type, direction: 'horizontal' }
    } else if (type === 'smartCrop') {
      op = { type, color: '#000000' }
    } else if (type === 'grayscale') {
      op = { type, enable: true }
    } else if (type === 'crop') {
      op = { type, cropBox: { x: 0, y: 0, width: 0, height: 0 } }
    } else {
      op = null
    }
    emit('update:operation', op)
  })

  watch(
    () => [params.angle, params.direction, params.color, params.cropBox],
    () => {
      if (!selectedType.value) return
      const op = { type: selectedType.value }
      if (selectedType.value === 'rotation') op.angle = params.angle
      if (selectedType.value === 'flip') op.direction = params.direction
      if (selectedType.value === 'smartCrop') op.color = params.color
      if (selectedType.value === 'grayscale') op.enable = true
      if (selectedType.value === 'crop') {
        op.cropBox = { ...params.cropBox }
      }
      // UPDATE

      emit('update:operation', op)
    },
    { deep: true, immediate: true },
  )

  const updatePosition = (key, value) => {
    if (key === 'x') {
      params.cropBox.x = Math.round(clamp(value, 0, maxCropPositionX.value))
    } else if (key === 'y') {
      params.cropBox.y = Math.round(clamp(value, 0, maxCropPositionY.value))
    }
    nextTick(() => {
      cropPositionXInputRef.value?.setValue(params.cropBox.x)
      cropPositionYInputRef.value?.setValue(params.cropBox.y)
    })
  }

  const updateDimension = (key, value) => {
    const originalWidth = params.cropBox.width
    const originalHeight = params.cropBox.height

    if (key === 'width') {
      const clampedWidth = Math.round(clamp(value, 0, maxCropWidth.value))
      if (isDimensionsLinked.value) {
        const aspectRatio = originalHeight / originalWidth || 1
        params.cropBox.width = clampedWidth
        params.cropBox.height = Math.round(
          clamp(clampedWidth * aspectRatio, 0, maxCropHeight.value),
        )
      } else {
        params.cropBox.width = clampedWidth
      }
    } else if (key === 'height') {
      const clampedHeight = Math.round(clamp(value, 0, maxCropHeight.value))
      if (isDimensionsLinked.value) {
        const aspectRatio = originalWidth / originalHeight || 1
        params.cropBox.height = clampedHeight
        params.cropBox.width = Math.round(clamp(clampedHeight * aspectRatio, 0, maxCropWidth.value))
      } else {
        params.cropBox.height = clampedHeight
      }
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
    isDimensionsLinked,
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
  }
}
