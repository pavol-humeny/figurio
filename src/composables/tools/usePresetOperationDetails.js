import { ref, computed, watch, nextTick } from 'vue'
import { useMath } from '@/composables/common/useMath'

/**
 * Logic for displaying and editing the details of a selected preset operation
 *
 * @param {ReturnType<typeof import('@/stores/imageStore').useImageStore>} imageStore - Image store
 * @param {ReturnType<typeof import('@/stores/workspaceStore').useWorkspaceStore>} editorStore - Editor store
 * @param {(key: string) => string} t - Translation function
 * @param {{ operation: Object }} props - Component props
 * @param {(event: string, value: any) => void} emit - Emit function
 * @returns {Object}
 */
export function usePresetOperationDetails(imageStore, editorStore, t, props, emit) {
  const { clamp, round } = useMath()

  /**
   * Local reactive copy of the current operation
   */
  const localOperation = ref({ ...props.operation })

  /**
   * Watch for external changes to the operation prop and update local state
   */
  watch(
    () => props.operation,
    (newOp) => {
      localOperation.value = { ...newOp }
    },
    { immediate: true, deep: true },
  )

  /**
   * Whether to preserve aspect ratio when resizing
   */
  const isDimensionsLinked = ref(true)

  /**
   * Temporary values used when restoring crop dimensions
   */
  const tmpCropWidth = ref(0)
  const tmpCropHeight = ref(0)

  /**
   * References to input components for value syncing
   */
  const cropPositionXInputRef = ref(null)
  const cropPositionYInputRef = ref(null)
  const cropWidthInputRef = ref(null)
  const cropHeightInputRef = ref(null)

  /**
   * Computed maximum values based on image dimensions and current crop box
   */
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

  /**
   * Extracts and stores crop box values into temporary refs on load
   */
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

  /**
   * Automatically switch subtool when operation type changes
   */
  watch(
    () => localOperation.value.type,
    (newType) => {
      editorStore.selectSubTool(newType)
    },
    { immediate: true },
  )

  /**
   * Emits updated operation object to parent
   */
  const update = () => {
    emit('update:operation', { ...localOperation.value })
  }

  /**
   * Updates crop box position (x or y) and syncs input values
   *
   * @param {'x' | 'y'} key - Which coordinate to update
   * @param {number} value - New value
   */
  const updatePosition = (key, value) => {
    if (key === 'x') {
      localOperation.value.cropBox.x = round(clamp(value, 0, maxCropPositionX.value))
    } else if (key === 'y') {
      localOperation.value.cropBox.y = round(clamp(value, 0, maxCropPositionY.value))
    }
    nextTick(() => {
      cropPositionXInputRef.value?.setValue(localOperation.value.cropBox.x)
      cropPositionYInputRef.value?.setValue(localOperation.value.cropBox.y)
    })
  }

  /**
   * Updates crop box dimensions (width or height), respecting aspect ratio if linked
   *
   * @param {'width' | 'height'} key - Dimension to update
   * @param {number} value - New value
   */
  const updateDimension = (key, value) => {
    const originalWidth = localOperation.value.cropBox.width
    const originalHeight = localOperation.value.cropBox.height

    if (key === 'width') {
      const clampedWidth = round(clamp(value, 0, maxCropWidth.value))

      if (isDimensionsLinked.value) {
        const aspectRatio = originalHeight / originalWidth || 1
        localOperation.value.cropBox.width = clampedWidth
        localOperation.value.cropBox.height = round(
          clamp(clampedWidth * aspectRatio, 0, maxCropHeight.value),
        )
      } else {
        localOperation.value.cropBox.width = clampedWidth
      }
    } else if (key === 'height') {
      const clampedHeight = round(clamp(value, 0, maxCropHeight.value))

      if (isDimensionsLinked.value) {
        const aspectRatio = originalWidth / originalHeight || 1

        localOperation.value.cropBox.height = clampedHeight
        localOperation.value.cropBox.width = round(
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
