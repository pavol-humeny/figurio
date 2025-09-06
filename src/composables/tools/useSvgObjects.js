import { computed, ref, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
import { useTextTool } from './useTextTool'
import { useShapeTool } from './useShapeTool'
import { useMath } from '../common/useMath'
import { useSvgFunctions } from './useSvgFunctions'
import { editorConfig } from '@/config/editorConfig'
import { useBlurTool } from './useBlurTool'
import { useMagnifyAreaTool } from './useMagnifyAreaTool'
import { useToolsPanel } from './useToolsPanel'

export function useSvgObjects(imageStore, historyStore, viewportStore, editorStore, uiStore, t) {
  const { round, distance } = useMath()
  const textTool = useTextTool(imageStore, historyStore, editorStore, t)
  const shapeTool = useShapeTool(editorStore, imageStore, historyStore, t)
  const { getSnapOffsetToEdges } = useSvgFunctions(imageStore)
  const blurTool = useBlurTool(imageStore, historyStore, editorStore, t)
  const magnifyAreaTool = useMagnifyAreaTool(imageStore, historyStore, editorStore, t)
  const { toggleTool } = useToolsPanel(editorStore, imageStore, uiStore, t)

  /**
   * Selection box rectangle (used when dragging with select tool)
   */
  const selectBox = ref(null)

  /**
   * Whether any SVG object is currently being drawn
   */
  const isDrawing = ref(false)

  /**
   * Whether the user has dragged the mouse while drawing
   */
  const didDrag = ref(false)

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
    const selectedIds = imageStore.selectedSvgObjectIds

    if (imageStore.selectedSvgObjectId === null && selectedIds.length === 0) {
      return
    }

    const idsToDelete = new Set()
    const blurIdsToDelete = new Set()

    // One selected object
    if (selectedIds.length === 0) {
      const selected = imageStore.getSelectedSvgObject()
      if (!selected) return

      idsToDelete.add(selected.id)

      if (selected.class === 'magnifyArea') {
        if (selected.subClass === 'magnify-source') {
          idsToDelete.add(selected.linkedZoomId)
        } else if (selected.subClass === 'magnify-result') {
          idsToDelete.add(selected.linkedSourceId)
        }
      }

      // If blur also delete filter, clip and image
      if (selected.class === 'blur') {
        imageStore.deleteBlurClipById(selected.id)
        imageStore.deleteBlurFilterById(selected.id)
        imageStore.deleteBlurImageById(selected.id)

        blurIdsToDelete.add(selected.id)
      } else {
        idsToDelete.add(selected.id)
      }

      imageStore.selectedSvgObjectId = null
    }

    // Multiple selected objects
    else {
      for (const id of selectedIds) {
        const obj = imageStore.getSvgObjectById(id)

        if (obj && obj.class === 'magnifyArea') {
          if (obj.subClass === 'magnify-source') {
            idsToDelete.add(obj.linkedZoomId)
          } else if (obj.subClass === 'magnify-result') {
            idsToDelete.add(obj.linkedSourceId)
          }
        }

        if (obj.class === 'blur') {
          imageStore.deleteBlurClipById(obj.id)
          imageStore.deleteBlurFilterById(obj.id)
          imageStore.deleteBlurImageById(obj.id)

          blurIdsToDelete.add(obj.id)
        } else {
          idsToDelete.add(id)
        }
      }

      imageStore.selectedSvgObjectIds = []
    }

    // Delete objects from the store
    const indicesToDelete = [...idsToDelete]
      .map((id) => imageStore.getIndexOfSvgObjectById(id))
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

    historyStore.push(imageStore.getSnapshot(t))
  }

  /**
   * Copy the currently selected SVG object
   */
  const copySelectedSvgObject = () => {
    if (imageStore.selectedSvgObjectId === null || editorStore.selectedToolKey === 'magnifyArea')
      return

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
    if (newObject.class !== editorStore.selectedToolKey) return

    newObject.id = Date.now()

    const { width: imageWidth, height: imageHeight } = imageStore.fileDimensions
    const centerX = imageWidth / 2
    const centerY = imageHeight / 2

    const { attrs, tag } = newObject

    if (tag === 'rect') {
      attrs.x = centerX - attrs.width / 2
      attrs.y = centerY - attrs.height / 2
    } else if (tag === 'ellipse' && 'rx' in attrs && 'ry' in attrs) {
      attrs.cx = centerX
      attrs.cy = centerY
    } else if (tag === 'line' && 'x1' in attrs && 'x2' in attrs && 'y1' in attrs && 'y2' in attrs) {
      const dx = (attrs.x2 - attrs.x1) / 2
      const dy = (attrs.y2 - attrs.y1) / 2
      attrs.x1 = centerX - dx
      attrs.y1 = centerY - dy
      attrs.x2 = centerX + dx
      attrs.y2 = centerY + dy
    } else if (tag === 'text') {
      if (newObject.textBBox) {
        const { width, height } = newObject.textBBox
        attrs.x = centerX - width / 2
        attrs.y = centerY + height / 2
      } else {
        attrs.x = centerX
        attrs.y = centerY
      }
    }

    // Recalculate rotation
    if (attrs.transform) {
      const angleMatch = attrs.transform.match(/rotate\((-?\d+\.?\d*)/)

      if (angleMatch) {
        const angle = parseFloat(angleMatch[1])
        attrs.transform = `rotate(${angle}, ${centerX}, ${centerY})`
      }
    }

    // If it is blur add clip, filter and image
    if (newObject.class === 'blur') {
      blurTool.addOrReplaceClipDef(newObject.id, {
        x: attrs.x,
        y: attrs.y,
        width: attrs.width,
        height: attrs.height,
      })
      blurTool.addOrReplaceFilterDef(newObject.id, attrs['data-blur-strength'])
      blurTool.addBlurImage(newObject.id)
    }

    imageStore.svgObjects.push(newObject)
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
   */
  const bringSelectedSvgObjectToFront = (t, isBlurObject = false) => {
    if (imageStore.selectedSvgObjectId === null) return
    const i = isBlurObject
      ? imageStore.getIndexOfSelectedBlurObject()
      : imageStore.getIndexOfSelectedSvgObject()

    const object = imageStore.getSelectedSvgObject()
    if (i !== -1 && i < imageStore.svgObjects.length - 1) {
      if (object.class === 'magnifyArea') {
        const pair = imageStore.svgObjects.splice(i, 2)
        imageStore.svgObjects.push(...pair)
      } else if (object.class === 'blur') {
        const object = imageStore.blurObjects.splice(i, 1)[0]
        imageStore.blurObjects.push(object)
      } else {
        const object = imageStore.svgObjects.splice(i, 1)[0]
        imageStore.svgObjects.push(object)
      }

      historyStore.push(imageStore.getSnapshot(t))
    }
  }

  /**
   * Move the selected SVG object forward by one
   */
  const moveSelectedSvgObjectForward = (t, isBlurObject = false) => {
    if (imageStore.selectedSvgObjectId === null) return
    const i = isBlurObject
      ? imageStore.getIndexOfSelectedBlurObject()
      : imageStore.getIndexOfSelectedSvgObject()
    const object = imageStore.getSelectedSvgObject()
    if (i !== -1 && i < imageStore.svgObjects.length - 1) {
      const temp = isBlurObject ? imageStore.blurObjects[i] : imageStore.svgObjects[i]

      if (object.class === 'magnifyArea') {
        // Move magnify area object
        const result = imageStore.svgObjects[i + 1]
        imageStore.svgObjects[i] = imageStore.svgObjects[i + 2]
        imageStore.svgObjects[i + 1] = temp
        imageStore.svgObjects[i + 2] = result
      } else if (object.class === 'blur') {
        const result = imageStore.blurObjects[i + 1]
        imageStore.blurObjects[i] = imageStore.blurObjects[i + 2]
        imageStore.blurObjects[i + 1] = temp
        imageStore.blurObjects[i + 2] = result
      } else {
        // Move other object
        const nextObject = imageStore.svgObjects[i + 1]

        if (nextObject && nextObject.class === 'magnifyArea') {
          // Skip magnify area objects
          imageStore.svgObjects[i] = imageStore.svgObjects[i + 1]
          imageStore.svgObjects[i + 1] = imageStore.svgObjects[i + 2]
          imageStore.svgObjects[i + 2] = temp
        } else {
          imageStore.svgObjects[i] = imageStore.svgObjects[i + 1]
          imageStore.svgObjects[i + 1] = temp
        }
      }

      historyStore.push(imageStore.getSnapshot(t))
    }
  }

  /**
   * Move the selected SVG object backward by one
   */
  const moveSelectedSvgObjectBackward = (t, isBlurObject = false) => {
    if (imageStore.selectedSvgObjectId === null) return
    const i = isBlurObject
      ? imageStore.getIndexOfSelectedBlurObject()
      : imageStore.getIndexOfSelectedSvgObject()
    const object = imageStore.getSelectedSvgObject()
    if (i !== -1 && i > 0) {
      const temp = isBlurObject ? imageStore.blurObjects[i] : imageStore.svgObjects[i]

      if (object.class === 'magnifyArea') {
        // Move magnify area object
        const result = imageStore.svgObjects[i + 1]
        imageStore.svgObjects[i + 1] = imageStore.svgObjects[i - 1]
        imageStore.svgObjects[i - 1] = temp
        imageStore.svgObjects[i] = result
      } else if (object.class === 'blur') {
        const result = imageStore.blurObjects[i + 1]
        imageStore.blurObjects[i + 1] = imageStore.blurObjects[i - 1]
        imageStore.blurObjects[i - 1] = temp
        imageStore.blurObjects[i] = result
      } else {
        // Move other object
        const prevObject = imageStore.svgObjects[i - 1]

        if (prevObject && prevObject.class === 'magnifyArea') {
          // Skip magnify area objects
          imageStore.svgObjects[i] = imageStore.svgObjects[i - 1]
          imageStore.svgObjects[i - 1] = imageStore.svgObjects[i - 2]
          imageStore.svgObjects[i - 2] = temp
        } else {
          imageStore.svgObjects[i] = imageStore.svgObjects[i - 1]
          imageStore.svgObjects[i - 1] = temp
        }
      }

      historyStore.push(imageStore.getSnapshot(t))
    }
  }

  /**
   * Send the selected SVG object to back
   */
  const sendSelectedSvgObjectToBack = (t, isBlurObject = false) => {
    if (imageStore.selectedSvgObjectId === null) return
    const i = isBlurObject
      ? imageStore.getIndexOfSelectedBlurObject()
      : imageStore.getIndexOfSelectedSvgObject()
    const object = imageStore.getSelectedSvgObject()
    if (i !== -1 && i > 0) {
      if (object.class === 'magnifyArea') {
        const pair = imageStore.svgObjects.splice(i, 2)
        imageStore.svgObjects.unshift(...pair)
      } else if (object.class === 'blur') {
        const pair = imageStore.blurObjects.splice(i, 2)
        imageStore.blurObjects.unshift(...pair)
      } else {
        const object = imageStore.svgObjects.splice(i, 1)[0]
        imageStore.svgObjects.unshift(object)
      }

      historyStore.push(imageStore.getSnapshot(t))
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
    const allObjects = [...(imageStore.svgObjects || []), ...(imageStore.blurObjects || [])]
    imageStore.selectedSvgObjectIds = allObjects.map((obj) => obj.id)
    imageStore.selectedSvgObjectId = null
  }

  /**
   * Deselect all SVG objects
   */
  const deselectAllSvgObjects = () => {
    imageStore.selectedSvgObjectIds = []
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

          toggleTool(tool, tab)
        }
      } else {
        if (editorStore.previousToolKey === 'select' && editorStore.selectedToolKey !== 'select') {
          toggleTool('select', null)
          editorStore.previousToolKey = ''
        }
      }
    },
  )

  /**
   * Handle click on the SVG area to select objects or add text
   * @param {MouseEvent} event - Click event
   */
  const onClickImageSvg = (event) => {
    console.log('click svg')
    if (event.button !== 0) return // Only left mouse button

    if (didDrag.value) {
      // Prevent click after drag
      // Prevent selecting object after move
      return
    }

    // --------------------------------------
    // Selecting objects
    // --------------------------------------
    // Check if clicked on SVG object with data-id
    const elWithId = event.target.closest('[data-id]')
    const clickedId = elWithId ? Number(elWithId.getAttribute('data-id')) : null

    if (clickedId !== null) {
      if (isMovingMultipleObjects.value) {
        // HERE
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
    // -------------------------------------

    // Add text object
    if (editorStore.selectedToolKey === 'text' && imageStore.selectedSvgObjectId === null) {
      if (event.target.closest('g') || event.target.closest('text')) return

      const rect = event.currentTarget.getBoundingClientRect()
      const x = round((event.clientX - rect.left) / viewportStore.realZoomLevel)
      const y = round((event.clientY - rect.top) / viewportStore.realZoomLevel)

      textTool.addTextObject(x, y)
    }

    // Add magnify area
    if (editorStore.selectedToolKey === 'magnifyArea' && imageStore.selectedSvgObjectId === null) {
      const rect = event.currentTarget.getBoundingClientRect()
      const x = round((event.clientX - rect.left) / viewportStore.realZoomLevel)
      const y = round((event.clientY - rect.top) / viewportStore.realZoomLevel)

      magnifyAreaTool.addMagnifyArea(x, y)
    }
  }

  /**
   * Mouse down event handler for selecting SVG objects area
   * @param {MouseEvent} event
   */
  const onMouseDownSelect = (event) => {
    if (event.button !== 0) return // Only left mouse button

    // Selecting objects
    if (editorStore.selectedToolKey === 'select') {
      console.log('mousedown select')
      if (isMovingMultipleObjects.value) {
        return
      }

      const rect = viewportStore.viewportContentRect
      const x = round(
        (event.clientX - rect.left - viewportStore.panX) / viewportStore.realZoomLevel,
      )
      const y = round((event.clientY - rect.top - viewportStore.panY) / viewportStore.realZoomLevel)

      drawingStart.value = { x, y }
      selectBox.value = { x, y, width: 0, height: 0 }
      isDrawing.value = true
      return
    }
  }

  /**
   * Whether multiple objects are being moved
   */
  const isMovingMultipleObjects = ref(false)

  const savedClickedId = ref(null)

  /**
   * Mouse down event handler for the SVG image (creating new objects)
   * @param {MouseEvent} event
   */
  const onMouseDownImageSvg = (event) => {
    if (event.button !== 0) return // Only left mouse button
    console.log('mousedown svg')

    didDrag.value = false // Reset at start

    // Multi object move (start)
    if (editorStore.selectedToolKey === 'select' && imageStore.selectedSvgObjectIds.length > 1) {
      const elWithId = event.target.closest('[data-id]')
      const clickedId = elWithId ? Number(elWithId.getAttribute('data-id')) : null

      if (clickedId !== null && imageStore.selectedSvgObjectIds.includes(clickedId)) {
        isMovingMultipleObjects.value = true
        didDrag.value = false
        startX.value = event.clientX
        startY.value = event.clientY
        return
      }
    }

    // Drawing objects
    if (!['blur', 'shape'].includes(editorStore.selectedToolKey)) return

    // if (imageStore.selectedSvgObjectId !== null) return // Disable drawing objects when another is selected

    const objectClass = editorStore.selectedToolKey
    let objectType = editorStore.selectedTabPerTool[objectClass]

    if (objectClass === 'blur') {
      objectType = 'rect'
    }

    if (objectType === 'rectangle') objectType = 'rect'

    const rect = viewportStore.viewportContentRect
    const x = round((event.clientX - rect.left - viewportStore.panX) / viewportStore.realZoomLevel)
    const y = round((event.clientY - rect.top - viewportStore.panY) / viewportStore.realZoomLevel)

    console.log('event: ', event.clientX, event.clientY)
    console.log('content rect', rect)
    console.log('pan', viewportStore.panX, viewportStore.panY)
    console.log('zoom', viewportStore.realZoomLevel)
    console.log('start drawing x, y: ', x, y)

    drawingStart.value = { x, y }
    isDrawing.value = true

    const id = Date.now()
    const base = {
      id,
      class: objectClass,
      tag: objectType,
      attrs: {},
    }

    let objectFillColor = 'none'
    let objectStrokeColor = 'none'
    let objectStrokeWidth = 0
    let objectOpacity = 1
    let objectCornerRadius = 0
    let objectLineType = 'solid'
    let objectBlurStrength

    if (objectClass === 'shape') {
      const { fillEnabled, fillColor, strokeWidth, strokeColor, opacity, cornerRadius, lineType } =
        shapeTool.getShapeAttributes()

      if (fillEnabled) {
        objectFillColor = fillColor
      }
      objectStrokeWidth = strokeWidth
      objectStrokeColor = strokeColor
      objectOpacity = opacity
      objectCornerRadius = cornerRadius
      objectLineType = lineType
    } else if (objectClass === 'blur') {
      const { blurStrength } = blurTool.getBlurAttributes(id)

      objectBlurStrength = blurStrength

      objectFillColor = '#00000005'
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
    }

    currentDrawingObject.value = base

    if (objectClass === 'blur') {
      imageStore.blurObjects.push(base)
    } else {
      imageStore.svgObjects.push(base)
    }

    const elWithId = event.target.closest('[data-id]')
    savedClickedId.value = elWithId ? Number(elWithId.getAttribute('data-id')) : null
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

  /**
   * Drawing object
   * @param {MouseEvent} event
   */
  const onMouseMoveImageSvg = (event) => {
    // Selecting objects
    if (isDrawing.value && editorStore.selectedToolKey === 'select' && selectBox.value) {
      const rect = viewportStore.viewportContentRect
      const x = round(
        (event.clientX - rect.left - viewportStore.panX) / viewportStore.realZoomLevel,
      )
      const y = round((event.clientY - rect.top - viewportStore.panY) / viewportStore.realZoomLevel)

      const dx = Math.abs(x - drawingStart.value.x)
      const dy = Math.abs(y - drawingStart.value.y)
      if (dx > 3 || dy > 3) {
        didDrag.value = true
      }

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

    if (isMovingMultipleObjects.value) {
      // Mouse was moved
      didDrag.value = true

      // Calculate deltas
      let rawDx = (event.clientX - startX.value) / viewportStore.realZoomLevel + remainingDx.value
      let rawDy = (event.clientY - startY.value) / viewportStore.realZoomLevel + remainingDy.value

      // Round to whole pixels
      const dx = Math.round(rawDx)
      const dy = Math.round(rawDy)

      // Store remaining deltas for smooth movement
      remainingDx.value = rawDx - dx
      remainingDy.value = rawDy - dy

      // Move all selected objects
      imageStore.selectedSvgObjectIds.forEach((id) => {
        const object = imageStore.getSvgObjectById(id)
        const { tag, attrs } = object

        let offsetX = dx
        let offsetY = dy

        // Apply updated offset
        if ('x' in attrs && 'y' in attrs) {
          attrs.x += offsetX
          attrs.y += offsetY

          if (tag === 'text') {
            object.value.textBBox.x += offsetX
            object.value.textBBox.y += offsetY
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
      })

      startX.value = event.clientX
      startY.value = event.clientY

      return
    }

    // Drawing objects
    if (!isDrawing.value || !currentDrawingObject.value) return

    const isCtrlKey = event.ctrlKey || event.metaKey
    const isShiftKey = event.shiftKey

    const onlyOneKeyPressed = isCtrlKey !== isShiftKey

    if (!isCtrlKey) {
      viewportStore.guideLine = null
    }

    const rect = viewportStore.viewportContentRect
    let x = (event.clientX - rect.left - viewportStore.panX) / viewportStore.realZoomLevel
    let y = (event.clientY - rect.top - viewportStore.panY) / viewportStore.realZoomLevel

    let dx = x - drawingStart.value.x
    let dy = y - drawingStart.value.y

    const objectType = currentDrawingObject.value.tag
    const attrs = currentDrawingObject.value.attrs

    // Apply SHIFT for aspect ratio
    if (isShiftKey && onlyOneKeyPressed && objectType !== 'line') {
      // TODO drawing in axis-aligned mode
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

      const snap = getSnapOffsetToEdges(currentDrawingObject.value, x1, x2, y1, y2)

      x += snap.dx
      y += snap.dy

      // Recalculate deltas (to adjust width and height)
      dx = x - drawingStart.value.x
      dy = y - drawingStart.value.y

      // Show guideline if snapped
      if (snap.dx !== 0 || snap.dy !== 0) {
        let gx = null,
          gy = null,
          angle = null

        if (snap.snappedEdgeX) {
          gx = (snap.snappedEdgeX === 'left' ? x1 : x2) + snap.dx
          gy = (y1 + y2) / 2 + snap.dy
          angle = 90
        }
        if (snap.snappedEdgeY) {
          gy = (snap.snappedEdgeY === 'top' ? y1 : y2) + snap.dy
          gx = (x1 + x2) / 2 + snap.dx
          angle = 0
        }

        viewportStore.guideLine = { x: gx, y: gy, angle }
      } else {
        viewportStore.guideLine = null
      }
    } else {
      viewportStore.guideLine = null
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

    // If it is blur tool update clip path
    if (editorStore.selectedToolKey === 'blur') {
      blurTool.addOrReplaceClipDef(currentDrawingObject.value.id, {
        x: attrs.x,
        y: attrs.y,
        width: attrs.width,
        height: attrs.height,
        rotation: attrs.transform
          ? parseFloat(attrs.transform.match(/rotate\(([^)]+)\)/)?.[1]) || 0
          : 0,
      })
    }

    // Check if it is not too small object

    if (!checkSizeOfObject(currentDrawingObject.value)) {
      imageStore.selectedSvgObjectId = currentDrawingObject.value.id
    }
  }

  /**
   * Finalize drawing the SVG object
   * @param {MouseEvent} event
   */
  const onMouseUpImageSvg = (event) => {
    // End multi object move
    if (isMovingMultipleObjects.value) {
      isMovingMultipleObjects.value = false
      didDrag.value = true
      return
    }

    // Selecting objects
    if (editorStore.selectedToolKey === 'select' && selectBox.value) {
      const { x, y, width, height } = selectBox.value
      const x1 = x
      const y1 = y
      const x2 = x + width
      const y2 = y + height

      const { getObjectCenter } = useSvgFunctions(imageStore)

      let selectedIds = imageStore.selectedSvgObjectIds

      // Reset selection if not holding SHIFT
      if (!event.shiftKey) {
        selectedIds = []
      }

      const allObjects = [...(imageStore.svgObjects || []), ...(imageStore.blurObjects || [])]

      for (const obj of allObjects) {
        const { cx, cy } = getObjectCenter(obj)

        const isInside = cx >= x1 && cx <= x2 && cy >= y1 && cy <= y2

        if (isInside) {
          selectedIds.push(obj.id)
        }
      }

      imageStore.selectedSvgObjectIds = selectedIds
      if (selectedIds.length === 1) {
        imageStore.selectedSvgObjectId = selectedIds[0]
      } else {
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
    if (checkSizeOfObject(currentDrawingObject.value)) {
      isDrawing.value = false
      currentDrawingObject.value = null
      viewportStore.guideLine = null

      // Remove the last object if object is too small
      if (editorStore.selectedToolKey === 'blur') {
        // In blur also remove defs
        imageStore.svgDefs.pop()
        imageStore.svgDefs.pop()
        imageStore.blurImages.pop()

        imageStore.blurObjects.pop()
      } else {
        imageStore.svgObjects.pop()
      }

      // Select object below if there was one
      if (savedClickedId.value !== null) {
        imageStore.selectedSvgObjectId = savedClickedId.value
      }

      return
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
    viewportStore.guideLine = null

    nextTick(() => {
      editorStore.isSvgObjectDrawing = false
    })
  }

  /**
   * Check if the object is smaller than the minimum size
   * @param {Object} object - SVG object to check
   * @returns {boolean} - True if the object is too small, false otherwise
   */
  const checkSizeOfObject = (object) => {
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
  const onGlobalClick = (e) => {
    if (imageStore.justCreatedSvgObjectId === imageStore.selectedSvgObjectId) return

    const viewportContent = document.getElementById('viewport')
    if (!viewportContent) return

    const clickedInside = viewportContent.contains(e.target)
    if (!clickedInside) return

    console.log('global click')

    const clickedObjectId = Number(e.target.getAttribute('data-id'))
    const clickedObject = imageStore.getSvgObjectById(clickedObjectId)

    const selectedObject = imageStore.getSvgObjectById(imageStore.selectedSvgObjectId)

    // Deselect if clicked outside the selected object or on a different class
    const sameClass =
      clickedObject && selectedObject && clickedObject.class === selectedObject.class

    // Deselect objects
    if (!sameClass) {
      imageStore.selectedSvgObjectId = null
      imageStore.selectedSvgObjectIds = []
    }
  }

  onMounted(() => {
    window.addEventListener('mouseup', onMouseUpImageSvg)
    if (!editorStore.isGlobalClickRegistered) {
      window.addEventListener('dblclick', onGlobalClick)
      editorStore.isGlobalClickRegistered = true
    }
  })

  onBeforeUnmount(() => {
    window.removeEventListener('mouseup', onMouseUpImageSvg)
    window.removeEventListener('dblclick', onGlobalClick)
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
    moveSelectedSvgObjectForward,
    moveSelectedSvgObjectBackward,
    sendSelectedSvgObjectToBack,
    bringSelectedSvgObjectToFront,
    selectedObjectInfo,
    onClickImageSvg,
    onMouseDownImageSvg,
    onMouseDownSelect,
    // onMouseUpImageSvg,
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
