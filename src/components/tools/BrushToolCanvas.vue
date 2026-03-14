<script setup>
/**
 * @file: BrushToolCanvas.vue
 * @author: Pavol Humeny
 * @date: 15.5.2026
 */
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useImageStore } from '@/stores/imageStore'
import { useHistoryStore } from '@/stores/historyStore'
import { useViewportStore } from '@/stores/viewportStore'
import { useI18n } from 'vue-i18n'
import { useEditorStore } from '@/stores/editorStore'
import { useUiStore } from '@/stores/uiStore'
import { viewportConfig } from '@/config/viewportConfig.js'
import { useImagePipeline } from '@/composables/editor/useImagePipeline'
import { editorConfig } from '@/config/editorConfig'
import { useConfirmModal } from '@/composables/modals/useConfirmModal'
import { useApi } from '@/composables/common/useApi'

const { addUserEvent } = useApi()
const { t } = useI18n()
const imageStore = useImageStore()
const historyStore = useHistoryStore()
const viewportStore = useViewportStore()
const editorStore = useEditorStore()
const uiStore = useUiStore()
const { renderUpTo } = useImagePipeline(imageStore, uiStore)
const { showConfirmModal } = useConfirmModal()

/**
 * Reference to the canvas
 */
const canvasRef = ref(null)

/**
 * Image dimensions
 */
const imageWidth = computed(() => imageStore.fileDimensions.width)
const imageHeight = computed(() => imageStore.fileDimensions.height)

/**
 * Drawing state
 */
const isDrawing = ref(false)
const lastPos = ref({ x: 0, y: 0 })
const mouseMovedSinceDown = ref(false)

/**
 * Commit timer
 */
let commitTimer = null

/**
 * Pending overlay snapshot for commit
 */
let pendingOverlaySnapshot = null


/**
 * Canvas context
 */
let ctx = null

/**
 * Get pointer position (mouse/touch) relative to canvas.
 * @param {MouseEvent|TouchEvent} event
 */
const getMousePos = (event) => {
  const rect = canvasRef.value.getBoundingClientRect()
  const point =
    event.touches?.[0] ??
    event.changedTouches?.[0] ??
    event

  if (point?.clientX == null || point?.clientY == null) {
    return { x: 0, y: 0 }
  }

  return {
    x: (point.clientX - rect.left) / viewportStore.realZoomLevel,
    y: (point.clientY - rect.top) / viewportStore.realZoomLevel,
  }
}

/**
 * Convert HEX color to RGB string
 * @param {string} hex - HEX color string, e.g. "#d30f0f"
 * @return {string} - RGB color string, e.g. "rgb(211,15,15)"
 */
const hexToRgb = (hex) => {
  if (!hex) return 'rgb(0,0,0)' // fallback to black
  const bigint = parseInt(hex.replace('#', ''), 16)
  const r = (bigint >> 16) & 255
  const g = (bigint >> 8) & 255
  const b = bigint & 255
  return `rgb(${r},${g},${b})`
}

/**
 * Draw line with brush tool
 * @param {Object} from - Starting position {x, y}
 * @param {Object} to - Ending position {x, y}
 * @param {string} tool - Tool type ('brush' or 'eraser')
 */
const drawBrushLine = (from, to, tool) => {
  if (!ctx) return

  ctx.save()
  ctx.imageSmoothingEnabled = true
  ctx.lineWidth = editorStore.toolsConfig.brush.brushSize
  ctx.lineCap = 'round'
  ctx.globalCompositeOperation = tool === 'eraser' ? 'destination-out' : 'source-over'
  ctx.strokeStyle = tool === 'eraser' ? '#000' : hexToRgb(editorStore.toolsConfig.brush.color)

  ctx.beginPath()
  ctx.moveTo(Math.round(from.x), Math.round(from.y))
  ctx.lineTo(Math.round(to.x), Math.round(to.y))
  ctx.stroke()
  ctx.closePath()
  ctx.restore()
}

/**
 * Draw dot with brush tool
 * @param {Object} pos - Position {x, y}
 * @param {string} tool - Tool type ('brush' or 'eraser')
 */
const drawBrushDot = (pos, tool) => {
  if (!ctx) return

  ctx.save()
  ctx.imageSmoothingEnabled = true
  ctx.globalCompositeOperation = tool === 'eraser' ? 'destination-out' : 'source-over'
  ctx.fillStyle = tool === 'eraser' ? '#000' : hexToRgb(editorStore.toolsConfig.brush.color)

  ctx.beginPath()
  ctx.arc(
    Math.round(pos.x),
    Math.round(pos.y),
    editorStore.toolsConfig.brush.brushSize / 2,
    0,
    Math.PI * 2,
  )
  ctx.fill()
  ctx.restore()
}

