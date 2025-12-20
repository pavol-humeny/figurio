<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useImageStore } from '@/stores/imageStore'
import { useHistoryStore } from '@/stores/historyStore'
import { useViewportStore } from '@/stores/viewportStore'
import { useI18n } from 'vue-i18n'
import { useEditorStore } from '@/stores/editorStore'
import { useToastModal } from '@/composables/modals/useToastModal'
import { useUiStore } from '@/stores/uiStore'
import { viewportConfig } from '@/config/viewportConfig.js'
import { useImagePipeline } from '@/composables/editor/useImagePipeline'
import { editorConfig } from '@/config/editorConfig'

const { t } = useI18n()
const imageStore = useImageStore()
const historyStore = useHistoryStore()
const viewportStore = useViewportStore()
const editorStore = useEditorStore()
const uiStore = useUiStore()
const { showToastModal } = useToastModal()
const { renderUpTo } = useImagePipeline(imageStore, uiStore)
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

  ctx.save()
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
 * Drawing logic
 */
const onMouseDown = (event) => {
  if (editorStore.isModalOpenFlag) return

  if (editorStore.selectedToolKey !== 'brush') return

  if (event.button !== 0) return

  const viewport = document.getElementById('viewport-content')
  if (!viewport.contains(event.target)) return

  if (imageStore.needRasterization) {
    // Show warning toast
    showToastModal(
      'warning',
      t('tools.brush.needRasterizationWarning.title'),
      t('tools.brush.needRasterizationWarning.message'),
    )
    return
  }

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

const onMouseUpGlobal = async () => {
  if (!isDrawing.value || editorStore.selectedToolKey !== 'brush') return
  isDrawing.value = false

  // Draw dot if click without move
  if (lastPos.value && !mouseMovedSinceDown.value) {
    drawLine(lastPos.value, lastPos.value, editorStore.selectedTabPerTool[editorStore.selectedToolKey])
  }

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

  await renderUpTo(imageStore.renderPipeline.currentOpIndex + 1)

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
  ctx.imageSmoothingEnabled = false
  // canvasRef.value.style.imageRendering = 'pixelated'
  window.addEventListener('mouseup', onMouseUpGlobal)
  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('mousedown', onMouseDown)
})

onBeforeUnmount(async () => {
  window.removeEventListener('mouseup', onMouseUpGlobal)
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('mousedown', onMouseDown)
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
}
</style>
