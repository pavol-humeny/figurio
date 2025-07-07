import { ref, nextTick, onMounted, onBeforeUnmount } from 'vue'

export function useOneTool(editorStore, props, emit) {
  const subToolPos = ref({ top: 0, left: 0 })
  const wrapperRef = ref(null)

  const onRightClick = async (event) => {
    event.preventDefault()
    if (!props.tool.subTools) return

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

  const onClickSubTool = (subToolKey) => {
    editorStore.setToolWithOpenSubTools('')
    editorStore.selectSubTool(subToolKey)
    emit('click', props.tool.key, subToolKey)
  }

  const onClickTool = () => {
    editorStore.setToolWithOpenSubTools('')
    emit('click', props.tool.key, null)
  }

  const handleClickOutside = (e) => {
    const toolEl = wrapperRef.value
    if (
      editorStore.toolWithOpenSubToolsKey !== '' &&
      toolEl &&
      !toolEl.contains(e.target) &&
      !document.querySelector('.subTools-popup')?.contains(e.target)
    ) {
      editorStore.setToolWithOpenSubTools('')
    }
  }

  onMounted(() => {
    document.addEventListener('click', handleClickOutside)
  })
  onBeforeUnmount(() => {
    document.removeEventListener('click', handleClickOutside)
  })

  return {
    wrapperRef,
    subToolPos,
    onRightClick,
    onClickSubTool,
    onClickTool,
  }
}
