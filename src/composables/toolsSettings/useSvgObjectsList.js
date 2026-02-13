import { useSvgObjects } from '@/composables/tools/useSvgObjects'
import { useToolsPanel } from '@/composables/tools/useToolsPanel'
import { ref, computed, watch, nextTick, onBeforeUnmount } from 'vue'
import { useConsole } from '@/composables/common/useConsole.js'
const { log } = useConsole()

/**
 * Logic for managing the SVG Objects List panel, including resizing,
 *
 * @param {ReturnType<typeof import('@/stores/imageStore').useImageStore>} imageStore - Image store instance
 * @param {ReturnType<typeof import('@/stores/historyStore').useHistoryStore>} historyStore - History store instance
 * @param {ReturnType<typeof import('@/stores/viewportStore').useViewportStore>} viewportStore - Viewport store instance
 * @param {ReturnType<typeof import('@/stores/editorStore').useEditorStore>} editorStore - Editor store instance
 * @param {ReturnType<typeof import('@/stores/uiStore').useUiStore>} uiStore - UI store instance
 * @param {Function} t - Translation function from vue-i18n
 * @returns {{
 *   mappedObjects: import('vue').ComputedRef<Array<{id: string, name: string, draggable: boolean}>>,
 *   panelVars: import('vue').ComputedRef<Object>,
 *   startResize: (event: MouseEvent) => void,
 *   selectObject: (id: string) => void,
 *   deleteObject: () => void,
 *   renameObject: (id: string, newName: string) => void,
 *   editingId: import('vue').Ref<string | null>,
 *   startEditing: (id: string) => void,
 *   editingInputRef: import('vue').Ref<HTMLElement | null>,
 * }}
 */
