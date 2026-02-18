<script setup>
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
 * Last mouse position during drawing
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
 * Draw a filled circle of given size at (cx, cy) on the manual canvas
 * @param cx Center x coordinate
 * @param cy Center y coordinate
 * @param size Diameter of the circle
 * @param erase Whether to erase (true) or draw highlight (false)
 */
const drawPixelCircle = (cx, cy, size, erase = false) => {
  const radius = size / 2

  ctx.globalCompositeOperation = erase ? 'destination-out' : 'source-over'
  ctx.fillStyle = erase
    ? '#000'
    : editorStore.toolsConfig.backgroundRemoval.removalHighlightColor

  // 1px size
  if (size === 1) {
    ctx.fillRect(cx, cy, 1, 1)
    return
  }

  const r2 = (radius - 0.5) * (radius - 0.5)
  const limit = Math.floor(radius)

  for (let y = -limit; y <= limit; y++) {
    for (let x = -limit; x <= limit; x++) {

      // Use center of pixel for smoother circles
      const dx = x + 0.5
      const dy = y + 0.5

      if (dx * dx + dy * dy <= r2) {
        ctx.fillRect(cx + x, cy + y, 1, 1)
      }
    }
  }
}

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

  let x0 = Math.floor(from.x)
  let y0 = Math.floor(from.y)
  let x1 = Math.floor(to.x)
  let y1 = Math.floor(to.y)

  const dx = Math.abs(x1 - x0)
  const dy = Math.abs(y1 - y0)
  const sx = x0 < x1 ? 1 : -1
  const sy = y0 < y1 ? 1 : -1
  let err = dx - dy

  const erase = tool === 'eraser'

  if (!erase) {
    someAreaIsSelected.value = true
  }

  while (true) {
    drawPixelCircle(x0, y0, size, erase)

    if (x0 === x1 && y0 === y1) break

    const e2 = 2 * err
    if (e2 > -dy) { err -= dy; x0 += sx }
    if (e2 < dx) { err += dx; y0 += sy }
  }
}

/**
 * Get mouse position relative to the canvas
 * @param event Mouse event
 */
const getMousePos = (event) => {
  const rect = manualCanvasRef.value.getBoundingClientRect()
  const x = (event.clientX - rect.left) / viewportStore.realZoomLevel
  const y = (event.clientY - rect.top) / viewportStore.realZoomLevel
  return { x, y }
}

/**
 * Mouse down - start drawing or select area
 * @param event Mouse event
 */
const onMouseDown = (event) => {
  if (editorStore.selectedToolKey !== 'backgroundRemoval') return

  if (event.button !== 0) return // only left mouse
  const viewport = document.getElementById('viewport-content')
  if (!viewport.contains(event.target)) return

  if (editorStore.selectedToolKey === 'backgroundRemoval') {
    const mode = editorStore.selectedTabPerTool['backgroundRemoval']
    const pos = getMousePos(event)

    if (mode === 'manual') {
      // Manual drawing
      isDrawing.value = true
      lastPos.value = pos

      let tool = manualSelectedTool.value
      if (manualSelectedTool.value === 'brush' && event.altKey) {
        tool = 'eraser'
      }

      drawLine(pos, pos, tool)
    } else if (mode === 'auto') {
      autoSelectSimilarRegion(pos.x, pos.y, event.shiftKey, event.altKey)
    }
  }
}

/**
 * Mouse move - update cursor position and draw if drawing
 * @param event Mouse event
 */
const onMouseMove = (event) => {
  if (editorStore.selectedToolKey !== 'backgroundRemoval' || editorStore.selectedTabPerTool['backgroundRemoval'] !== 'manual') return

  cursorPos.value = getMousePos(event)
  showCursor.value = true

  // Drawing
  if (!isDrawing.value) return
  const currentPos = getMousePos(event)

  let tool = manualSelectedTool.value
  isErasingDuringDraw.value = false
  if (manualSelectedTool.value === 'brush' && event.altKey) {
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
  opacity: 0.5;
}
</style>
