import { ref, watch } from 'vue'

export function usePresetOperationsList(imageStore, props, emit, t) {
  const selectedOperation = ref(null)
  const internalList = ref([...props.localImageOperations])

  watch(
    () => props.localImageOperations,
    (newVal) => {
      internalList.value = [...newVal]
    },
    { immediate: true, deep: true },
  )

  watch(
    () => props.clearSelected,
    (newVal) => {
      if (newVal) {
        selectedOperation.value = null
        emit('selectOperation', null)
      }
    },
    { immediate: true },
  )

  const removeOperation = (index, operation) => {
    if (operation === selectedOperation.value) {
      console.log('Removing selected operation:', operation)
      selectedOperation.value = null
    }
    internalList.value.splice(index, 1)
    emit('update:localImageOperations', [...internalList.value])
  }

  const onDragUpdate = () => {
    emit('update:localImageOperations', [...internalList.value])
  }

  const selectOperation = (operation) => {
    if (selectedOperation.value === operation) {
      selectedOperation.value = null
      emit('selectOperation', null)
    } else {
      selectedOperation.value = operation
      emit('selectOperation', operation)
    }
  }

  const handleSelect = (e, operation) => {
    if (e.target.closest('.drag-handle') || props.disabled) return
    selectOperation(operation)
  }

  const getOperationLabel = (type) => {
    switch (type) {
      case 'rotation':
        return t('tools.preset.settings.myPresets.presetValues.transformations.rotation')
      case 'flip':
        return t('tools.preset.settings.myPresets.presetValues.transformations.flip')
      case 'smartCrop':
        return t('tools.preset.settings.myPresets.presetValues.smartCrop.label')
      case 'grayscale':
        return t('tools.preset.settings.myPresets.presetValues.grayscale.label')
      case 'crop':
        return t('tools.preset.settings.myPresets.presetValues.crop.label')
      default:
        return type
      // UPDATE new tool
    }
  }

  const imageCanBeCropped = (cropBox) => {
    console.log('Checking crop box:', cropBox)
    console.log('Image dimensions:', imageStore.fileDimensions)
    if (
      cropBox.x + cropBox.width > imageStore.fileDimensions.width ||
      cropBox.y + cropBox.height > imageStore.fileDimensions.height ||
      cropBox.x < 0 ||
      cropBox.y < 0 ||
      cropBox.width <= 0 ||
      cropBox.height <= 0
    ) {
      return false
    }
    return true
  }

  const imageCanBeResize = (resizeDimensions) => {
    if (resizeDimensions.width <= 0 || resizeDimensions.height <= 0) {
      return false
    }
    return true
  }

  return {
    selectedOperation,
    internalList,
    removeOperation,
    onDragUpdate,
    selectOperation,
    handleSelect,
    getOperationLabel,
    imageCanBeCropped,
    imageCanBeResize,
  }
}
