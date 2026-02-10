// import { ref } from 'vue'

// const warnings = ref([]) // Array of warnings
// const expandedIds = ref(new Set()) // IDs of expanded warnings

export const useWarningList = (imageStore, uiStore) => {
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
    if (imageStore.imageWarnings.find((w) => w.id === id)) return

    imageStore.imageWarnings.push({
      id,
      message,
      tipText,
      tipTitle,
      type,
      onRemove,
      onOpen,
      onClose,
    })

    // Set initial expanded state
    if (startState === 'open') {
      imageStore.expandedImageWarningIds.add(id)
      if (typeof onOpen === 'function') onOpen(id)
    } else {
      imageStore.expandedImageWarningIds.delete(id)
      if (typeof onClose === 'function') onClose(id)
    }
  }

  /**
   * Remove warning by ID from imageStore
   * @param {string} id - Unique ID
   */
  const removeWarning = (id) => {
    const warning = imageStore.imageWarnings.find((w) => w.id === id)
    if (!warning) return

    imageStore.imageWarnings = imageStore.imageWarnings.filter((w) => w.id !== id)
    imageStore.expandedImageWarningIds.delete(id)

    if (typeof warning.onRemove === 'function') warning.onRemove(id)

    uiStore.cursorOverViewportSettings = false
  }

  /**
   * Open warning by click
   * @param {string} id - Unique ID
   */
  const openByClick = (id) => {
    const warning = imageStore.imageWarnings.find((w) => w.id === id)
    if (!warning) return

    imageStore.expandedImageWarningIds.add(id)
    if (typeof warning.onOpen === 'function') warning.onOpen(id)
  }

  /**
   * Close warning by arrow
   * @param {string} id - Unique ID
   */
  const closeByArrow = (id) => {
    const warning = imageStore.imageWarnings.find((w) => w.id === id)
    if (!warning) return

    imageStore.expandedImageWarningIds.delete(id)
    if (typeof warning.onClose === 'function') warning.onClose(id)

    // Need to also hide item tip when closing warning
    uiStore.isItemTipVisible = false
    uiStore.cursorOverViewportSettings = false
  }

  /**
   * Toggle warning expanded/collapsed state
   * @param {string} id - Unique ID 
   */
  const toggleWarning = (id) => {
    if (isWarningExpanded(id)) {
      closeByArrow(id)
    } else {
      openByClick(id)
    }
  }

  /**
   * Check if warning is expanded
   * @param {string} id - Unique ID
   * @returns {boolean} - Is expanded
   */
  const isWarningExpanded = (id) => {
    return imageStore.expandedImageWarningIds.has(id)
  }

  /**
   * Check if warning is defined
   * @param {string} id - Unique ID
   * @returns {boolean} - Is defined
   */
  const isWarningDefined = (id) => {
    return imageStore.imageWarnings.find((w) => w.id === id) !== undefined
  }

  /**
   * Delete warning completely
   * @param {string} id - Unique ID
   */
  const deleteWarningById = (id) => {
    imageStore.imageWarnings = imageStore.imageWarnings.filter((w) => w.id !== id)
    imageStore.expandedImageWarningIds.delete(id)
  }

  /**
   * Hide warning by ID (collapse it)
   * @param {string} id - Unique ID
   */
  const hideWarningById = (id) => {
    const warning = imageStore.imageWarnings.find((w) => w.id === id)
    if (!warning) return

    imageStore.expandedImageWarningIds.delete(id)
  }

  /**
   * Expand warning by ID
   * @param {string} id - Unique ID
   */
  const expandWarningById = (id) => {
    const warning = imageStore.imageWarnings.find((w) => w.id === id)
    if (!warning) return

    imageStore.expandedImageWarningIds.add(id)
  }

  return {
    // warnings,
    // expandedIds,
    addWarning,
    removeWarning,
    openByClick,
    closeByArrow,
    isWarningExpanded,
    isWarningDefined,
    deleteWarningById,
    hideWarningById,
    expandWarningById,
    toggleWarning,
  }
}
