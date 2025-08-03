<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const canvasRef = ref(null)
let ctx = null
let clearTimeoutId = null

const lastPos = ref({ x: 0, y: 0 })
const isFirst = ref(true)

/**
 * Get the position of the mouse relative to the canvas.
 */
const getPos = (e) => {
  const rect = canvasRef.value.getBoundingClientRect()
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top,
  }
}

/**
 * Draws a line on the canvas based on mouse movement.
 * @param {MouseEvent} e - The mouse event containing the position.
 */
const onMouseMove = (e) => {
  const pos = getPos(e)

  if (isFirst.value) {
    lastPos.value = pos
    isFirst.value = false
    return
  }

  ctx.beginPath()
  ctx.moveTo(lastPos.value.x, lastPos.value.y)
  ctx.lineTo(pos.x, pos.y)
  ctx.stroke()
  ctx.closePath()

  lastPos.value = pos

  // Reset the timeout to clear the canvas
  if (clearTimeoutId) clearTimeout(clearTimeoutId)
  clearTimeoutId = setTimeout(() => {
    clearCanvas()
  }, 15)
}

/**
 * Clear the canvas
 */
const clearCanvas = () => {
  ctx.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height)
  isFirst.value = true
}

/**
 * Set the canvas size and context on mount
 */
onMounted(() => {
  const canvas = canvasRef.value
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  ctx = canvas.getContext('2d')

  ctx.lineWidth = 2
  ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--primary-c') || '#ccc'
  ctx.lineCap = 'round'
})
</script>

<template>
  <div class="maintenance-view">
    <canvas ref="canvasRef" @mousemove="onMouseMove" />

    <div class="text-content">
      <h1>{{ t('maintenance.message') }}</h1>
      <p class="sub">{{ t('maintenance.sub') }}</p>
    </div>
  </div>
</template>

<style scoped>
.maintenance-view {
  position: relative;
  width: 100vw;
  height: 100vh;
  background: var(--background-c);
  overflow: hidden;
}

canvas {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 0;
  cursor: crosshair;
}

.text-content {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 100%;
  z-index: 1;
  text-align: center;
  pointer-events: none;
  filter: drop-shadow(0 0 10px rgba(0, 0, 0, 0.7));
}

h1 {
  font-size: 35px;
  font-weight: bold;
  color: var(--primary-c);
  margin-bottom: 10px;
}

.sub {
  font-size: 18px;
  color: var(--text-c);
  max-width: 600px;
  margin: 0 auto;
}
</style>
