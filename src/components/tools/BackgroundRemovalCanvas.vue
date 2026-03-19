<script setup>
/**
 * @file: BackgroundRemovalCanvas.vue
 * @author: Pavol Humeny
 * @date: 15.5.2026
 * @description: Canvas component for manual background removal. Handles drawing on the canvas, pointer events, and communicates with the background removal tool logic. Uses a web worker to process the canvas data without blocking the UI.
 */
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useBackgroundRemovalTool } from '@/composables/tools/useBackgroundRemovalTool'
import { useImageStore } from '@/stores/imageStore'
import { useHistoryStore } from '@/stores/historyStore'
import { useWorkspaceStore } from '@/stores/workspaceStore'
import { useI18n } from 'vue-i18n'
import { useViewportStore } from '@/stores/viewportStore'
import { useEditorStore } from '@/stores/editorStore'
// import { useToastModal } from '@/composables/modals/useToastModal'
import { useUiStore } from '@/stores/uiStore'
import { viewportConfig } from '@/config/viewportConfig.js'

const { t } = useI18n()

const imageStore = useImageStore()
const viewportStore = useViewportStore()
const editorStore = useEditorStore()
const historyStore = useHistoryStore()
const uiStore = useUiStore()

const {
  manualSelectedTool,
  autoSelectSimilarRegion,
  someAreaIsSelected,
} = useBackgroundRemovalTool(
  useImageStore(),
  useHistoryStore(),
  useWorkspaceStore(),
  useEditorStore(),
  useUiStore(),
  t,
)

// const { showToastModal } = useToastModal()

/**
 * Reference to the manual canvas element
 */
const manualCanvasRef = ref(null)

/**
 * Drawing state
 */
const isDrawing = ref(false)

/**
 * Last pointer position during drawing
 */
const lastPos = ref({ x: 0, y: 0 })

/**
 * Image dimensions
 */
const imageWidth = computed(() => imageStore.fileDimensions.width)
const imageHeight = computed(() => imageStore.fileDimensions.height)

/**
 * Context for the manual canvas
 */
let ctx = null

/**
 * Whether the eraser is being used during drawing (when Alt is held)
 */
const isErasingDuringDraw = ref(false)

/**
 * Cursor position and visibility
 */
const cursorPos = ref({ x: 0, y: 0 })
const showCursor = ref(false)

/**
 * Update canvas size when image size changes
 */
watch([imageWidth, imageHeight], () => {
  if (manualCanvasRef.value) {
    manualCanvasRef.value.width = imageWidth.value
    manualCanvasRef.value.height = imageHeight.value
    ctx = manualCanvasRef.value.getContext('2d', { willReadFrequently: true })
    ctx.clearRect(0, 0, imageWidth.value, imageHeight.value)
  }
})

/**
 * Draw a line on the manual canvas from 'from' to 'to'
 * @param from Start point {x, y}
 * @param to End point {x, y}
 * @param tool Tool to use ('brush' | 'eraser')
 */
const drawLine = (from, to, tool) => {
  if (!ctx) return

  const size = Math.max(
    1,
    Math.round(editorStore.toolsConfig.backgroundRemoval.brushSize)
  )

  const erase = tool === 'eraser'

  ctx.globalCompositeOperation = erase ? 'destination-out' : 'source-over'
  ctx.strokeStyle = erase
    ? '#000'
    : editorStore.toolsConfig.backgroundRemoval.removalHighlightColor

  ctx.lineWidth = size
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  ctx.beginPath()
  ctx.moveTo(from.x, from.y)
  ctx.lineTo(to.x, to.y)
  ctx.stroke()

  if (!erase) {
    someAreaIsSelected.value = true
  }
}

/**
 * Get pointer position (mouse/touch) relative to the canvas.
 * @param {MouseEvent|TouchEvent} event
 */
const getMousePos = (event) => {
  const rect = manualCanvasRef.value.getBoundingClientRect()
  const point =
    event.touches?.[0] ??
    event.changedTouches?.[0] ??
    event

  if (point?.clientX == null || point?.clientY == null) {
    return { x: 0, y: 0 }
  }

  const x = (point.clientX - rect.left) / viewportStore.realZoomLevel
  const y = (point.clientY - rect.top) / viewportStore.realZoomLevel
  return { x, y }
}

/**
 * Pointer down - start drawing or select area
 * @param {MouseEvent|TouchEvent} event
 */
const onMouseDown = (event) => {
  if (editorStore.selectedToolKey !== 'backgroundRemoval') return
  const isTouchEvent = event.type?.startsWith('touch')
  if (!isTouchEvent && event.button !== 0) return
  if (isTouchEvent && event.touches && event.touches.length > 1) return

  const viewport = document.getElementById('viewport-content')
  if (!viewport.contains(event.target)) return

  const mode = editorStore.selectedTabPerTool['backgroundRemoval']
  const pos = getMousePos(event)

  if (mode === 'manual') {
    isDrawing.value = true
    lastPos.value = pos

    ctx.beginPath()
    ctx.moveTo(pos.x, pos.y)

    let tool = manualSelectedTool.value
    if (manualSelectedTool.value === 'brush' && event.altKey) {
      tool = 'eraser'
    }

    drawLine(pos, pos, tool)
  } else if (mode === 'auto') {
    autoSelectSimilarRegion(pos.x, pos.y, event.shiftKey, event.altKey)
  }
}