/**
 * Draw dot with pencil tool
 * @param {Object} pos - Position {x, y}
 * @param {string} tool - Tool type ('pencil' or 'eraser')
 */
const drawPencilDot = (pos, tool) => {
  if (!ctx) return

  const size = Math.max(1, Math.round(editorStore.toolsConfig.brush.brushSize))
  const radius = size / 2

  const cx = Math.floor(pos.x)
  const cy = Math.floor(pos.y)

  ctx.save()
  ctx.imageSmoothingEnabled = false
  ctx.globalCompositeOperation = tool === 'eraser' ? 'destination-out' : 'source-over'
  ctx.fillStyle = tool === 'eraser'
    ? '#000'
    : hexToRgb(editorStore.toolsConfig.brush.color)

  // 1px size
  if (size === 1) {
    ctx.fillRect(cx, cy, 1, 1)
    ctx.restore()
    return
  }

  const r2 = (radius - 0.5) * (radius - 0.5)
  const limit = Math.floor(radius)

  for (let y = -limit; y <= limit; y++) {
    for (let x = -limit; x <= limit; x++) {

      // Use center of pixel for more accurate circle
      const dx = x + 0.5
      const dy = y + 0.5

      if (dx * dx + dy * dy <= r2) {
        ctx.fillRect(cx + x, cy + y, 1, 1)
      }
    }
  }

  ctx.restore()
}


/**
 * Draw stamp for pencil tool
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {number} size - Size of the stamp
 */
const drawPencilStamp = (x, y, size) => {
  const radius = size / 2
  const cx = Math.floor(x)
  const cy = Math.floor(y)

  // 1px size
  if (size === 1) {
    ctx.fillRect(cx, cy, 1, 1)
    return
  }

  const r2 = (radius - 0.5) * (radius - 0.5)

  for (let py = -Math.floor(radius); py <= Math.floor(radius); py++) {
    for (let px = -Math.floor(radius); px <= Math.floor(radius); px++) {

      // Use center of pixel for more accurate circle
      const dx = px + 0.5
      const dy = py + 0.5

      if (dx * dx + dy * dy <= r2) {
        ctx.fillRect(cx + px, cy + py, 1, 1)
      }
    }
  }
}

/**
 * Draw line with pencil tool using Bresenham's algorithm
 * @param {Object} from - Starting position {x, y}
 * @param {Object} to - Ending position {x, y}
 * @param {string} tool - Tool type ('pencil' or 'eraser')
 */
const drawPencilLine = (from, to, tool) => {
  if (!ctx) return

  let x0 = Math.floor(from.x)
  let y0 = Math.floor(from.y)
  let x1 = Math.floor(to.x)
  let y1 = Math.floor(to.y)

  const dx = Math.abs(x1 - x0)
  const dy = Math.abs(y1 - y0)
  const sx = x0 < x1 ? 1 : -1
  const sy = y0 < y1 ? 1 : -1
  let err = dx - dy

  const size = Math.max(1, Math.round(editorStore.toolsConfig.brush.brushSize))

  ctx.save()
  ctx.globalCompositeOperation = tool === 'eraser' ? 'destination-out' : 'source-over'
  ctx.fillStyle = tool === 'eraser' ? '#000' : hexToRgb(editorStore.toolsConfig.brush.color)

  while (true) {
    drawPencilStamp(x0, y0, size)

    if (x0 === x1 && y0 === y1) break

    const e2 = 2 * err
    if (e2 > -dy) { err -= dy; x0 += sx }
    if (e2 < dx) { err += dx; y0 += sy }
  }

  ctx.restore()
}

/**
 * Draw line with eraser tool
 * @param {Object} from - Starting position {x, y}
 * @param {Object} to - Ending position {x, y}
 */
const drawEraserLine = (from, to, mode) => {
  if (mode === 'pencil') {
    drawPencilLine(from, to, 'eraser')
  } else {
    drawBrushLine(from, to, 'eraser')
  }

  ctx.restore()
}

/**
 * Draw dot with eraser tool
 * @param {Object} pos - Position {x, y}
 */
const drawEraserDot = (pos, mode) => {
  if (mode === 'pencil') {
    drawPencilDot(pos, 'eraser')
  } else {
    drawBrushDot(pos, 'eraser')
  }

  ctx.restore()
}

/**
 * Draw line based on tool type
 * @param {Object} from - Starting position {x, y}
 * @param {Object} to - Ending position {x, y}
 * @param {string} tool - Tool type ('brush', 'pencil', 'eraser-brush', 'eraser-pencil')
 */
