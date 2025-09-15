<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useBackgroundRemovalTool } from '@/composables/tools/useBackgroundRemovalTool'
import { useImageStore } from '@/stores/imageStore'
import { useHistoryStore } from '@/stores/historyStore'
import { useWorkspaceStore } from '@/stores/workspaceStore'
import { useI18n } from 'vue-i18n'
import { useViewportStore } from '@/stores/viewportStore'
import { editorConfig } from '@/config/editorConfig.js'
import { useEditorStore } from '@/stores/editorStore'

const { t } = useI18n()

const imageStore = useImageStore()
const viewportStore = useViewportStore()
const editorStore = useEditorStore()

const { manualSelectedTool, manualToolSize, changeManualToolSize } = useBackgroundRemovalTool(
  useImageStore(),
  useHistoryStore(),
  useWorkspaceStore(),
  t
)

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
 * Whether the user is resizing the tool size with Alt + Right mouse button
 */
const isAltResizing = ref(false)
/**
 * Last mouse X position during resizing
 */
const lastMouseX = ref(0)

/**
 * Whether the eraser is being used during drawing (when Alt is held)
 */
const isErasingDuringDraw = ref(false)

/**
 * Last fixed cursor position when resizing
 */
const fixedCursorPos = ref(null)

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

  ctx.lineWidth = manualToolSize.value
  ctx.lineCap = 'round'

  if (tool === 'eraser') {
    // Eraser
    ctx.globalCompositeOperation = 'destination-out'
    ctx.strokeStyle = 'rgba(0,0,0,1)' // Ignore color when erasing
  } else {
    // Brush
    ctx.globalCompositeOperation = 'source-over'
    ctx.strokeStyle = editorConfig.removalHighlightColor
  }

  ctx.beginPath()
  ctx.moveTo(from.x, from.y)
  ctx.lineTo(to.x, to.y)
  ctx.stroke()

  // Reset default compositing
  ctx.globalCompositeOperation = 'source-over'
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
 * Mouse down - start drawing or resizing
 * @param event Mouse event
 */
const onMouseDown = (event) => {
  if (editorStore.selectedTabPerTool['backgroundRemoval'] !== 'manual') return

  // Resizing tool size with Alt + Right mouse button
  if (event.altKey && event.button === 2) {
    isAltResizing.value = true
    lastMouseX.value = event.clientX
    fixedCursorPos.value = getMousePos(event) // Fix cursor position during resizing
    event.preventDefault()
    return
  }

  // Drawing with Left mouse button
  if (event.button === 0) {
    isDrawing.value = true
    lastPos.value = getMousePos(event)
  }
}

/**
 * Mouse move - update cursor position and draw if drawing
 * @param event Mouse event
 */
const onMouseMove = (event) => {
  cursorPos.value = getMousePos(event)
  showCursor.value = true

  // Resize tool size
  if (isAltResizing.value) {
    const deltaX = event.clientX - lastMouseX.value
    if (deltaX !== 0) {
      changeManualToolSize(manualToolSize.value + deltaX / editorConfig.manualSelectCursorResizingSensitivity)
      lastMouseX.value = event.clientX
    }

    cursorPos.value = fixedCursorPos.value
    return
  }

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
 * Mouse leave - hide cursor
 */
const onMouseLeave = () => {
  showCursor.value = false
}

/**
 * Global mouse up listener to stop drawing when mouse is released
 */
const onMouseUpGlobal = () => {
  // Stop resizing or drawing
  if (isAltResizing.value) {
    isAltResizing.value = false
    fixedCursorPos.value = null
    return
  }
  if (isDrawing.value) {
    isDrawing.value = false
    isErasingDuringDraw.value = false
    // Store the current manual canvas in the image store
    const storedCanvas = document.createElement('canvas')
    storedCanvas.width = manualCanvasRef.value.width
    storedCanvas.height = manualCanvasRef.value.height
    storedCanvas.getContext('2d').drawImage(manualCanvasRef.value, 0, 0)
    imageStore.manualRemovalCanvas = storedCanvas
  }
}

/**
 * Cursor style variables
 */
const cursorStyleVars = computed(() => {
  return {
    '--cursor-brush-border': editorConfig.manualSelectCursorBrushColor,
    '--cursor-eraser-border': editorConfig.manualSelectCursorEraserColor,
    '--cursor-eraser-background': editorConfig.manualSelectCursorEraserBackgroundColor,
  }
})

/**
 * Global mouse up listener to stop drawing when mouse is released outside the canvas
 */
onMounted(() => {
  window.addEventListener('mouseup', onMouseUpGlobal)
})

/**
 * Watch for changes in the stored manual canvas and update the displayed canvas accordingly
 */
watch(
  () => imageStore.manualRemovalCanvas,
  async () => {
    await nextTick()

    const manualCanvas = manualCanvasRef.value
    if (!manualCanvas) return

    manualCanvas.width = imageWidth.value
    manualCanvas.height = imageHeight.value
    ctx = manualCanvas.getContext('2d', { willReadFrequently: true })

    // Use the stored manual canvas if it exists
    if (imageStore.manualRemovalCanvas) {
      ctx.clearRect(0, 0, manualCanvas.width, manualCanvas.height)
      ctx.drawImage(imageStore.manualRemovalCanvas, 0, 0)
    }
  },
  { immediate: true }
)

/**
 * Cleanup
 */
onBeforeUnmount(() => {
  window.removeEventListener('mouseup', onMouseUpGlobal)
})
</script>

<template>
  <div class="manual-removal-wrapper">
    <canvas id="manualRemovalCanvas" ref="manualCanvasRef" class="manual-removal-canvas" :width="imageWidth"
      :height="imageHeight" @mousedown="onMouseDown" @mousemove="onMouseMove" @mouseleave="onMouseLeave"
      :style="{ cursor: editorStore.selectedTabPerTool['backgroundRemoval'] === 'objectDetection' ? 'default' : 'none' }"></canvas>

    <!-- Cursor -->
    <div v-if="showCursor && editorStore.selectedTabPerTool['backgroundRemoval'] === 'manual'" class="custom-cursor"
      :style="{
        ...cursorStyleVars,
        width: manualToolSize + 'px',
        height: manualToolSize + 'px',
        left: cursorPos.x + 'px',
        top: cursorPos.y + 'px'
      }" :class="{
      brush: manualSelectedTool === 'brush',
      eraser: manualSelectedTool === 'eraser' || isErasingDuringDraw,
      isAltResizing: isAltResizing
    }"></div>
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

.custom-cursor {
  position: absolute;
  border: 1px solid transparent;
  border-radius: 50%;
  pointer-events: none;
  transform: translate(-50%, -50%);
}

.custom-cursor.brush {
  border-color: var(--cursor-brush-border);
}

.custom-cursor.eraser {
  border-color: var(--cursor-eraser-border);
  background: var(--cursor-eraser-background);
}

.isAltResizing {
  background: red;
}
</style>
