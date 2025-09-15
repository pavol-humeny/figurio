<script setup>
import { ref, computed, watch } from 'vue'
import { useUiStore } from '@/stores/uiStore'
import { useImageStore } from '@/stores/imageStore'

const uiStore = useUiStore()
const imageStore = useImageStore()

/**
 * Whether resize is currently active
 */
const isResizing = ref(false)
/**
 * Initial mouse X position when resizing starts
 */
const startY = ref(0)
/**
 * Initial panel width before resizing
 */
const startHeight = ref(0)


watch(() => imageStore.svgObjects.length, (newVal) => {
  console.warn('imageStore.svgObjects changed: ', newVal)
  if (newVal === 0) {
    uiStore.svgObjectsListDisplayed = false
  } else {
    uiStore.svgObjectsListDisplayed = true
  }
}, { immediate: true })

/**
   * Initiates the panel resizing operation.
   *
   * @param {MouseEvent} event - Mouse down event on resize handle
   */
const startResize = (event) => {
  isResizing.value = true
  startY.value = event.clientY
  startHeight.value = uiStore.svgObjectsListHeight
  document.addEventListener('mousemove', handleResize)
  document.addEventListener('mouseup', stopResize)
}

/**
 * Dynamically updates the panel width during mouse movement.
 *
 * @param {MouseEvent} event - Mouse move event during resize
 */
const handleResize = (event) => {
  if (!isResizing.value) return

  const container = document.querySelector('.svg-objects-list-panel')?.parentElement
  if (!container) return

  const containerHeight = container.clientHeight
  const deltaY = event.clientY - startY.value

  let newHeightPercent = startHeight.value - (deltaY / containerHeight) * 100

  uiStore.setSvgObjectsListHeight(newHeightPercent)
}

/**
 * Ends the resize operation and removes mouse event listeners.
 */
const stopResize = () => {
  isResizing.value = false
  document.removeEventListener('mousemove', handleResize)
  document.removeEventListener('mouseup', stopResize)
}

/**
 * CSS variables for the panel styling
 */
const panelVars = computed(() => {
  return {
    '--panel-height': uiStore.svgObjectsListDisplayed ? `${uiStore.svgObjectsListHeight}%` : '0%'
  }
})
</script>
<template>
  <div class="svg-objects-list-panel" :style="panelVars">
    <p>No SVG objects found</p>
    <div class="resize-handle" @mousedown="startResize"></div>
  </div>

</template>

<style scoped>
.svg-objects-list-panel {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: var(--panel-height);
  background: var(--background-c);
  z-index: var(--z-index-tools-settings-panel);
}

.resize-handle {
  height: 5px;
  width: 100%;
  cursor: ns-resize;
  background: transparent;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  border-top: var(--border-ui);
}

.resize-handle:hover {
  border-top: var(--border-modal);
}
</style>
