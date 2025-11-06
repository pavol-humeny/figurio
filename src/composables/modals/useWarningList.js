import { ref } from 'vue'

const warnings = ref([]) // Array of warnings
const expandedIds = ref(new Set()) // IDs of expanded warnings

export const useWarningList = (imageStore) => {
  /**
   * Add new warning
   * @param {string} id - Unique ID
   * @param {string} message - Main message
   * @param {string} tipText - Text for tooltip ($t)
   * @param {string} tipTitle - Title for tooltip ($t)
   * @param {string} type - 'warning' | 'info' | 'error'
   * @param {string} startState - 'open' | 'close'
   * @param {Function} onRemove - Callback on remove
   * @param {Function} onOpen - Callback on open
   * @param {Function} onClose - Callback on close
   */
  const addWarning = (
    id,
    message,
    tipText = '',
    tipTitle = '',
    type = 'warning',
    startState = 'open',
    onRemove = null,
    onOpen = null,
    onClose = null,
  ) => {
    if (warnings.value.find((w) => w.id === id)) return

    warnings.value.push({
      id,
      message,
      tipText,
      tipTitle,
      type,
      onRemove,
      onOpen,
      onClose,
    })

    // Add to imageStore warnings
    if (!imageStore.imageWarnings.includes(id)) {
      imageStore.imageWarnings.push(id)
    }

    // Set initial expanded state
    if (startState === 'open') {
      expandedIds.value.add(id)
      if (typeof onOpen === 'function') onOpen(id)
    } else {
      expandedIds.value.delete(id)
      if (typeof onClose === 'function') onClose(id)
    }
  }

  /**
   * Remove warning by ID
   * @param {string} id - Unique ID
   */
  const removeWarning = (id) => {
    const warning = warnings.value.find((w) => w.id === id)
    if (!warning) return

    warnings.value = warnings.value.filter((w) => w.id !== id)
    expandedIds.value.delete(id)

    // Remove from imageStore warnings
    const index = imageStore.imageWarnings.indexOf(id)
    if (index !== -1) imageStore.imageWarnings.splice(index, 1)

    if (typeof warning.onRemove === 'function') warning.onRemove(id)
  }

  /**
   * Open warning by click
   * @param {string} id - Unique ID
   */
  const openByClick = (id) => {
    const warning = warnings.value.find((w) => w.id === id)
    if (!warning) return

    expandedIds.value.add(id)
    if (typeof warning.onOpen === 'function') warning.onOpen(id)
  }

  /**
   * Close warning by arrow
   * @param {string} id - Unique ID
   */
  const closeByArrow = (id) => {
    const warning = warnings.value.find((w) => w.id === id)
    if (!warning) return

    expandedIds.value.delete(id)
    if (typeof warning.onClose === 'function') warning.onClose(id)
  }

  /**
   * Check if warning is expanded
   * @param {string} id - Unique ID
   * @returns {boolean} - Is expanded
   */
  const isWarningExpanded = (id) => {
    return expandedIds.value.has(id)
  }

  /**
   * Check if warning is defined
   * @param {string} id - Unique ID
   * @returns {boolean} - Is defined
   */
  const isWarningDefined = (id) => {
    return warnings.value.find((w) => w.id === id) !== undefined
  }

  const deleteWarning = (id) => {
    warnings.value = warnings.value.filter((w) => w.id !== id)
    expandedIds.value.delete(id)
  }

  return {
    warnings,
    expandedIds,
    addWarning,
    removeWarning,
    openByClick,
    closeByArrow,
    isWarningExpanded,
    isWarningDefined,
    deleteWarning,
  }
}
