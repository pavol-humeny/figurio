<script setup>
import { useImageStore } from '@/stores/imageStore'
import { useEditorStore } from '@/stores/editorStore'
import { useViewportStore } from '@/stores/viewportStore'
import { useCropTool } from '@/composables/tools/useCropTool'
import { useI18n } from 'vue-i18n'
import { useHistoryStore } from '@/stores/historyStore'
import { computed } from 'vue'
import { viewportConfig } from '@/config/viewportConfig'
import { useUiStore } from '@/stores/uiStore'

const viewportStore = useViewportStore()
const { t } = useI18n()
const editorStore = useEditorStore()

/**
 * Crop tool logic
 */
const { startPan, startResize, cropBox } = useCropTool(
  useImageStore(),
  useViewportStore(),
  useEditorStore(),
  useHistoryStore(),
  useUiStore(),
  t,
)

/**
 * Compute handle size so it always appears visually identical regardless of zoom
 */
const resizerSize = computed(() => {
  return viewportConfig.cropHandleSize / viewportStore.realZoomLevel
})

/**
 * Compute border width so it's visually constant regardless of zoom
 */
const borderWidth = computed(() => {
  return viewportConfig.cropHandleBorderMultiplier / viewportStore.realZoomLevel
})

/**
 * Styles for handle blocks
 */
const resizerStyle = computed(() => {
  const size = Math.max(resizerSize.value, 10)
  const offset = size / 2
  const border = Math.max(size * 0.15, 1 / viewportStore.realZoomLevel)

  return {
    '--size': `${size}px`,
    '--offset': `${offset}px`,
    '--border-width': `${border}px`,
  }
})

/** Sides */
const sideDirs = ['top', 'bottom', 'left', 'right']

/**
 * Hide side handles if crop box is too small
 */
const visibleSideDirs = computed(() => {
  if (!cropBox || !cropBox.value) return sideDirs

  return sideDirs.filter(dir => {
    const box = cropBox.value
    const size = parseFloat(resizerStyle.value['--size'])
    if (dir === 'top' || dir === 'bottom') {
      return box.width > size * 2
    } else {
      return box.height > size * 2
    }
  })
})
</script>

<template>
  <div class="crop-overlay">
    <div class="crop-box" :style="{
      left: cropBox.x + 'px',
      top: cropBox.y + 'px',
      width: cropBox.width + 'px',
      height: cropBox.height + 'px',
      borderWidth: borderWidth + 'px'
    }" @mousedown="startPan" @touchstart="startPan"
      :class="{ 'crop-box-opacity': !editorStore.toolsConfig.crop.isVisibleCropBox }">

      <!-- Corner handles -->
      <div v-for="dir in ['top-left', 'top-right', 'bottom-left', 'bottom-right']" :key="dir" class="resizer"
        :class="dir" @mousedown="(event) => startResize(event, dir.replace('-', ''))"
        @touchstart="(event) => startResize(event, dir.replace('-', ''))" :style="resizerStyle"></div>

      <!-- Side handles -->
      <div v-for="dir in visibleSideDirs" :key="dir" class="resizer" :class="dir"
        @mousedown="(event) => startResize(event, dir)" @touchstart="(event) => startResize(event, dir)"
        :style="resizerStyle"></div>
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
  background: transparent;
  pointer-events: auto;
  touch-action: none;
  cursor: move;
  z-index: var(--z-index-crop-box);
}

/* Resize handles */
.resizer {
  position: absolute;
  background: var(--text-c);
  border: var(--border-width) solid var(--editor-highlight-c);
  /* Scales with zoom */
  border-radius: 50%;
  width: var(--size);
  height: var(--size);
}

/* Corners */
.resizer.top-left {
  top: calc(0px - var(--offset));
  left: calc(0px - var(--offset));
  cursor: nwse-resize;
}

.resizer.top-right {
  top: calc(0px - var(--offset));
  right: calc(0px - var(--offset));
  cursor: nesw-resize;
}

.resizer.bottom-left {
  bottom: calc(0px - var(--offset));
  left: calc(0px - var(--offset));
  cursor: nesw-resize;
}

.resizer.bottom-right {
  bottom: calc(0px - var(--offset));
  right: calc(0px - var(--offset));
  cursor: nwse-resize;
}

/* Sides */
.resizer.top,
.resizer.bottom {
  border-radius: 2px;
  width: var(--size);
  height: calc(var(--size) / 2);
  left: 50%;
  transform: translateX(-50%);
  cursor: ns-resize;
}

.resizer.top {
  top: calc(0px - (var(--size) / 4));
}

.resizer.bottom {
  bottom: calc(0px - (var(--size) / 4));
}

.resizer.left,
.resizer.right {
  border-radius: 2px;
  height: var(--size);
  width: calc(var(--size) / 2);
  top: 50%;
  transform: translateY(-50%);
  cursor: ew-resize;
}

.resizer.left {
  left: calc(0px - (var(--size) / 4));
}

.resizer.right {
  right: calc(0px - (var(--size) / 4));
}

.crop-box-opacity {
  opacity: 0;
}
</style>