const drawLine = (from, to, tool) => {
  switch (tool) {
    case 'brush':
      drawBrushLine(from, to, tool)
      break
    case 'pencil':
      drawPencilLine(from, to, tool)
      break
    case 'eraser-brush':
      drawEraserLine(from, to, 'brush')
      break
    case 'eraser-pencil':
      drawEraserLine(from, to, 'pencil')
      break
  }
}

/**
 * Draw dot based on tool type
 * @param {Object} pos - Position {x, y}
 * @param {string} tool - Tool type ('brush', 'pencil', 'eraser-brush', 'eraser-pencil')
 */
const drawDot = (pos, tool) => {
  switch (tool) {
    case 'brush':
      drawBrushDot(pos, tool)
      break
    case 'pencil':
      drawPencilDot(pos, tool)
      break
    case 'eraser-brush':
      drawEraserDot(pos, 'brush')
      break
    case 'eraser-pencil':
      drawEraserDot(pos, 'pencil')
      break
  }
}

/**
 * Handle mouse down event to start drawing
 * @param {MouseEvent|TouchEvent} event - Pointer event
 */
const onMouseDown = async (event) => {
  if (editorStore.isModalOpenFlag) return

  if (editorStore.selectedToolKey !== 'brush') return

  const isTouchEvent = event.type?.startsWith('touch')
  if (!isTouchEvent && event.button !== 0) return
  if (isTouchEvent && event.touches && event.touches.length > 1) return

  const viewport = document.getElementById('viewport-content')
  if (!viewport.contains(event.target)) return

  let confirmNeeded = false

  if (imageStore.needRasterization) {
    confirmNeeded = true
    const confirmed = await showConfirmModal(
      t('tools.confirmNeedRasterization.title'),
      t('tools.confirmNeedRasterization.message'),
      t('tools.confirmNeedRasterization.cancel'),
      t('tools.confirmNeedRasterization.confirm'),
    )
    if (confirmed) {
      const result = await imageStore.rasterize('editor', {}, t)

      imageStore.addImageOperation({
        type: 'rasterize',
        params: {
          overlay: result.overlay,
        },
        cost: 'high',
        affectsGeometry: true,
      })

      addUserEvent('applyOperation', {
        tool: 'rasterize',
        settings: {},
      })

      await renderUpTo(imageStore.renderPipeline.currentOpIndex + 1, { t, imageStore })

      // Push to undo history
      historyStore.push(imageStore.getSnapshot(t))
    }
  }

  if (imageStore.fileType === 'pdf') {
    confirmNeeded = true
    const confirmed = await showConfirmModal(
      t('tools.confirmNeedBaseImageRasterization.title'),
      t('tools.confirmNeedBaseImageRasterization.message'),
      t('tools.confirmNeedBaseImageRasterization.cancel'),
      t('tools.confirmNeedBaseImageRasterization.confirm'),
    )
    if (!confirmed) return

    imageStore.addImageOperation({
      type: 'rasterizePdf',
      params: {},
      cost: 'high',
      affectsGeometry: false,
    })

    addUserEvent('applyOperation', {
      tool: 'rasterizePdf',
      settings: {},
    })

    await renderUpTo(imageStore.renderPipeline.currentOpIndex + 1, { t, imageStore })

    historyStore.push(imageStore.getSnapshot(t))
  }

  if (confirmNeeded) {
    return
  }

  isDrawing.value = true
  lastPos.value = getMousePos(event)
  mouseMovedSinceDown.value = false

  // Draw a dot on mouse down
  let tool = editorStore.selectedTabPerTool[editorStore.selectedToolKey]

  // Check if it is eraser mode
  if (editorStore.toolsConfig.brush.isEraserMode) {
    if (tool === 'brush') tool = 'eraser-brush'
    else if (tool === 'pencil') tool = 'eraser-pencil'
  }

  drawDot(lastPos.value, tool)

  addUserEvent('applyOperation', {
    tool: 'brush',
    settings: {},
  })
}

/**
 * Handle mouse move event for drawing
 * @param {MouseEvent|TouchEvent} event - Pointer event
 */