export function useSvgObjectsList(
  imageStore,
  historyStore,
  viewportStore,
  editorStore,
  uiStore,
  workspaceStore,
  t,
) {
  const { deleteSelectedSvgObjects } = useSvgObjects(
    imageStore,
    historyStore,
    viewportStore,
    editorStore,
    uiStore,
    workspaceStore,
    t,
  )
  const { toggleTool } = useToolsPanel(editorStore, imageStore, uiStore, workspaceStore, t)

  /**
   * Whether resize is currently active
   */
  const isResizing = ref(false)
  /**
   * Initial mouse X position when resizing starts
   */
  const startY = ref(0)
  /**
   * Initial panel width before resizing
   */
  const startHeight = ref(0)

  /**
   * Automatically show/hide panel based on presence of SVG objects
   */
  watch(
    () => imageStore.svgObjects.length,
    (newVal) => {
      if (newVal === 0) {
        uiStore.svgObjectsListDisplayed = false
      } else {
        uiStore.svgObjectsListDisplayed = true
      }
    },
    { immediate: true },
  )

  /**
   * Initiates the panel resizing operation.
   *
   * @param {MouseEvent} event - Mouse down event on resize handle
   */
  const startResize = (event) => {
    isResizing.value = true
    startY.value = event.clientY
    startHeight.value = uiStore.svgObjectsListHeight
    document.addEventListener('mousemove', handleResize)
    document.addEventListener('mouseup', stopResize)
  }

  /**
   * Dynamically updates the panel width during mouse movement.
   *
   * @param {MouseEvent} event - Mouse move event during resize
   */
  const handleResize = (event) => {
    if (!isResizing.value) return

    const container = document.querySelector('.svg-objects-list-panel')?.parentElement
    if (!container) return

    const containerHeight = container.clientHeight
    const deltaY = event.clientY - startY.value

    let newHeightPercent = startHeight.value - (deltaY / containerHeight) * 100

    uiStore.setSvgObjectsListHeight(newHeightPercent)
  }

  /**
   * Ends the resize operation and removes mouse event listeners.
   */
  const stopResize = () => {
    isResizing.value = false
    document.removeEventListener('mousemove', handleResize)
    document.removeEventListener('mouseup', stopResize)
  }

  /**
   * CSS variables for the panel styling
   */
  const panelVars = computed(() => {
    return {
      '--panel-height': uiStore.svgObjectsListDisplayed ? `${uiStore.svgObjectsListHeight}%` : '0%',
    }
  })

  /**
   * Computed array of SVG and blur objects for display and reordering.
   * Draggable SVG objects are listed first, followed by non-draggable blur objects.
   */
  const mappedObjects = computed({
    get() {
      // Filter out certain magnifyArea objects
      const svgObjs = imageStore.svgObjects
        .filter((obj) => {
          if (obj.class === 'magnifyArea') {
            return false
          }
          return true
        })
        .map((obj) => ({
          id: obj.id,
          name: obj.name,
          draggable: true, // Can be reordered
        }))
        .reverse() // Reverse to match visual stacking order

      // Non-draggable blur objects
      // const blurObjs = imageStore.blurObjects.map((obj) => ({
      //   id: obj.id,
      //   name: obj.name,
      //   draggable: false,
      // }))

      return [...svgObjs]
    },
    set(newArray) {
      // Reorder imageStore.svgObjects based on newArray order
      const draggableArray = newArray
        .filter((o) => o.draggable)
        .slice()
        .reverse()
      const filteredIds = draggableArray.map((o) => o.id)
      const newSvgObjects = []

      filteredIds.forEach((id) => {
        const original = imageStore.svgObjects.find((o) => o.id === id)
        if (original) {
          const updatedName = draggableArray.find((o) => o.id === id)?.name
          if (updatedName) original.name = updatedName
          newSvgObjects.push(original)
        }
      })

      // Add all other objects that were not filtered
      imageStore.svgObjects.forEach((obj) => {
        if (!filteredIds.includes(obj.id)) newSvgObjects.push(obj)
      })

      imageStore.svgObjects = newSvgObjects
    },
  })

  /**
   * The ID of the currently editing SVG object.
   */
  const editingId = ref(null)

  /**
   * Reference to the input element for editing object names.
   */
  const editingInputRef = ref(null)

  /**
   * Event listener for detecting clicks outside the input to finish editing.
   */
  let clickListener = null

  /**
   * Starts the editing process for a specific SVG object.
   *
   * @param {string} id - The ID of the SVG object to edit
   */
  const startEditing = async (id) => {
    editingId.value = id

    await nextTick() // Wait for DOM update

    if (editingInputRef.value) {
      editingInputRef.value.focus()
      editingInputRef.value.select() // Select all text
    }

    // Global click listener to detect clicks outside the input
    clickListener = (e) => {
      const input = editingInputRef.value
      if (input && !input.contains(e.target)) {
        finishEditing()
      }
    }
    document.addEventListener('click', clickListener)
  }

  /**
   * Finishes the editing process, removing event listeners and resetting state.
   */
  const finishEditing = () => {
    editingId.value = null

    if (clickListener) {
      document.removeEventListener('click', clickListener)
      clickListener = null
    }
  }

  /**
   * Renames an SVG object, ensuring the new name is valid.
   *
   * @param {string} id - The ID of the SVG object to rename
   * @param {string} newName - The new name for the SVG object
   */
  const renameObject = (id, newName) => {
    log('Renaming', id, 'to', newName)

    const obj = imageStore.svgObjects.find((o) => o.id === id)
    if (!obj) return
    const oldName = obj.name

    const trimmed = newName.trim()
    if (trimmed.length !== 0) {
      obj.name = trimmed
    } else {
      obj.name = ''
      obj.name = oldName
    }

    finishEditing()
  }

  /**
   * Deletes the currently selected SVG object.
   */
  const deleteObject = () => {
    deleteSelectedSvgObjects(t)
  }

  /**
   * Selects an SVG object by its ID, switching tools if necessary.
   * @param {string} id - The ID of the SVG object to select
   */
  const selectObject = (id) => {
    const object = imageStore.getSvgObjectById(id)
    if (!object) return

    if (editingId.value !== null) return // Not in editing mode

    // Switch tool if needed
    if (
      object.class !== editorStore.selectedToolKey ||
      object.tag !== editorStore.selectedTabPerTool[editorStore.selectedToolKey]
    ) {
      const tool = object.class
      let tab = null

      if (tool === 'shape') {
        tab = object.tag
        if (tab === 'rect') tab = 'rectangle'
      }

      editorStore.previousToolKey = editorStore.selectedToolKey

      toggleTool(tool, tab, false) // Do not deselect on same tool
    }

    // Select the object
    nextTick(() => {
      if (imageStore.selectedSvgObjectId === id) {
        imageStore.selectedSvgObjectId = null
      } else {
        imageStore.selectedSvgObjectId = id
      }
    })
  }

  /**
   * Gets a name for display, using translations for default names
   *
   * @param {string} name - The original name of the SVG object
   * @returns {string} - The display name
   */
  const getElementName = (name) => {
    if (name.length > 20) {
      // Use translations for default object names
      // Remove first 20 chars (padding)
      const shortName = name.slice(20)

      // Map short names to translations
      if (shortName.startsWith('blur')) {
        return t('tools.blur.objectNames')
      } else if (shortName.startsWith('magnifyArea')) {
        return t('tools.magnifyArea.objectNames')
      } else if (shortName.startsWith('rectangle')) {
        return t('tools.shape.objectNames.rectangle')
      } else if (shortName.startsWith('ellipse')) {
        return t('tools.shape.objectNames.ellipse')
      } else if (shortName.startsWith('line')) {
        return t('tools.shape.objectNames.line')
      } else if (shortName.startsWith('text')) {
        return t('tools.text.objectNames')
      }
    } else {
      // Use user defined name
      return name
    }
  }

  /**
   * Cleanup on component unmount
   */
  onBeforeUnmount(() => {
    if (clickListener) {
      document.removeEventListener('click', clickListener)
    }
  })

  return {
    mappedObjects,
    panelVars,
    startResize,
    selectObject,
    deleteObject,
    renameObject,
    editingId,
    startEditing,
    editingInputRef,
    getElementName,
  }
}
