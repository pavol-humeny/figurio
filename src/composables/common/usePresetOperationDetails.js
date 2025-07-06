import { ref, computed, watch, nextTick } from 'vue'
import { useMath } from '@/composables/common/useMath'

export function usePresetOperationDetails(imageStore, editorStore, t, props, emit) {
  const { clamp } = useMath()

  const localOperation = ref({ ...props.operation })

  watch(
    () => props.operation,
    (newOp) => {
      localOperation.value = { ...newOp }
    },
    { immediate: true, deep: true },
  )

  watch(
    () => localOperation.value.type,
    (newType) => {
      editorStore.selectSubTool(newType)
    },
    { immediate: true },
  )

  const update = () => {
    emit('update:operation', { ...localOperation.value })
  }

  const isDimensionsLinked = ref(true)
  const tmpCropWidth = ref(0)
  const tmpCropHeight = ref(0)

  const cropPositionXInputRef = ref(null)
  const cropPositionYInputRef = ref(null)
  const cropWidthInputRef = ref(null)
  const cropHeightInputRef = ref(null)

  watch(
    () => localOperation.value,
    (newOp) => {
      if (newOp?.type === 'crop' && newOp.cropBox) {
        tmpCropHeight.value = newOp.cropBox.height
        tmpCropWidth.value = newOp.cropBox.width
      }
    },
    { immediate: true, deep: true },
  )

  const maxCropPositionX = computed(() => {
    return imageStore.fileDimensions.width - localOperation.value.cropBox.width
  })
  const maxCropPositionY = computed(() => {
    return imageStore.fileDimensions.height - localOperation.value.cropBox.height
  })
  const maxCropWidth = computed(() => {
    return imageStore.fileDimensions.width - localOperation.value.cropBox.x
  })
  const maxCropHeight = computed(() => {
    return imageStore.fileDimensions.height - localOperation.value.cropBox.y
  })

  const updatePosition = (key, value) => {
    if (key === 'x') {
      localOperation.value.cropBox.x = Math.round(clamp(value, 0, maxCropPositionX.value))
    } else if (key === 'y') {
      localOperation.value.cropBox.y = Math.round(clamp(value, 0, maxCropPositionY.value))
    }
    nextTick(() => {
      cropPositionXInputRef.value?.setValue(localOperation.value.cropBox.x)
      cropPositionYInputRef.value?.setValue(localOperation.value.cropBox.y)
    })
  }

  const updateDimension = (key, value) => {
    const originalWidth = localOperation.value.cropBox.width
    const originalHeight = localOperation.value.cropBox.height

    if (key === 'width') {
      const clampedWidth = Math.round(clamp(value, 0, maxCropWidth.value))

      if (isDimensionsLinked.value) {
        const aspectRatio = originalHeight / originalWidth || 1
        localOperation.value.cropBox.width = clampedWidth
        localOperation.value.cropBox.height = Math.round(
          clamp(clampedWidth * aspectRatio, 0, maxCropHeight.value),
        )
      } else {
        localOperation.value.cropBox.width = clampedWidth
      }
    } else if (key === 'height') {
      const clampedHeight = Math.round(clamp(value, 0, maxCropHeight.value))

      if (isDimensionsLinked.value) {
        const aspectRatio = originalWidth / originalHeight || 1

        localOperation.value.cropBox.height = clampedHeight
        localOperation.value.cropBox.width = Math.round(
          clamp(clampedHeight * aspectRatio, 0, maxCropWidth.value),
        )
      } else {
        localOperation.value.cropBox.height = clampedHeight
      }
    }
    nextTick(() => {
      cropHeightInputRef.value?.setValue(localOperation.value.cropBox.height)
      cropWidthInputRef.value?.setValue(localOperation.value.cropBox.width)
    })
  }

  return {
    localOperation,
    update,
    isDimensionsLinked,
    tmpCropWidth,
    tmpCropHeight,
    cropPositionXInputRef,
    cropPositionYInputRef,
    cropWidthInputRef,
    cropHeightInputRef,
    updatePosition,
    updateDimension,
    maxCropPositionX,
    maxCropPositionY,
    maxCropWidth,
    maxCropHeight,
  }
}
