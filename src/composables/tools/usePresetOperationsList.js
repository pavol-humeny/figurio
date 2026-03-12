/**
 * @file: usePresetOperationsList.js
 * @author: Pavol Humeny
 * @date: 15.5.2026
 */
import { ref, watch } from 'vue'

/**
 * Logic for managing the list of preset operations
 *
 * @param {ReturnType<typeof import('@/stores/imageStore').useImageStore>} imageStore - Image store
 * @param {{
 *   localImageOperations: Array<Object>,
 *   clearSelected?: boolean,
 *   disabled?: boolean
 * }} props - Component props
 * @param {(event: string, value: any) => void} emit - Emit function
 * @param {(key: string) => string} t - Translation function
 * @returns {{
 *   selectedOperation: import('vue').Ref<Object | null>,
 *   internalList: import('vue').Ref<Array<Object>>,
 *   removeOperation: (index: number, operation: Object) => void,
 *   onDragUpdate: () => void,
 *   selectOperation: (operation: Object) => void,
 *   handleSelect: (e: MouseEvent, operation: Object) => void,
 *   getOperationLabel: (type: string) => string,
 *   imageCanBeCropped: (cropBox: {x: number, y: number, width: number, height: number}) => boolean,
 *   imageCanBeResize: (resizeDimensions: {width: number, height: number}) => boolean
 * }}
 */
export function usePresetOperationsList(imageStore, props, emit, t) {
  /**
   * Currently selected operation in the UI
   */
  const selectedOperation = ref(null)

  /**
   * Internal copy of the operations list for local updates
   */
  const internalList = ref([...props.localImageOperations])

  /**
   * Watch for changes in the localImageOperations prop and update internal state
   */
  watch(
    () => props.localImageOperations,
    (newVal) => {
      internalList.value = [...newVal]
    },
    { immediate: true, deep: true },
  )

  /**
   * Watch for external clearSelected signal and reset selection
   */
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

  /**
   * Removes an operation from the list and emits the updated list
   *
   * @param {number} index - Index of the operation to remove
   * @param {Object} operation - Operation object being removed
   */
  const removeOperation = (index, operation) => {
    if (operation === selectedOperation.value) {
      selectedOperation.value = null
    }
    internalList.value.splice(index, 1)
    emit('update:localImageOperations', [...internalList.value])
  }

  /**
   * Emits the new operations list after a drag reorder
   */
  const onDragUpdate = () => {
    emit('update:localImageOperations', [...internalList.value])
  }

  /**
   * Toggles operation selection
   *
   * @param {Object} operation - Operation to select or deselect
   */
  const selectOperation = (operation) => {
    if (selectedOperation.value === operation) {
      selectedOperation.value = null
      emit('selectOperation', null)
    } else {
      selectedOperation.value = operation
      emit('selectOperation', operation)
    }
  }

  /**
   * Handles user selection of an operation (ignores drag handle clicks)
   *
   * @param {MouseEvent} e - Click event
   * @param {Object} operation - Operation object
   */
  const handleSelect = (e, operation) => {
    if (e.target.closest('.drag-handle') || props.disabled) return
    selectOperation(operation)
  }

  /**
   * Returns localized label for the given operation type
   *
   * @param {string} type - Operation type
   * @returns {string} - Translated label
   */
  const getOperationLabel = (type) => {
    switch (type) {
      case 'rotation':
        return t('tools.preset.settings.myPresets.presetValues.transformations.rotation')
      case 'flip':
        return t('tools.preset.settings.myPresets.presetValues.transformations.flip')
      case 'autoCrop':
        return t('tools.preset.settings.myPresets.presetValues.autoCrop.label')
      case 'grayscale':
        return t('tools.preset.settings.myPresets.presetValues.grayscale.label')
      case 'crop':
        return t('tools.preset.settings.myPresets.presetValues.crop.label')
      default:
        return type
      // UPDATE new tool
    }
  }

  /**
   * Checks if the given crop box fits inside the image
   *
   * @param {{x: number, y: number, width: number, height: number}} cropBox
   * @returns {boolean}
   */
  const imageCanBeCropped = (cropBox) => {
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

  /**
   * Checks if the resize dimensions are valid (positive size)
   *
   * @param {{width: number, height: number}} resizeDimensions
   * @returns {boolean}
   */
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
