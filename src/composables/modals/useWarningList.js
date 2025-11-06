import { ref } from 'vue'

const warnings = ref([]) // Array of warnings
const expandedIds = ref(new Set()) // IDs of expanded warnings

export const useWarningList = () => {
  /**
   * Add new warning
   * @param {string} id - Unique ID
   * @param {string} title - Title
   * @param {string} message - Main message
   * @param {string} tipText - Text for tooltip ($t)
   * @param {string} tipTitle - Title for tooltip ($t)
   * @param {string} type - 'warning' | 'info' | 'error'
   * @param {string} startState - 'open' | 'close'
   * @param {Function} onRemove - Callback on remove
   */
  const addWarning = (
    id,
    title,
    message,
    tipText = '',
    tipTitle = '',
    type = 'warning',
    startState = 'open',
    onRemove = null,
  ) => {
    if (warnings.value.find((w) => w.id === id)) return

    warnings.value.push({
      id,
      title,
      message,
      tipText,
      tipTitle,
      type,
      onRemove,
    })

    // Set initial expanded state
    if (startState === 'open') {
      expandedIds.value.add(id)
    } else {
      expandedIds.value.delete(id)
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

    if (typeof warning.onRemove === 'function') warning.onRemove(id)
  }

  /**
   * Open warning by click
   * @param {string} id - Unique ID
   */
  const openByClick = (id) => {
    expandedIds.value.add(id)
  }

  /**
   * Close warning by arrow
   * @param {string} id - Unique ID
   */
  const closeByArrow = (id) => {
    expandedIds.value.delete(id)
  }

  return {
    warnings,
    expandedIds,
    addWarning,
    removeWarning,
    openByClick,
    closeByArrow,
  }
}