/**
 * Pointer move - update cursor position and draw if drawing
 * @param {MouseEvent|TouchEvent} event
 */
const onMouseMove = (event) => {
  if (editorStore.selectedToolKey !== 'backgroundRemoval' || editorStore.selectedTabPerTool['backgroundRemoval'] !== 'manual') return
  if (event.type?.startsWith('touch') && event.cancelable) event.preventDefault()

  cursorPos.value = getMousePos(event)
  showCursor.value = true

  // Drawing
  if (!isDrawing.value) return
  const currentPos = getMousePos(event)

  let tool = manualSelectedTool.value
  isErasingDuringDraw.value = false
  if (manualSelectedTool.value === 'brush' && !!event.altKey) {
    // If Alt is held, use eraser regardless of selected tool
    tool = 'eraser'
    isErasingDuringDraw.value = true
  }

  drawLine(lastPos.value, currentPos, tool)
  lastPos.value = currentPos
}

/**
 * Global mouse up listener to stop drawing when mouse is released
 */
let canvasWorker = null

const onMouseUpGlobal = () => {
  if (
    editorStore.selectedToolKey !== 'backgroundRemoval' ||
    editorStore.selectedTabPerTool['backgroundRemoval'] !== 'manual'
  )
    return

  if (!isDrawing.value) return
  isDrawing.value = false
  isErasingDuringDraw.value = false

  const manualCanvas = manualCanvasRef.value
  if (!manualCanvas) return

  const ctx = manualCanvas.getContext('2d')
  const width = manualCanvas.width
  const height = manualCanvas.height

  // Create worker if not exists
  if (!canvasWorker) {
    canvasWorker = new Worker(new URL('@/composables/worker/canvasWorker.js', import.meta.url))
  }

  // Main thread
  const imageData = ctx.getImageData(0, 0, width, height);

  // Copy the buffer BEFORE transfer to worker
  const bufferCopy = new Uint8ClampedArray(imageData.data);

  canvasWorker.postMessage(
    {
      width,
      height,
      imageDataBuffer: bufferCopy.buffer, // pass copy
    },
    [bufferCopy.buffer] // transfer ownership
  );

  canvasWorker.onmessage = (event) => {
    const savedImageData = event.data.imageData

    // Save to store
    imageStore.removalCanvasOriginal = savedImageData
    imageStore.removalCanvas = savedImageData

    // Push snapshot to history
    historyStore.push(imageStore.getSnapshot(t))
  }
}

/**
 * Global mouse up listener to stop drawing when mouse is released outside the canvas
 */
onMounted(() => {
  ctx = manualCanvasRef.value.getContext('2d', { willReadFrequently: true })
  ctx.imageSmoothingEnabled = false
  // manualCanvasRef.value.style.imageRendering = 'pixelated'

  const mode = uiStore.viewportPixelateMode
  const zoom = viewportStore.zoomLevel

  if (mode === 'always') {
    manualCanvasRef.value.style.imageRendering = 'pixelated'
  } else if (mode === 'never') {
    manualCanvasRef.value.style.imageRendering = 'auto'
  } else if (mode === 'auto') {
    manualCanvasRef.value.style.imageRendering =
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

/**
  * Watch for changes in pixelate mode or zoom level and update image rendering style
  */
watch(
  [() => uiStore.viewportPixelateMode, () => viewportStore.zoomLevel],
  ([mode, zoom]) => {

    if (!manualCanvasRef.value) return

    if (mode === 'always') {
      manualCanvasRef.value.style.imageRendering = 'pixelated'
    } else if (mode === 'never') {
      manualCanvasRef.value.style.imageRendering = 'auto'
    } else if (mode === 'auto') {
      manualCanvasRef.value.style.imageRendering =
        zoom > viewportConfig.pixelateAutoZoomThreshold ? 'pixelated' : 'auto'
    }
  },
  { immediate: true },
)


/**
 * Watch for changes in the stored manual canvas and update the displayed canvas accordingly
 */
watch(
  () => imageStore.removalCanvas,
  async () => {
    await nextTick()

    const manualCanvas = manualCanvasRef.value
    if (!manualCanvas) return

    manualCanvas.width = imageWidth.value
    manualCanvas.height = imageHeight.value
    ctx = manualCanvas.getContext('2d', { willReadFrequently: true })

    // Use the stored manual canvas if it exists
    if (imageStore.removalCanvas) {
      ctx.putImageData(imageStore.removalCanvas, 0, 0)
    }
  },
  { immediate: true }
)

/**
 * Cleanup
 */
onBeforeUnmount(() => {
  window.removeEventListener('mouseup', onMouseUpGlobal)
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('mousedown', onMouseDown)
  window.removeEventListener('touchstart', onMouseDown)
  window.removeEventListener('touchmove', onMouseMove)
  window.removeEventListener('touchend', onMouseUpGlobal)
  window.removeEventListener('touchcancel', onMouseUpGlobal)
})
</script>

<template>
  <div class="manual-removal-wrapper">
    <canvas id="removalCanvas" ref="manualCanvasRef" class="manual-removal-canvas" :width="imageWidth"
      :height="imageHeight"></canvas>
  </div>
</template>

<style scoped>
.manual-removal-wrapper {
  position: relative;
}

.manual-removal-canvas {
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: auto;
  touch-action: none;
  opacity: 0.5;
}
</style>
