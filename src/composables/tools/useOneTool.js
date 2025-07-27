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
   * Handle right-click to toggle sub-tool popup
   *
   * @param {MouseEvent} event - Right click event
   */
  const onRightClick = async (event) => {
    event.preventDefault()
    if (!props.tool.subTools || !imageStore.isImageLoaded) return

    // Toggle off if already open
    if (editorStore.toolWithOpenSubToolsKey === props.tool.key) {
      editorStore.setToolWithOpenSubTools('')
      return
    }

    await nextTick()
    const rect = wrapperRef.value.getBoundingClientRect()
    subToolPos.value = {
      top: rect.top,
      left: rect.right + 10,
    }
    editorStore.setToolWithOpenSubTools(props.tool.key)
  }

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
    onRightClick,
    onClickTab,
    onClickTool,
  }
}
