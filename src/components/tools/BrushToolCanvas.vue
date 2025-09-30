<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useImageStore } from '@/stores/imageStore'
import { useHistoryStore } from '@/stores/historyStore'
import { useViewportStore } from '@/stores/viewportStore'
import { useI18n } from 'vue-i18n'
import { useEditorStore } from '@/stores/editorStore'

const { t } = useI18n()
const imageStore = useImageStore()
const historyStore = useHistoryStore()
const viewportStore = useViewportStore()
const editorStore = useEditorStore()

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
 * Canvas context
 */
let ctx = null

/**
 * Get mouse position relative to canvas
 */
const getMousePos = (event) => {
  const rect = canvasRef.value.getBoundingClientRect()
  return {
    x: (event.clientX - rect.left) / viewportStore.realZoomLevel,
    y: (event.clientY - rect.top) / viewportStore.realZoomLevel,
  }
}

/**
 * Convert HEX color to RGB string
 * @param {string} hex - HEX color string, e.g. "#d30f0f"
 * @return {string} - RGB color string, e.g. "rgb(211,15,15)"
 */
function hexToRgb(hex) {
  if (!hex) return 'rgb(0,0,0)' // fallback to black
  const bigint = parseInt(hex.replace('#', ''), 16)
  const r = (bigint >> 16) & 255
  const g = (bigint >> 8) & 255
  const b = bigint & 255
  return `rgb(${r},${g},${b})`
}

/**
 * Draw line between points
 */
const drawLine = (from, to, tool) => {
  if (!ctx) return
  ctx.lineWidth = editorStore.cursorSize
  ctx.lineCap = 'round'

  if (tool === 'eraser') {
    ctx.save()
    ctx.globalCompositeOperation = 'destination-out'
    ctx.strokeStyle = '#000000' // color doesn't matter for eraser
  } else {
    ctx.save()
    ctx.globalCompositeOperation = 'source-over'
    ctx.strokeStyle = editorStore.toolsConfig.brush.color ? hexToRgb(editorStore.toolsConfig.brush.color) : 'rgb(0,0,0)'
  }

  ctx.beginPath()
  ctx.moveTo(from.x, from.y)
  ctx.lineTo(to.x, to.y)
  ctx.stroke()
  ctx.closePath()

  ctx.restore()
}

/**
 * Drawing logic
 */
const onMouseDown = (event) => {
  if (editorStore.selectedToolKey !== 'brush') return
  if (event.button !== 0) return

  const viewport = document.getElementById('viewport-content')
  if (!viewport.contains(event.target)) return

  isDrawing.value = true
  lastPos.value = getMousePos(event)
  mouseMovedSinceDown.value = false
}

const onMouseMove = (event) => {
  if (!isDrawing.value || editorStore.selectedToolKey !== 'brush') return
  mouseMovedSinceDown.value = true

  const currentPos = getMousePos(event)
  drawLine(lastPos.value, currentPos, editorStore.selectedTabPerTool[editorStore.selectedToolKey])
  lastPos.value = currentPos
}

const onMouseUpGlobal = () => {
  if (!isDrawing.value || editorStore.selectedToolKey !== 'brush') return
  isDrawing.value = false

  // Draw dot if click without move
  if (lastPos.value && !mouseMovedSinceDown.value) {
    drawLine(lastPos.value, lastPos.value, editorStore.selectedTabPerTool[editorStore.selectedToolKey])
  }

  if (!canvasRef.value) return

  // Save overlay AFTER drawing
  imageStore.overlayImage = canvasRef.value
  imageStore.overlayImageExport = canvasRef.value
  imageStore.overlayImagePreview = canvasRef.value

  // Push snapshot to history
  historyStore.push(imageStore.getSnapshot(t))

  mouseMovedSinceDown.value = false
}

/**
 * Init + cleanup
 */
onMounted(() => {
  ctx = canvasRef.value.getContext('2d', { willReadFrequently: true })
  window.addEventListener('mouseup', onMouseUpGlobal)
  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('mousedown', onMouseDown)

  // if (!imageStore.overlayImage || !canvasRef.value) return
  // ctx.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height)
  // ctx.drawImage(imageStore.overlayImage, 0, 0, canvasRef.value.width, canvasRef.value.height)
})

onBeforeUnmount(() => {
  window.removeEventListener('mouseup', onMouseUpGlobal)
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('mousedown', onMouseDown)
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
}
</style>
