/**
 * @file: useSvgObjects.js
 * @author: Pavol Humeny
 * @date: 15.5.2026
 * @description: Composable for managing SVG objects on the canvas, including selection, movement, deletion, copy/paste, and layering. This module provides functions to manipulate SVG objects in the editor, such as moving them by a specified offset, deleting selected objects, copying and pasting objects, and changing their z-order (bring to front/send to back). It also computes display info for the selected object and allows selecting/deselecting all objects.
 */
import { computed, ref, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
import { useTextTool } from './useTextTool'
import { useShapeTool } from './useShapeTool'
import { useMath } from '../common/useMath'
import { useSvgFunctions } from './useSvgFunctions'
import { editorConfig } from '@/config/editorConfig'
import { useBlurTool } from './useBlurTool'
import { useMagnifyAreaTool } from './useMagnifyAreaTool'
import { useToolsPanel } from './useToolsPanel'
import { useConsole } from '@/composables/common/useConsole.js'
const { log } = useConsole()

/**
 * Logic for managing SVG objects on the canvas, including selection, movement, deletion, copy/paste, and layering
 * @param {ReturnType<typeof useImageStore>} imageStore - Image store instance
 * @param {ReturnType<typeof useHistoryStore>} historyStore - History store instance
 * @param {ReturnType<typeof useViewportStore>} viewportStore - Viewport store instance
 * @param {ReturnType<typeof useEditorStore>} editorStore - Editor store instance
 * @param {ReturnType<typeof useUiStore>} uiStore - UI store instance
 * @param {ReturnType<typeof useWorkspaceStore>} workspaceStore - Workspace store instance
 * @param {Function} t - Translation function from vue-i18n
 */
export function useSvgObjects(
  imageStore,
  historyStore,
  viewportStore,
  editorStore,
  uiStore,
  workspaceStore,
  t,
) {
  const { round, distance } = useMath()
  const textTool = useTextTool(imageStore, historyStore, editorStore, uiStore, t)
  const shapeTool = useShapeTool(editorStore, imageStore, historyStore, uiStore, t)
  const { getSnapOffsetToEdges, getObjectCenter } = useSvgFunctions(imageStore)
  const blurTool = useBlurTool(imageStore, historyStore, editorStore, uiStore, t)
  const magnifyAreaTool = useMagnifyAreaTool(imageStore, historyStore, editorStore, uiStore, t)
  const { toggleTool } = useToolsPanel(editorStore, imageStore, uiStore, viewportStore, t)

  /**
   * Selection box rectangle (used when dragging with select tool)
   */
  const selectBox = ref(null)

  /**
   * Whether any SVG object is currently being drawn
   */
  const isDrawing = ref(false)

  /**
   * Start point of the current drawing operation
   * Used to calculate width and height of the object being drawn
   */
  const drawingStart = ref({ x: 0, y: 0 })

  /**
   * Currently drawn object being created
   */
  const currentDrawingObject = ref(null)

  /**
   * Move the selected object by a specified offset in global coordinates (ignores rotation)
   * @param {number} dx - Offset in X direction
   * @param {number} dy - Offset in Y direction
   */
  const moveObjectBy = (dx, dy, local = false) => {
    if (imageStore.selectedSvgObjectId === null) return
    const object = imageStore.getSvgObjectById(imageStore.selectedSvgObjectId)
    if (!object) return

    const { attrs, tag, textBBox } = object

    const transform = attrs.transform || ''
    const match = transform.match(/rotate\((-?\d+\.?\d*),\s*([-\d.]+),\s*([-\d.]+)\)/)
    const angle = match ? parseFloat(match[1]) : 0

    if (local) {
      const rad = (angle * Math.PI) / 180
      dx = dx * Math.cos(rad) - dy * Math.sin(rad)
      dy = dx * Math.sin(rad) + dy * Math.cos(rad)
    }

    // Move object
    if ('x' in attrs && 'y' in attrs) {
      attrs.x += dx
      attrs.y += dy

      if (tag === 'text' && textBBox) {
        textBBox.x += dx
        textBBox.y += dy
      }
    } else if ('cx' in attrs && 'cy' in attrs) {
      attrs.cx += dx
      attrs.cy += dy
    } else if ('x1' in attrs && 'y1' in attrs && 'x2' in attrs && 'y2' in attrs) {
      attrs.x1 += dx
      attrs.x2 += dx
      attrs.y1 += dy
      attrs.y2 += dy
    }

    // If rotation, just update center
    if (match) {
      let cx = 0,
        cy = 0
      if ('x' in attrs && 'y' in attrs && 'width' in attrs && 'height' in attrs) {
        cx = attrs.x + attrs.width / 2
        cy = attrs.y + attrs.height / 2
      } else if ('cx' in attrs && 'cy' in attrs) {
        cx = attrs.cx
        cy = attrs.cy
      } else if ('x1' in attrs && 'x2' in attrs && 'y1' in attrs && 'y2' in attrs) {
        cx = (attrs.x1 + attrs.x2) / 2
        cy = (attrs.y1 + attrs.y2) / 2
      } else if (tag === 'text' && textBBox) {
        cx = textBBox.x + textBBox.width / 2
        cy = textBBox.y + textBBox.height / 2
      }

      attrs.transform = `rotate(${angle}, ${cx}, ${cy})`
    }

    historyStore.push(imageStore.getSnapshot(t))

    // Re-render overlay if blur or magnify area
    if (object.class === 'blur') {
      imageStore.blurOverlayNeedToBeRendered = true
    } else if (object.class === 'magnifyArea') {
      imageStore.magnifyOverlayNeedToBeRendered = true
    }
  }

  /**
   * Move the selected object one pixel to the left (global)
   */
  const moveObjectLeftGlobal = () => moveObjectBy(-1, 0, false)

  /**
   * Move the selected object one pixel to the right (global)
   */
  const moveObjectRightGlobal = () => moveObjectBy(1, 0, false)

  /**
   * Move the selected object one pixel up (global)
   */
  const moveObjectUpGlobal = () => moveObjectBy(0, -1, false)

  /**
   * Move the selected object one pixel down (global)
   */
  const moveObjectDownGlobal = () => moveObjectBy(0, 1, false)

  /**
   * Move the selected object one pixel to the left (local)
   */
  const moveObjectLeftLocal = () => moveObjectBy(-1, 0, true)

  /**
   * Move the selected object one pixel to the right (local)
   */
  const moveObjectRightLocal = () => moveObjectBy(1, 0, true)

  /**
   * Move the selected object one pixel up (local)
   */
  const moveObjectUpLocal = () => moveObjectBy(0, -1, true)

  /**
   * Move the selected object one pixel down (local)
   */
  const moveObjectDownLocal = () => moveObjectBy(0, 1, true)

  /**
   * Delete selected SVG object
   */
  const deleteSelectedSvgObjects = (t) => {
    console.warn('deleteSelectedSvgObjects is being called') // Debug log to check if function is called
    const selectedIds = imageStore.selectedSvgObjectIds

    if (imageStore.selectedSvgObjectId === null && selectedIds.length === 0) {
      return
    }

    const idsToDelete = new Set()
    const blurIdsToDelete = new Set()
    const magnifyIdsToDelete = new Set()

    // One selected object
    if (selectedIds.length === 0) {
      const selected = imageStore.getSelectedSvgObject()
      if (!selected) return

      idsToDelete.add(selected.id)

      // If blur also delete filter, clip and image
      if (selected.class === 'blur') {
        blurIdsToDelete.add(selected.id)
      } else if (selected.class === 'magnifyArea') {
        magnifyIdsToDelete.add(selected.id)
      } else {
        idsToDelete.add(selected.id)
      }

      log('11')
      imageStore.selectedSvgObjectId = null
    }

    // Multiple selected objects
    else {
      for (const id of selectedIds) {
        const obj = imageStore.getSvgObjectById(id)

        if (obj.class === 'blur') {
          blurIdsToDelete.add(obj.id)
        } else if (obj.class === 'magnifyArea') {
          magnifyIdsToDelete.add(obj.id)
        } else {
          idsToDelete.add(id)
        }
      }

      imageStore.selectedSvgObjectIds = []
      imageStore.selectedSvgObjectId = null
    }

    // Delete objects from the store
    const indicesToDelete = [...idsToDelete]
      .map((id) => imageStore.getIndexOfSvgObjectById(id))
      .filter((i) => i !== -1)
      .sort((a, b) => b - a)

    const magnifyIndicesToDelete = [...magnifyIdsToDelete]
      .map((id) => imageStore.getIndexOfMagnifyObjectById(id))
      .filter((i) => i !== -1)
      .sort((a, b) => b - a)

    const blurIndicesToDelete = [...blurIdsToDelete]
      .map((id) => imageStore.getIndexOfBlurObjectById(id))
      .filter((i) => i !== -1)
      .sort((a, b) => b - a)

    for (const i of indicesToDelete) {
      imageStore.svgObjects.splice(i, 1)
    }

    for (const i of blurIndicesToDelete) {
      imageStore.blurObjects.splice(i, 1)
    }

    for (const i of magnifyIndicesToDelete) {
      imageStore.magnifyObjects.splice(i, 1)
    }

    historyStore.push(imageStore.getSnapshot(t))

    // Re-render overlay
    imageStore.blurOverlayNeedToBeRendered = true
    imageStore.magnifyOverlayNeedToBeRendered = true
  }

  /**
   * Copy the currently selected SVG object
   */
  const copySelectedSvgObject = () => {
    if (imageStore.selectedSvgObjectId === null) return

    const object = imageStore.getSvgObjectById(imageStore.selectedSvgObjectId)
    if (!object) return

    // Deep copy of object
    imageStore.clipboardSvgObject = JSON.parse(JSON.stringify(object))
  }

  /**
   * Paste copied SVG object and center it on the canvas
   */
  const pasteSvgObjectToCenter = () => {
    if (!imageStore.clipboardSvgObject) return

    const newObject = JSON.parse(JSON.stringify(imageStore.clipboardSvgObject))

    // Paste only objects in same tool as object class
    if (newObject.class !== editorStore.selectedToolKey && editorStore.selectedToolKey !== 'select') return

    newObject.id = Date.now()

    const { attrs, tag } = newObject

    const offset = 10 // Offset from object original position to avoid exact overlap

    if (tag === 'rect') {
      attrs.x += offset
      attrs.y += offset
    } else if (tag === 'ellipse' && 'rx' in attrs && 'ry' in attrs) {
      attrs.cx += offset
      attrs.cy += offset
    } else if (tag === 'line' && 'x1' in attrs && 'x2' in attrs && 'y1' in attrs && 'y2' in attrs) {
      attrs.x1 += offset
      attrs.y1 += offset
      attrs.x2 += offset
      attrs.y2 += offset
    } else if (tag === 'text') {
      if (newObject.textBBox) {
        attrs.x += offset
        attrs.y += offset
      } else {
        attrs.x += offset
        attrs.y += offset
      }
    }
    // If it is blur update overlay
    if (newObject.class === 'blur') {
      imageStore.blurOverlayNeedToBeRendered = true
    }

    // If it is magnify area update overlay
    if (newObject.class === 'magnifyArea') {
      imageStore.magnifyOverlayNeedToBeRendered = true
    }

    if (newObject.class === 'blur') {
      imageStore.blurObjects.push(newObject)
    } else if (newObject.class === 'magnifyArea') {
      imageStore.magnifyObjects.push(newObject)
    } else {
      imageStore.svgObjects.push(newObject)
    }

    imageStore.selectedSvgObjectId = newObject.id

    historyStore.push(imageStore.getSnapshot(t))
  }

  /**
   * Duplicate the selected SVG object and paste it to the center
   */
  const duplicateSelectedSvgObject = () => {
    if (imageStore.selectedSvgObjectId === null) return

    const object = imageStore.getSvgObjectById(imageStore.selectedSvgObjectId)
    if (!object) return

    // Deep copy of object
    imageStore.clipboardSvgObject = JSON.parse(JSON.stringify(object))

    pasteSvgObjectToCenter()
  }

  /**
   * Cut the selected SVG object
   */
  const cutSelectedSvgObject = () => {
    if (imageStore.selectedSvgObjectId === null) return

    // Copy the object first
    copySelectedSvgObject()

    // Then delete it
    deleteSelectedSvgObjects(t)
  }

  /**
   * Bring the selected SVG object to front
   * @param {Function} t - Translation function for localized strings
   * @param {string} type - The type of object ('svg', 'blur', 'magnify') to determine which list to operate on
   */
  const bringSelectedObjectToFront = (t, type) => {
    if (imageStore.selectedSvgObjectId === null) return

    let list
    let index

    if (type === 'blur') {
      list = imageStore.blurObjects
      index = imageStore.getIndexOfSelectedBlurObject()
    } else if (type === 'magnify') {
      list = imageStore.magnifyObjects
      index = imageStore.getIndexOfSelectedMagnifyObject()
    } else {
      list = imageStore.svgObjects
      index = imageStore.getIndexOfSelectedSvgObject()
    }

    if (!list || index === -1) return
    if (index >= list.length - 1) return // already at front

    const obj = list.splice(index, 1)[0]
    list.push(obj)

    historyStore.push(imageStore.getSnapshot(t))

    // Re-render overlay if blur or magnify area
    if (obj.class === 'blur') {
      imageStore.blurOverlayNeedToBeRendered = true
    } else if (obj.class === 'magnifyArea') {
      imageStore.magnifyOverlayNeedToBeRendered = true
    }
  }

  /**
   * Move the selected SVG object forward by one
   * @param {Function} t - Translation function for localized strings
   * @param {string} type - The type of object ('svg', 'blur', 'magnify') to determine which list to operate on
   */
  const moveSelectedObjectForward = (t, type) => {
    if (imageStore.selectedSvgObjectId === null) return

    let list
    let index

    if (type === 'blur') {
      list = imageStore.blurObjects
      index = imageStore.getIndexOfSelectedBlurObject()
    } else if (type === 'magnify') {
      list = imageStore.magnifyObjects
      index = imageStore.getIndexOfSelectedMagnifyObject()
    } else {
      list = imageStore.svgObjects
      index = imageStore.getIndexOfSelectedSvgObject()
    }

    if (!list || index === -1) return
    if (index + 1 >= list.length) return

    const obj = list.splice(index, 1)[0]
    list.splice(index + 1, 0, obj)

    historyStore.push(imageStore.getSnapshot(t))

    // Re-render overlay if blur or magnify area
    if (obj.class === 'blur') {
      imageStore.blurOverlayNeedToBeRendered = true
    } else if (obj.class === 'magnifyArea') {
      imageStore.magnifyOverlayNeedToBeRendered = true
    }
  }

  /**
   * Move the selected SVG object backward by one
   * @param {Function} t - Translation function for localized strings
   * @param {string} type - The type of object ('svg', 'blur', 'magnify') to determine which list to operate on
   */
  const moveSelectedObjectBackward = (t, type) => {
    if (imageStore.selectedSvgObjectId === null) return

    let list
    let index

    if (type === 'blur') {
      list = imageStore.blurObjects
      index = imageStore.getIndexOfSelectedBlurObject()
    } else if (type === 'magnify') {
      list = imageStore.magnifyObjects
      index = imageStore.getIndexOfSelectedMagnifyObject()
    } else {
      list = imageStore.svgObjects
      index = imageStore.getIndexOfSelectedSvgObject()
    }

    if (!list || index === -1) return
    if (index === 0) return // already at back

    const obj = list.splice(index, 1)[0]
    list.splice(index - 1, 0, obj)

    historyStore.push(imageStore.getSnapshot(t))

    // Re-render overlay if blur or magnify area
    if (obj.class === 'blur') {
      imageStore.blurOverlayNeedToBeRendered = true
    } else if (obj.class === 'magnifyArea') {
      imageStore.magnifyOverlayNeedToBeRendered = true
    }
  }

  /**
   * Send the selected SVG object to back
   * @param {Function} t - Translation function for localized strings
   * @param {string} type - The type of object ('svg', 'blur', 'magnify') to determine which list to operate on
   */
  const sendSelectedObjectToBack = (t, type) => {
    if (imageStore.selectedSvgObjectId === null) return

    let list
    let index

    if (type === 'blur') {
      list = imageStore.blurObjects
      index = imageStore.getIndexOfSelectedBlurObject()
    } else if (type === 'magnify') {
      list = imageStore.magnifyObjects
      index = imageStore.getIndexOfSelectedMagnifyObject()
    } else {
      list = imageStore.svgObjects
      index = imageStore.getIndexOfSelectedSvgObject()
    }

    if (!list || index === -1) return
    if (index === 0) return // already at back

    const obj = list.splice(index, 1)[0]
    list.unshift(obj)

    historyStore.push(imageStore.getSnapshot(t))

    // Re-render overlay if blur or magnify area
    if (obj.class === 'blur') {
      imageStore.blurOverlayNeedToBeRendered = true
    } else if (obj.class === 'magnifyArea') {
      imageStore.magnifyOverlayNeedToBeRendered = true
    }
  }

  /**
   * Compute display info for current SVG object (position and size)
   */
  const selectedObjectInfo = computed(() => {
    const selectedId = imageStore.selectedSvgObjectId
    if (selectedId === null) return null

    const object = imageStore.getSvgObjectById(selectedId)
    if (!object || !object.attrs) return null

    const { tag, attrs, textBBox } = object

    const transform = attrs.transform || ''
    const match = transform.match(/rotate\((-?\d+\.?\d*),\s*([-\d.]+),\s*([-\d.]+)\)/)
    const angle = match ? parseFloat(match[1]) : 0

    if (tag === 'rect') {
      return {
        width: round(Number(attrs.width) || 0),
        height: round(Number(attrs.height) || 0),
        angle,
      }
    } else if (tag === 'ellipse') {
      return {
        width: round((Number(attrs.rx) || 0) * 2),
        height: round((Number(attrs.ry) || 0) * 2),
        angle,
      }
    } else if (tag === 'line') {
      return {
        width: round((Number(attrs.x2) || 0) - (Number(attrs.x1) || 0)),
        height: round((Number(attrs.y2) || 0) - (Number(attrs.y1) || 0)),
        angle,
      }
    } else if (tag === 'text' && textBBox) {
      return {
        width: round(textBBox.width),
        height: round(textBBox.height),
        angle,
      }
    }

    return { angle }
  })

  /**
   * Select all SVG objects
   */
  const selectAllSvgObjects = () => {
    const allObjects = [
      ...(imageStore.svgObjects || []),
      ...(imageStore.blurObjects || []),
      ...(imageStore.magnifyObjects || []),
    ]

    imageStore.selectedSvgObjectIds = allObjects.map((obj) => obj.id)

    imageStore.selectedSvgObjectId = null
  }

  /**
   * Deselect all SVG objects
   */
  const deselectAllSvgObjects = () => {
    imageStore.selectedSvgObjectIds = []
    log('13')
    imageStore.selectedSvgObjectId = null
  }

  /**
   * Watch for changes in the selected SVG object IDs
   * If length is 1 select this object as single selection
   */
  watch(
    () => imageStore.selectedSvgObjectIds.length,
    (newLen) => {
      if (newLen === 1) {
        imageStore.selectedSvgObjectId = imageStore.selectedSvgObjectIds[0]
      }
    },
  )

  /**
   * Watch for changes in the selected SVG object ID
   * If a new ID is selected, update the editor tool accordingly
   */
  watch(
    () => imageStore.selectedSvgObjectId,
    (newId) => {
      if (newId !== null) {
        if (editorStore.selectedToolKey !== 'select') return

        const selectedObject = imageStore.getSvgObjectById(newId)
        if (selectedObject) {
          const tool = selectedObject.class
          let tab = null

          if (tool === 'shape') {
            tab = selectedObject.tag
            if (tab === 'rect') tab = 'rectangle'
          }

          editorStore.previousToolKey = editorStore.selectedToolKey

          toggleTool(tool, tab, false, false)
        }
      } else {
        if (editorStore.previousToolKey === 'select' && editorStore.selectedToolKey !== 'select') {
          toggleTool('select', null, false, false)
        }
      }
    },
  )

  /**
   * Handle click on the SVG area to select objects or add text
   * @param {MouseEvent} event - Click event
   */
  const onClickImageSvg = async (event) => {
    log('click svg')
    if (event.button !== 0) return // Only left mouse button

    // --------------------------------------
    // Selecting objects
    // --------------------------------------
    if (
      editorStore.selectedToolKey === 'select' ||
      (editorStore.previousToolKey === 'select' && event.shiftKey)
    ) {
      // Check if clicked on SVG object with data-id
      const elWithId = event.target.closest('[data-id]')
      const clickedId = elWithId ? Number(elWithId.getAttribute('data-id')) : null

      if (clickedId !== null) {
        if (isMovingMultipleObjects.value) {
          return
        }

        const clickedObject = imageStore.getSvgObjectById(clickedId)
        if (clickedObject) {
          if (event.shiftKey) {
            // Toggle object in multi-select
            const index = imageStore.selectedSvgObjectIds.indexOf(clickedId)

            if (index !== -1) {
              imageStore.selectedSvgObjectIds.splice(index, 1)
            } else {
              imageStore.selectedSvgObjectIds.push(clickedId)
            }

            // If it is first object in multi selection select it also as single object
            if (imageStore.selectedSvgObjectIds.length === 1) {
              imageStore.selectedSvgObjectId = imageStore.selectedSvgObjectIds[0]
            } else {
              log('5')
              imageStore.selectedSvgObjectId = null
            }
          } else {
            // Single object selection (without shift) if in select tool
            if (editorStore.selectedToolKey === 'select') {
              imageStore.selectedSvgObjectId = clickedId
              imageStore.selectedSvgObjectIds = [clickedId]
            }
          }

          return
        }
      }

      // Clicked on empty area – deselect all
      if (!event.shiftKey) {
        imageStore.selectedSvgObjectIds = []
      }
    }

    // -------------------------------------
    // Adding new objects
    // -------------------------------------
    // Add text object
    if (editorStore.selectedToolKey === 'text') {
      const elWithId = event.target.closest('[data-id]')
      const selectedId = elWithId ? Number(elWithId.getAttribute('data-id')) : null

      // Deselect on click outside of magnify area if one is selected
      if (imageStore.selectedSvgObjectId !== null) {
        if (selectedId) {
          return
        } else {
          log('7')
          imageStore.selectedSvgObjectId = null
          return
        }
      }

      const rect = event.currentTarget.getBoundingClientRect()
      const x = round((event.clientX - rect.left) / viewportStore.realZoomLevel)
      const y = round((event.clientY - rect.top) / viewportStore.realZoomLevel)

      textTool.addTextObject(x, y)
    }

    // Add magnify area
    if (editorStore.selectedToolKey === 'magnifyArea') {
      const elWithId = event.target.closest('[data-id]')
      const selectedId = elWithId ? Number(elWithId.getAttribute('data-id')) : null

      // Deselect on click outside of magnify area if one is selected
      if (imageStore.selectedSvgObjectId !== null) {
        if (selectedId) {
          return
        } else {
          imageStore.selectedSvgObjectId = null
          return
        }
      }

      const rect = event.currentTarget.getBoundingClientRect()
      const x = round((event.clientX - rect.left) / viewportStore.realZoomLevel)
      const y = round((event.clientY - rect.top) / viewportStore.realZoomLevel)

      await magnifyAreaTool.addMagnifyArea(x, y)
      log('selected object id after add: ', imageStore.selectedSvgObjectId)
    }
  }

  /**
   * Mouse down event handler for selecting SVG objects area
   * @param {MouseEvent} event
   */
  const onMouseDownSelect = (event) => {
    if (event.button !== 0) return // Only left mouse button
    log('mousedown select area')

    // Selecting objects
    if (editorStore.selectedToolKey === 'select') {
      log('mousedown select')
      if (isMovingMultipleObjects.value) {
        return
      }

      const contentElement = document.getElementById('viewport-content')
      if (!contentElement) return
      const rect = contentElement.getBoundingClientRect()

      const x = round((event.clientX - rect.left) / viewportStore.realZoomLevel)
      const y = round((event.clientY - rect.top) / viewportStore.realZoomLevel)

      drawingStart.value = { x, y }
      selectBox.value = { x, y, width: 0, height: 0 }
      isDrawing.value = true
      return
    } else {
      // Deselect all when clicking outside content
      onWrapperClickDeselect(event)
    }
  }

  /**
   * Whether multiple objects are being moved
   */
  const isMovingMultipleObjects = ref(false)

  /**
   * Mouse down event handler for the SVG image (creating new objects)
   * @param {MouseEvent} event
   */
  const onMouseDownImageSvg = async (event) => {
    if (event.button !== 0) return // Only left mouse button
    log('mousedown svg')

    // Multi object move (start)
    if (editorStore.selectedToolKey === 'select' && imageStore.selectedSvgObjectIds.length > 1) {
      const elWithId = event.target.closest('[data-id]')
      const clickedId = elWithId ? Number(elWithId.getAttribute('data-id')) : null

      if (clickedId !== null && imageStore.selectedSvgObjectIds.includes(clickedId)) {
        isMovingMultipleObjects.value = true
        startX.value = event.clientX
        startY.value = event.clientY
        return
      }
    }

    // Return to select tool when clicking on SVG with another tool selected
    if (editorStore.previousToolKey === 'select') {
      toggleTool('select', null, false, false)
      return
    }

    // Drawing objects
    if (!['blur', 'shape'].includes(editorStore.selectedToolKey)) return

    const objectClass = editorStore.selectedToolKey
    let objectType = editorStore.selectedTabPerTool[objectClass]

    if (objectClass === 'blur') {
      objectType = 'rect'
    }

    if (objectType === 'rectangle') objectType = 'rect'

    const contentElement = document.getElementById('viewport-content')
    if (!contentElement) return
    const rect = contentElement.getBoundingClientRect()

    const x = round((event.clientX - rect.left) / viewportStore.realZoomLevel)
    const y = round((event.clientY - rect.top) / viewportStore.realZoomLevel)

    const id = Date.now()
    const base = {
      id,
      class: objectClass,
      tag: objectType,
      attrs: {},
    }

    let objectName = ''
    let objectFillColor = 'none'
    let objectStrokeColor = 'none'
    let objectStrokeWidth = 0
    let objectOpacity = 1
    let objectCornerRadius = 0
    let objectLineType = 'solid'
    let objectBlurStrength
    let objectEdgeFade
    let lineEnd

    if (objectClass === 'shape') {
      const {
        success,
        fillEnabled,
        fillColor,
        strokeWidth,
        strokeColor,
        opacity,
        cornerRadius,
        lineType,
        lineArrowEnd,
        name,
      } = await shapeTool.getShapeAttributes()

      if (!success) {
        // If failed to get attributes, stop drawing
        isDrawing.value = false
        return
      }

      objectName = name

      if (fillEnabled) {
        objectFillColor = fillColor
      }
      objectStrokeWidth = strokeWidth
      objectStrokeColor = strokeColor
      objectOpacity = opacity
      objectCornerRadius = cornerRadius
      objectLineType = lineType
      if (objectType === 'line') {
        lineEnd = lineArrowEnd
      }
    } else if (objectClass === 'blur') {
      const { success, blurStrength, name, edgeFade } = await blurTool.getBlurAttributes()

      if (!success) {
        // If failed to get attributes, stop drawing
        isDrawing.value = false
        return
      }

      objectName = name

      objectBlurStrength = blurStrength

      objectEdgeFade = edgeFade

      objectFillColor = '#00000000'
    }

    if (objectType === 'rect') {
      base.attrs = { x, y, width: 1, height: 1 }
      base.attrs.fill = objectFillColor

      if (objectStrokeWidth > 0) {
        base.attrs['stroke-width'] = objectStrokeWidth
        base.attrs.stroke = objectStrokeColor
      }

      base.attrs.opacity = objectOpacity

      // Set blur strength
      if (objectClass === 'blur') {
        base.attrs['data-blur-strength'] = objectBlurStrength
        base.attrs['data-edge-fade'] = objectEdgeFade
      }

      // Corner radius
      if (objectCornerRadius > 0) {
        base.attrs.rx = objectCornerRadius
      }
    } else if (objectType === 'ellipse') {
      base.attrs = { cx: x, cy: y, rx: 1, ry: 1 }
      base.attrs.fill = objectFillColor
      if (objectStrokeWidth > 0) {
        base.attrs['stroke-width'] = objectStrokeWidth
        base.attrs.stroke = objectStrokeColor
      }
      base.attrs.opacity = objectOpacity
    } else if (objectType === 'line') {
      base.attrs = { x1: x, y1: y, x2: x, y2: y }
      base.attrs['stroke-width'] = objectStrokeWidth
      base.attrs.stroke = objectStrokeColor
      base.attrs.opacity = objectOpacity
      base.attrs['stroke-dasharray'] = objectLineType

      if (lineEnd) {
        base.attrs['marker-end'] = lineEnd
      }
    }

    // Set object name
    base.name = objectName

    currentDrawingObject.value = base

    drawingStart.value = { x, y }
    isDrawing.value = true

    if (objectClass === 'blur') {
      imageStore.blurObjects.push(base)
      imageStore.blurOverlayNeedToBeRendered = true
    } else if (objectClass === 'magnifyArea') {
      imageStore.magnifyObjects.push(base)
      imageStore.magnifyOverlayNeedToBeRendered = true
    } else {
      imageStore.svgObjects.push(base)
    }
  }

  /**
   * Start values for multi object move
   */
  const startX = ref(0)
  const startY = ref(0)

  /**
   * Values for smooth multi object move
   */
  const remainingDx = ref(0)
  const remainingDy = ref(0)

  onMounted(() => {
    window.addEventListener('mousemove', onMouseMoveImageSvg)
  })
  onBeforeUnmount(() => {
    window.removeEventListener('mousemove', onMouseMoveImageSvg)
  })

  ////////////////////////////////////////////////////////////////////////////////

  /**
   * Auto-pan when mouse is outside of viewport
   */
  const autoPanActive = ref(false)
  let autoPanFrame = null
  let lastMouseEvent = null

  /**
   * Start auto-pan
   */
  const startAutoPan = () => {
    if (autoPanFrame) return
    const loop = () => {
      if (autoPanActive.value && (isDrawing.value || isMovingMultipleObjects.value)) {
        performAutoPan(lastMouseEvent)
        autoPanFrame = requestAnimationFrame(loop)
      } else {
        autoPanFrame = null
      }
    }
    autoPanFrame = requestAnimationFrame(loop)
  }

  /**
   * Stop auto-pan
   */
  const stopAutoPan = () => {
    autoPanActive.value = false
    if (autoPanFrame) {
      cancelAnimationFrame(autoPanFrame)
      autoPanFrame = null
    }
  }

  /**
   * Auto-pan the viewport when mouse is outside
   *
   * @param {MouseEvent} event
   */
  const performAutoPan = (event) => {
    if (!event) return
    const viewportWrapper = document.getElementsByClassName('viewport-content-wrapper')

    const contentElement = document.getElementById('viewport-content')
    if (!contentElement) return

    if (viewportWrapper.length === 0) return

    const rectWrapper = viewportWrapper[0].getBoundingClientRect()
    const rect = contentElement.getBoundingClientRect()

    const horizontalMargin = imageStore.fileDimensions.width * viewportStore.realZoomLevel * 0.1
    const verticalMargin = imageStore.fileDimensions.height * viewportStore.realZoomLevel * 0.1

    // Move viewport if mouse is outside
    if (event.clientY > rectWrapper.bottom && rect.bottom + verticalMargin > rectWrapper.bottom) {
      viewportStore.panY -= 1 * viewportStore.realZoomLevel
    }
    if (event.clientY < rectWrapper.top && rect.top - verticalMargin < rectWrapper.top) {
      viewportStore.panY += 1 * viewportStore.realZoomLevel
    }
    if (event.clientX > rectWrapper.right && rect.right + horizontalMargin > rectWrapper.right) {
      viewportStore.panX -= 1 * viewportStore.realZoomLevel
    }
    if (event.clientX < rectWrapper.left && rect.left - horizontalMargin < rectWrapper.left) {
      viewportStore.panX += 1 * viewportStore.realZoomLevel
    }
  }

  /////////////////////////////////////////////////////////////////////////////////

  /**
   * Drawing object
   * @param {MouseEvent} event
   */
  const onMouseMoveImageSvg = (event) => {
    if (!isDrawing.value && !isMovingMultipleObjects.value) return

    // Move viewport when mouse is outside of content
    const viewportWrapper = document.getElementsByClassName('viewport-content-wrapper')

    if (viewportWrapper.length === 0) return
    const rectWrapper = viewportWrapper[0].getBoundingClientRect()

    if (
      event.clientX < rectWrapper.left ||
      event.clientX > rectWrapper.right ||
      event.clientY < rectWrapper.top ||
      event.clientY > rectWrapper.bottom
    ) {
      autoPanActive.value = true
      lastMouseEvent = event
      startAutoPan()
    } else {
      autoPanActive.value = false
    }
    // --------

    // Selecting objects
    if (isDrawing.value && editorStore.selectedToolKey === 'select' && selectBox.value) {
      const contentElement = document.getElementById('viewport-content')
      if (!contentElement) return
      const rect = contentElement.getBoundingClientRect()

      const x = round((event.clientX - rect.left) / viewportStore.realZoomLevel)
      const y = round((event.clientY - rect.top) / viewportStore.realZoomLevel)

      const x1 = Math.min(drawingStart.value.x, x)
      const y1 = Math.min(drawingStart.value.y, y)
      const x2 = Math.max(drawingStart.value.x, x)
      const y2 = Math.max(drawingStart.value.y, y)

      selectBox.value = {
        x: x1,
        y: y1,
        width: x2 - x1,
        height: y2 - y1,
      }

      return
    }

    // Moving multiple objects
    if (isMovingMultipleObjects.value) {
      // Calculate deltas
      let rawDx = (event.clientX - startX.value) / viewportStore.realZoomLevel + remainingDx.value
      let rawDy = (event.clientY - startY.value) / viewportStore.realZoomLevel + remainingDy.value

      // Round to whole pixels
      const dx = Math.round(rawDx)
      const dy = Math.round(rawDy)

      // Store remaining deltas for smooth movement
      remainingDx.value = rawDx - dx
      remainingDy.value = rawDy - dy

      let containBlurObject = false
      let containMagnifyAreaObject = false

      // Move all selected objects
      imageStore.selectedSvgObjectIds.forEach((id) => {
        const object = imageStore.getSvgObjectById(id)
        const { tag, attrs } = object

        if (object.class === 'blur') {
          containBlurObject = true
        }

        if (object.class === 'magnifyArea') {
          containMagnifyAreaObject = true
        }

        let offsetX = dx
        let offsetY = dy

        // Apply updated offset
        if ('x' in attrs && 'y' in attrs) {
          attrs.x += offsetX
          attrs.y += offsetY

          if (tag === 'text') {
            object.textBBox.x += offsetX
            object.textBBox.y += offsetY
          }
        } else if ('cx' in attrs && 'cy' in attrs) {
          attrs.cx += offsetX
          attrs.cy += offsetY
        } else if ('x1' in attrs && 'y1' in attrs && 'x2' in attrs && 'y2' in attrs) {
          attrs.x1 += offsetX
          attrs.y1 += offsetY
          attrs.x2 += offsetX
          attrs.y2 += offsetY
        }

        /**
         * Update the rotation transform of the SVG object
         * This is called after dragging to ensure the rotation is centered correctly
         */
        const match = attrs.transform?.match(/rotate\((-?\d+\.?\d*),?([^)]*)\)/)
        if (!match) return
        const currentAngle = parseFloat(match[1])
        const { cx, cy } = getObjectCenter(object)
        attrs.transform = `rotate(${currentAngle}, ${cx}, ${cy})`
      })

      startX.value = event.clientX
      startY.value = event.clientY

      if (containBlurObject) {
        imageStore.blurOverlayNeedToBeRendered = true
      }

      if (containMagnifyAreaObject) {
        imageStore.magnifyOverlayNeedToBeRendered = true
      }

      return
    }

    // Drawing objects
    if (!isDrawing.value || !currentDrawingObject.value) return

    const isCtrlKey = event.ctrlKey || event.metaKey
    const isShiftKey = event.shiftKey

    const onlyOneKeyPressed = isCtrlKey !== isShiftKey

    if (!isCtrlKey) {
      viewportStore.guideLines = null
    }

    const contentElement = document.getElementById('viewport-content')
    if (!contentElement) return
    const rect = contentElement.getBoundingClientRect()

    let x = (event.clientX - rect.left) / viewportStore.realZoomLevel
    let y = (event.clientY - rect.top) / viewportStore.realZoomLevel

    let dx = x - drawingStart.value.x
    let dy = y - drawingStart.value.y

    const objectType = currentDrawingObject.value.tag
    const attrs = currentDrawingObject.value.attrs

    // Apply SHIFT for aspect ratio
    if (isShiftKey && onlyOneKeyPressed && objectType !== 'line') {
      const maxDelta = Math.max(Math.abs(dx), Math.abs(dy))
      dx = dx < 0 ? -maxDelta : maxDelta
      dy = dy < 0 ? -maxDelta : maxDelta
      x = drawingStart.value.x + dx
      y = drawingStart.value.y + dy
    }

    // Apply CTRL snap
    if (isCtrlKey && onlyOneKeyPressed) {
      let x1 = drawingStart.value.x
      let y1 = drawingStart.value.y
      let x2 = x
      let y2 = y

      if (objectType !== 'line') {
        x1 = Math.min(drawingStart.value.x, x)
        x2 = Math.max(drawingStart.value.x, x)
        y1 = Math.min(drawingStart.value.y, y)
        y2 = Math.max(drawingStart.value.y, y)
      }

      const threshold =
        imageStore.getSmallerImageDimension() * editorConfig.snapEdgeThresholdCoefficient

      const snap = getSnapOffsetToEdges(currentDrawingObject.value, x1, x2, y1, y2, [])

      x += snap.dx
      y += snap.dy

      // If drawing a line, snap to horizontal or vertical
      let snappedToVertical = false
      let snappedToHorizontal = false

      // If drawing a line, snap to horizontal or vertical
      if (objectType === 'line') {
        if (Math.abs(x - drawingStart.value.x) <= threshold) {
          x = drawingStart.value.x
          snappedToVertical = true
        }
        if (Math.abs(y - drawingStart.value.y) <= threshold) {
          y = drawingStart.value.y
          snappedToHorizontal = true
        }
      }

      // Recalculate deltas (to adjust width and height)
      dx = x - drawingStart.value.x
      dy = y - drawingStart.value.y

      // Show guideline if snapped
      const lines = []

      // Vertical or horizontal alignment for line
      if (snappedToVertical) {
        lines.push({
          x: x,
          y: (drawingStart.value.y + y) / 2,
          angle: 90,
        })
      }

      if (snappedToHorizontal) {
        lines.push({
          x: (drawingStart.value.x + x) / 2,
          y: y,
          angle: 0,
        })
      }

      if (snap.snappedEdgeX) {
        lines.push({
          x: snap.snappedEdgeX === 'left' ? x1 + snap.dx : x2 + snap.dx,
          y: (y1 + y2) / 2 + snap.dy,
          angle: 90,
        })
      }

      if (snap.snappedEdgeY) {
        lines.push({
          x: (x1 + x2) / 2 + snap.dx,
          y: snap.snappedEdgeY === 'top' ? y1 + snap.dy : y2 + snap.dy,
          angle: 0,
        })
      }

      viewportStore.guideLines = lines.length ? lines : null
    } else {
      viewportStore.guideLines = null
    }

    if (objectType === 'rect') {
      attrs.x = round(Math.min(x, drawingStart.value.x))
      attrs.y = round(Math.min(y, drawingStart.value.y))
      attrs.width = round(Math.abs(dx))
      attrs.height = round(Math.abs(dy))
    } else if (objectType === 'ellipse') {
      attrs.cx = round((x + drawingStart.value.x) / 2)
      attrs.cy = round((y + drawingStart.value.y) / 2)
      attrs.rx = round(Math.abs(dx) / 2)
      attrs.ry = round(Math.abs(dy) / 2)
    } else if (objectType === 'line') {
      attrs.x2 = round(x)
      attrs.y2 = round(y)
    }

    // Check if it is not too small object
    if (!objectSizeIsSmall(currentDrawingObject.value)) {
      imageStore.selectedSvgObjectId = currentDrawingObject.value.id

      // If blur object set need flag
      if (editorStore.selectedToolKey === 'blur') {
        imageStore.blurOverlayNeedToBeRendered = true
      }
    } else {
      log('5')

      imageStore.selectedSvgObjectId = null
    }
  }

  /**
   * Finalize drawing the SVG object
   * @param {MouseEvent} event
   */
  const onMouseUpImageSvg = (event) => {
    // Stop auto-pan
    stopAutoPan()

    // End multi object move
    if (isMovingMultipleObjects.value) {
      isMovingMultipleObjects.value = false

      // Add snapshot to history
      historyStore.push(imageStore.getSnapshot(t))

      return
    }

    // Selecting objects
    if (editorStore.selectedToolKey === 'select' && selectBox.value) {
      const { x, y, width, height } = selectBox.value
      const x1 = x
      const y1 = y
      const x2 = x + width
      const y2 = y + height

      let selectedIds = imageStore.selectedSvgObjectIds

      // Reset selection if not holding SHIFT
      if (!event.shiftKey) {
        selectedIds = []
      }

      const allObjects = [
        ...(imageStore.svgObjects || []),
        ...(imageStore.blurObjects || []),
        ...(imageStore.magnifyObjects || []),
      ]

      for (const object of allObjects) {
        const { cx, cy } = getObjectCenter(object)

        const isInside = cx >= x1 && cx <= x2 && cy >= y1 && cy <= y2

        if (isInside) {
          selectedIds.push(object.id)
        }
      }

      imageStore.selectedSvgObjectIds = selectedIds
      if (selectedIds.length === 1) {
        imageStore.selectedSvgObjectId = selectedIds[0]
      } else {
        log('4')
        imageStore.selectedSvgObjectId = null
      }

      selectBox.value = null
      isDrawing.value = false
      return
    }

    // Drawing objects
    // If it has zero width or height, remove it
    if (!currentDrawingObject.value) return

    // Check if it is not too small object
    if (objectSizeIsSmall(currentDrawingObject.value)) {
      isDrawing.value = false
      currentDrawingObject.value = null
      viewportStore.guideLines = null

      // Remove the last object if object is too small
      if (editorStore.selectedToolKey === 'blur') {
        imageStore.blurObjects.pop()
      } else if (editorStore.selectedToolKey === 'magnifyArea') {
        imageStore.magnifyObjects.pop()
      } else {
        imageStore.svgObjects.pop()
      }

      imageStore.selectedSvgObjectId = null

      return
    }

    // If blur object set need flag
    if (editorStore.selectedToolKey === 'blur') {
      imageStore.blurOverlayNeedToBeRendered = true
    }

    if (isDrawing.value && currentDrawingObject.value) {
      historyStore.push(imageStore.getSnapshot(t))
    }

    imageStore.selectedSvgObjectId = currentDrawingObject.value.id
    imageStore.justCreatedSvgObjectId = currentDrawingObject.value.id

    // Reset drawing state
    nextTick(() => {
      requestAnimationFrame(() => {
        imageStore.justCreatedSvgObjectId = null
      })
    })

    isDrawing.value = false
    currentDrawingObject.value = null
    viewportStore.guideLines = null

    nextTick(() => {
      editorStore.isSvgObjectDrawing = false
    })
  }

  /**
   * Check if the object is smaller than the minimum size
   * @param {Object} object - SVG object to check
   * @returns {boolean} - True if the object is too small, false otherwise
   */
  const objectSizeIsSmall = (object) => {
    const attrs = object.attrs

    const MIN_SIZE = editorConfig.minimumObjectSize

    let lineLength = null
    if ('x1' in attrs && 'y1' in attrs && 'x2' in attrs && 'y2' in attrs) {
      lineLength = distance(attrs.x1 ?? 0, attrs.y1 ?? 0, attrs.x2 ?? 0, attrs.y2 ?? 0)
    }

    const tooSmallRect =
      attrs.width !== undefined &&
      attrs.height !== undefined &&
      (attrs.width <= MIN_SIZE || attrs.height <= MIN_SIZE)

    const tooSmallEllipse =
      attrs.rx !== undefined &&
      attrs.ry !== undefined &&
      (attrs.rx <= MIN_SIZE || attrs.ry <= MIN_SIZE)

    const tooSmallLine = lineLength !== null && lineLength <= MIN_SIZE
    return tooSmallRect || tooSmallEllipse || tooSmallLine
  }

  /**
   * Global click handler to deselect the SVG object
   * Only triggers if the click was inside the viewport content
   * @param {MouseEvent} e - Mouse event
   */
  const onGlobalDoubleClick = (e) => {
    if (imageStore.justCreatedSvgObjectId === imageStore.selectedSvgObjectId) return

    const viewportContent = document.getElementById('viewport')
    if (!viewportContent) return

    const clickedInside = viewportContent.contains(e.target)
    if (!clickedInside) return

    log('global double click')

    const clickedObjectId = Number(e.target.getAttribute('data-id'))
    const clickedObject = imageStore.getSvgObjectById(clickedObjectId)

    const selectedObject = imageStore.getSvgObjectById(imageStore.selectedSvgObjectId)

    // Deselect if clicked outside the selected object or on a different class
    const sameClass =
      clickedObject && selectedObject && clickedObject.class === selectedObject.class

    // Deselect objects
    if (!sameClass) {
      log('2')
      imageStore.selectedSvgObjectId = null
      imageStore.selectedSvgObjectIds = []
    }
  }

  /**
   * Deselect on single click inside wrapper but outside content
   * @param {MouseEvent} event
   */
  const onWrapperClickDeselect = (event) => {
    const viewport = document.getElementById('viewport')
    const content = document.getElementById('viewport-content')
    if (!viewport || !content) return

    const clickedInsideViewport = viewport.contains(event.target)
    const clickedInsideContent = content.contains(event.target)

    // Deselect if clicked inside viewport but outside content
    if (clickedInsideViewport && !clickedInsideContent) {
      log('Deselect triggered')
      imageStore.selectedSvgObjectId = null
      imageStore.selectedSvgObjectIds = []
    }
  }

  onMounted(() => {
    window.addEventListener('mouseup', onMouseUpImageSvg)
    if (!editorStore.isGlobalClickRegistered) {
      window.addEventListener('dblclick', onGlobalDoubleClick)

      editorStore.isGlobalClickRegistered = true
    }
  })

  onBeforeUnmount(() => {
    window.removeEventListener('mouseup', onMouseUpImageSvg)
    window.removeEventListener('dblclick', onGlobalDoubleClick)
  })

  return {
    moveObjectLeftLocal,
    moveObjectRightLocal,
    moveObjectUpLocal,
    moveObjectDownLocal,
    moveObjectLeftGlobal,
    moveObjectRightGlobal,
    moveObjectUpGlobal,
    moveObjectDownGlobal,
    deleteSelectedSvgObjects,
    moveSelectedObjectForward,
    moveSelectedObjectBackward,
    sendSelectedObjectToBack,
    bringSelectedObjectToFront,
    selectedObjectInfo,
    onClickImageSvg,
    onMouseDownImageSvg,
    onMouseDownSelect,
    onMouseMoveImageSvg,
    isDrawing,
    selectBox,
    selectAllSvgObjects,
    deselectAllSvgObjects,
    copySelectedSvgObject,
    pasteSvgObjectToCenter,
    duplicateSelectedSvgObject,
    cutSelectedSvgObject,
  }
}