const onMouseMove = (event) => {
  if (!isDrawing.value || editorStore.selectedToolKey !== 'brush') return
  if (event.type?.startsWith('touch') && event.cancelable) event.preventDefault()
  mouseMovedSinceDown.value = true

  const currentPos = getMousePos(event)

  // Check if alt key is pressed for eraser when using brush tool
  const isAltKeyPressed = !!(event.altKey || event.metaKey)
  let tool = editorStore.selectedTabPerTool[editorStore.selectedToolKey]

  // Check if it is eraser mode
  if (editorStore.toolsConfig.brush.isEraserMode) {
    if (tool === 'brush') tool = 'eraser-brush'
    else if (tool === 'pencil') tool = 'eraser-pencil'
  } else {
    if (isAltKeyPressed) {
      if (tool === 'brush') tool = 'eraser-brush'
      else if (tool === 'pencil') tool = 'eraser-pencil'
    }
  }

  drawLine(lastPos.value, currentPos, tool)
  lastPos.value = currentPos
}

/**
 * Handle global mouse up event to stop drawing
 */
const onMouseUpGlobal = async () => {
  if (!isDrawing.value || editorStore.selectedToolKey !== 'brush') return
  isDrawing.value = false

  if (!canvasRef.value) return

  // Clear commit timer
  if (commitTimer) {
    clearTimeout(commitTimer)
    commitTimer = null
  }

  // CLONE overlay canvas
  const overlaySnapshot = document.createElement('canvas')
  overlaySnapshot.width = canvasRef.value.width
  overlaySnapshot.height = canvasRef.value.height
  overlaySnapshot.getContext('2d').drawImage(canvasRef.value, 0, 0)

  // Add last overlay snapshot to pending
  pendingOverlaySnapshot = overlaySnapshot

  // Commit brush operation
  commitTimer = setTimeout(commitBrushOperation, editorConfig.brushCommitDelay)

  mouseMovedSinceDown.value = false
}

/**
 * Commit brush operation to image store
 */
const commitBrushOperation = async () => {
  if (!pendingOverlaySnapshot) return

  imageStore.addImageOperation({
    type: 'brush',
    overlay: pendingOverlaySnapshot,
    cost: 'low',
    affectsGeometry: false,
  })

  pendingOverlaySnapshot = null
  commitTimer = null

  await renderUpTo(imageStore.renderPipeline.currentOpIndex + 1, { t, imageStore })

  historyStore.push(imageStore.getSnapshot(t))
}

/**
  * Watch for changes in pixelate mode or zoom level and update image rendering style
  */
watch(
  [() => uiStore.viewportPixelateMode, () => viewportStore.zoomLevel],
  ([mode, zoom]) => {

    if (!canvasRef.value) return

    if (mode === 'always') {
      canvasRef.value.style.imageRendering = 'pixelated'
    } else if (mode === 'never') {
      canvasRef.value.style.imageRendering = 'auto'
    } else if (mode === 'auto') {
      canvasRef.value.style.imageRendering =
        zoom > viewportConfig.pixelateAutoZoomThreshold ? 'pixelated' : 'auto'
    }
  },
  { immediate: true },
)


/**
 * Init + cleanup
 */
onMounted(() => {
  ctx = canvasRef.value.getContext('2d', { willReadFrequently: true })
  // ctx.imageSmoothingEnabled = false
  // canvasRef.value.style.imageRendering = 'pixelated'

  const mode = uiStore.viewportPixelateMode
  const zoom = viewportStore.zoomLevel

  if (mode === 'always') {
    canvasRef.value.style.imageRendering = 'pixelated'
  } else if (mode === 'never') {
    canvasRef.value.style.imageRendering = 'auto'
  } else if (mode === 'auto') {
    canvasRef.value.style.imageRendering =
      zoom > viewportConfig.pixelateAutoZoomThreshold ? 'pixelated' : 'auto'
  }

  window.addEventListener('mouseup', onMouseUpGlobal)
  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('mousedown', onMouseDown)
  window.addEventListener('touchstart', onMouseDown, { passive: false })
  window.addEventListener('touchmove', onMouseMove, { passive: false })
  window.addEventListener('touchend', onMouseUpGlobal)
  window.addEventListener('touchcancel', onMouseUpGlobal)
})

onBeforeUnmount(async () => {
  window.removeEventListener('mouseup', onMouseUpGlobal)
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('mousedown', onMouseDown)
  window.removeEventListener('touchstart', onMouseDown)
  window.removeEventListener('touchmove', onMouseMove)
  window.removeEventListener('touchend', onMouseUpGlobal)
  window.removeEventListener('touchcancel', onMouseUpGlobal)
  await commitBrushOperation()
})
</script>

<template>
  <div class="brush-canvas-wrapper">
    <canvas id="brushCanvas" ref="canvasRef" class="brush-canvas" :width="imageWidth" :height="imageHeight"></canvas>
  </div>
</template>

<style scoped>
.brush-canvas-wrapper {
  position: relative;
}

.brush-canvas {
  position: absolute;
  top: 0;
  left: 0;
  cursor: none;
  touch-action: none;
}
</style>
