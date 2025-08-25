import { ref, nextTick, onMounted, onBeforeUnmount } from 'vue'

/**
 * Logic for handling a single tool button
 *
 * @param {object} editorStore - Store for editor state, including selected tool and subtool keys.
 * @param {object} props - Props passed from the component, expects `tool` object with `key` and optional `subTools`.
 * @param {Function} emit - Emit function from the component to send events upward.
 * @returns {object} Bindings and methods for the tool component
 */
export function useOneTool(editorStore, imageStore, props, emit) {
  /**
   * Reference to the DOM element of the tool wrapper
   */
  const wrapperRef = ref(null)

  /**
   * Position of the sub-tool popup relative to the main tool button
   */
  const subToolPos = ref({ top: 0, left: 0 })

  /**
   * Reference to the timeout for closing the sub-tool popup
   */
  const closeTimeout = ref(null)

  /**
   * Handle mouse enter event to open subtools popup
   */
  const onMouseEnter = async () => {
    if (closeTimeout.value) {
      clearTimeout(closeTimeout.value)
      closeTimeout.value = null
    }

    if (!props.tool.subTools || !imageStore.isImageLoaded) return

    await nextTick()
    const rect = wrapperRef.value.getBoundingClientRect()

    subToolPos.value = {
      top: rect.top - props.tool.subTools.length * 50,
      left: rect.right + 20,
    }
    editorStore.setToolWithOpenSubTools(props.tool.key)
  }

  /**
   * Check if mouse is outside tool and popup
   */
  const closeIfOutside = () => {
    closeTimeout.value = setTimeout(() => {
      const popupEl = document.querySelector('.subTools-popup')
      const toolEl = wrapperRef.value

      if (!popupEl || !toolEl) return

      const active = editorStore.toolWithOpenSubToolsKey === props.tool.key

      // Close if mouse is not over tool or popup
      if (active && !toolEl.matches(':hover') && !popupEl.matches(':hover')) {
        editorStore.setToolWithOpenSubTools('')
      }
    }, 250) // Delay for mouse movement to subtools
  }

  /**
   * Close sub-tool popup on mouse leave
   */
  const onMouseLeave = () => closeIfOutside()

  /**
   * Handle sub-tool click and emit the tab key
   *
   * @param {string} tabKey - Key of the clicked sub-tool tab
   */
  const onClickTab = (tabKey) => {
    editorStore.setToolWithOpenSubTools('')
    editorStore.selectTab(tabKey)
    emit('click', props.tool.key, tabKey)
  }

  /**
   * Handle click on the main tool button
   */
  const onClickTool = () => {
    editorStore.setToolWithOpenSubTools('')
    emit('click', props.tool.key, null)
  }

  /**
   * Close sub-tool popup if user clicks outside of the tool or popup
   *
   * @param {MouseEvent} event - Click event
   */
  const handleClickOutside = (event) => {
    const toolEl = wrapperRef.value
    if (
      editorStore.toolWithOpenSubToolsKey !== '' &&
      toolEl &&
      !toolEl.contains(event.target) &&
      !document.querySelector('.subTools-popup')?.contains(event.target)
    ) {
      editorStore.setToolWithOpenSubTools('')
    }
  }

  // Register click outside handler
  onMounted(() => {
    document.addEventListener('click', handleClickOutside)
  })

  // Cleanup click outside handler on unmount
  onBeforeUnmount(() => {
    document.removeEventListener('click', handleClickOutside)
  })

  return {
    wrapperRef,
    subToolPos,
    onMouseEnter,
    onMouseLeave,
    onClickTab,
    onClickTool,
  }
}
