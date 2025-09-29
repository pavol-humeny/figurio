<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useBrushTool } from '@/composables/tools/useBrushTool'
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

const {
  brushColor,
  brushToolType,
} = useBrushTool(imageStore, historyStore, t)

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
 * Draw line between points
 */
const drawLine = (from, to, tool) => {
  if (!ctx) return
  ctx.lineWidth = editorStore.cursorSize
  ctx.lineCap = 'round'

  if (tool === 'eraser') {
    ctx.globalCompositeOperation = 'destination-out'
    ctx.strokeStyle = 'rgba(0,0,0,1)'
  } else {
    ctx.globalCompositeOperation = 'source-over'
    ctx.strokeStyle = brushColor.value || 'black'
  }

  ctx.beginPath()
  ctx.moveTo(from.x, from.y)
  ctx.lineTo(to.x, to.y)
  ctx.stroke()
  ctx.closePath()

  ctx.globalCompositeOperation = 'source-over'
}

/**
 * Mouse events
 */
const onMouseDown = (event) => {
  if (editorStore.selectedToolKey !== 'brush') return

  if (event.button !== 0) return // only left mouse
  isDrawing.value = true
  const pos = getMousePos(event)
  lastPos.value = pos
  drawLine(pos, pos, brushToolType.value) // dot in case of click without move
}

const onMouseMove = (event) => {
  if (editorStore.selectedToolKey !== 'brush') return
  if (!isDrawing.value) return
  const currentPos = getMousePos(event)
  drawLine(lastPos.value, currentPos, brushToolType.value)
  lastPos.value = currentPos
}

const onMouseUpGlobal = () => {
  if (editorStore.selectedToolKey !== 'brush') return
  if (!isDrawing.value) return
  isDrawing.value = false

  // uložiť výsledok do imageStore
  imageStore.overlayImage = canvasRef.value
  imageStore.overlayImageExport = canvasRef.value
  imageStore.overlayImagePreview = canvasRef.value

  historyStore.push(imageStore.getSnapshot(t))
}

/**
 * Init + cleanup
 */
onMounted(() => {
  ctx = canvasRef.value.getContext('2d', { willReadFrequently: true })
  window.addEventListener('mouseup', onMouseUpGlobal)
  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('mousedown', onMouseDown)

  if (!imageStore.overlayImage || !canvasRef.value) return
  ctx.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height)
  ctx.drawImage(imageStore.overlayImage, 0, 0, canvasRef.value.width, canvasRef.value.height)
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
