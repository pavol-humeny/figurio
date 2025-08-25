<script setup>
import { useImageStore } from '@/stores/imageStore'
import { useEditorStore } from '@/stores/editorStore'
import { useViewportStore } from '@/stores/viewportStore'
import { useCropTool } from '@/composables/tools/useCropTool'
import { useI18n } from 'vue-i18n'
import { useHistoryStore } from '@/stores/historyStore'
import { computed } from 'vue'
import { viewportConfig } from '@/config/viewportConfig'

const viewportStore = useViewportStore()
const { t } = useI18n()

/**
 * Logic of the crop tool
 */
const { startPan, startResize, cropBox } = useCropTool(
  useImageStore(),
  useViewportStore(),
  useEditorStore(),
  useHistoryStore(),
  t,
)

/**
 * Resizer size
 */
const resizerSize = computed(() => {
  return viewportConfig.cropHandleSize / viewportStore.realZoomLevel
})

/**
 * Style object for resizer handles
 */
const resizerStyle = computed(() => {
  const size = Math.max(resizerSize.value, 5)
  const offset = size / 2
  const border = Math.max(size * viewportConfig.cropHandleBorderMultiplier, 1)

  return {
    width: `${size}px`,
    height: `${size}px`,
    '--offset': `${offset}px`,
    '--border-width': `${border}px`,
  }
})

/**
 * Border width of the crop box
 */
const borderWidth = computed(() => {
  return 1
})
</script>

<template>
  <div class="crop-overlay">
    <div class="crop-box" :style="{
      left: cropBox.x + 'px',
      top: cropBox.y + 'px',
      width: cropBox.width + 'px',
      height: cropBox.height + 'px',
      borderWidth: borderWidth + 'px',
    }" @mousedown="startPan">

      <div v-for="dir in ['top-left', 'top-right', 'bottom-left', 'bottom-right']" :key="dir" class="resizer"
        :class="dir" @mousedown="(event) => startResize(event, dir.replace('-', ''))" :style="resizerStyle"></div>
    </div>
  </div>
</template>

<style scoped>
.crop-overlay {
  position: absolute;
  pointer-events: none;
}

.crop-box {
  position: absolute;
  border: 1px dashed var(--editor-highlight-c);
  /* background-color: var(--crop-c); */
  background: transparent;
  pointer-events: auto;
  cursor: move;
}

/* Resize corners */
.resizer {
  position: absolute;
  background: var(--text-c);
  border: var(--border-width) solid var(--editor-highlight-c);
  border-radius: 50%;
  cursor: nwse-resize;
}

.resizer.top-left {
  top: calc(0px - var(--offset) - 1px);
  left: calc(0px - var(--offset) - 1px);
  cursor: nwse-resize;
}

.resizer.top-right {
  top: calc(0px - var(--offset) - 1px);
  right: calc(0px - var(--offset));
  cursor: nesw-resize;
}

.resizer.bottom-left {
  bottom: calc(0px - var(--offset));
  left: calc(0px - var(--offset) - 1px);
  cursor: nesw-resize;
}

.resizer.bottom-right {
  bottom: calc(0px - var(--offset));
  right: calc(0px - var(--offset));
  cursor: nwse-resize;
}
</style>
