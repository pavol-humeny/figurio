<script setup>
import BaseIcon from '@/components/icons/BaseIcon.vue'
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const canvasRef = ref(null)
const tool = ref(null) // 'draw' | null
let ctx
let drawing = false

const startDraw = (e) => {
  if (tool.value !== 'draw') return
  drawing = true
  const { x, y } = getPos(e)
  ctx.beginPath()
  ctx.moveTo(x, y)
}

const draw = (e) => {
  if (!drawing || tool.value !== 'draw') return
  const { x, y } = getPos(e)
  ctx.lineTo(x, y)
  ctx.stroke()
}

const stopDraw = () => {
  if (drawing) ctx.closePath()
  drawing = false
}

const getPos = (e) => {
  const rect = canvasRef.value.getBoundingClientRect()
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top,
  }
}

const setTool = (type) => {
  if (tool.value === type) {
    tool.value = null
    canvasRef.value.style.cursor = 'default'
  } else {
    tool.value = type
    canvasRef.value.style.cursor = 'crosshair'
    if (type === 'draw') {
      ctx.strokeStyle =
        getComputedStyle(document.documentElement).getPropertyValue('--primary-c') || '#ccc'
      ctx.lineWidth = 2
    }
  }
}

const clearCanvas = () => {
  const canvas = canvasRef.value
  tool.value = null
  ctx.clearRect(0, 0, canvas.width, canvas.height)
}

onMounted(() => {
  const canvas = canvasRef.value
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  ctx = canvas.getContext('2d')
  ctx.lineCap = 'round'
})
</script>

<template>
  <div class="maintenance-view">
    <canvas ref="canvasRef" @mousedown="startDraw" @mousemove="draw" @mouseup="stopDraw"
      @mouseleave="stopDraw"></canvas>

    <div class="tools">
      <BaseIcon :name="tool === 'draw' ? 'IconCross' : 'IconEditPencil'" :size="24"
        @click="tool === 'draw' ? clearCanvas() : setTool('draw')" :class="{ active: tool === 'draw' }" />
    </div>

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
}

.tools {
  position: absolute;
  top: 30px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2;
  display: flex;
  gap: 10px;
  cursor: pointer;
}

.tools button {
  background: var(--background-c);
  color: var(--primary-c);
  font-size: 24px;
  border: 2px solid var(--primary-c);
  border-radius: 8px;
  padding: 8px 12px;
  cursor: pointer;
  transition: background 0.2s;
}

.tools button.active {
  background: var(--primary-c);
  color: var(--background-c);
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
