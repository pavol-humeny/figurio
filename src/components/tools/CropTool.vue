<script setup>
import { useImageStore } from '@/stores/imageStore'
import { useEditorStore } from '@/stores/editorStore'
import { useViewportStore } from '@/stores/viewportStore'
import { useCropTool } from '@/composables/tools/useCropTool'
import { useI18n } from 'vue-i18n'
import { useHistoryStore } from '@/stores/historyStore'
import { computed } from 'vue'
import { viewportConfig } from '@/config/viewportConfig'
import { useWorkspaceStore } from '@/stores/workspaceStore'

const viewportStore = useViewportStore()
const { t } = useI18n()
const editorStore = useEditorStore()

/**
 * Logic of the crop tool
 */
const { startPan, startResize, cropBox } = useCropTool(
  useImageStore(),
  useViewportStore(),
  useEditorStore(),
  useHistoryStore(),
  useWorkspaceStore(),
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
  const size = Math.max(resizerSize.value, 10)
  const offset = size / 2
  const border = Math.max(size * viewportConfig.cropHandleBorderMultiplier, 1)

  return {
    '--width': `${size}px`,
    '--height': `${size}px`,
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

/** Side resizers */
const sideDirs = ['top', 'bottom', 'left', 'right']

/**
 * Which sides should be visible
 */
const visibleSideDirs = computed(() => {
  if (!cropBox || !cropBox.value) return sideDirs

  return sideDirs.filter(dir => {
    const box = cropBox.value
    if (dir === 'top' || dir === 'bottom') {
      return box.width > parseFloat(resizerStyle.value['--width']) * 2
    } else {
      return box.height > parseFloat(resizerStyle.value['--height']) * 2
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
      borderWidth: borderWidth + 'px',
    }" @mousedown="startPan" v-if="editorStore.toolsConfig.crop.isVisibleCropBox">

      <!-- Corners -->
      <div v-for="dir in ['top-left', 'top-right', 'bottom-left', 'bottom-right']" :key="dir" class="resizer"
        :class="dir" @mousedown="(event) => startResize(event, dir.replace('-', ''))" :style="resizerStyle"></div>

      <!-- Sides -->
      <div v-for="dir in visibleSideDirs" :key="dir" class="resizer" :class="dir"
        @mousedown="(event) => startResize(event, dir)" :style="resizerStyle"></div>
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
  z-index: var(--z-index-crop-box);
}

/* Resizers */
.resizer {
  position: absolute;
  background: var(--text-c);
  border: var(--border-width) solid var(--editor-highlight-c);
  /* border-radius: 50%; */
  cursor: nwse-resize;
}

/* Corners */
.resizer.top-left,
.resizer.top-right,
.resizer.bottom-left,
.resizer.bottom-right {
  width: calc(var(--width));
  height: calc(var(--height));
  border-radius: 50%;
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

/* Sides */
.resizer.top,
.resizer.bottom {
  border-radius: 2px;
  height: calc(var(--height)/2);
  width: calc(var(--width));
}

.resizer.left,
.resizer.right {
  border-radius: 2px;
  width: calc(var(--height)/2);
  height: calc(var(--width));
}

.resizer.top {
  top: calc(0px - calc(var(--height)/4) - 1px);
  left: 50%;
  transform: translateX(-50%);
  cursor: ns-resize;
}

.resizer.bottom {
  bottom: calc(0px - calc(var(--height)/4));
  left: 50%;
  transform: translateX(-50%);
  cursor: ns-resize;
}

.resizer.left {
  left: calc(0px - calc(var(--width)/4) - 1px);
  top: 50%;
  transform: translateY(-50%);
  cursor: ew-resize;
}

.resizer.right {
  right: calc(0px - calc(var(--width)/4));
  top: 50%;
  transform: translateY(-50%);
  cursor: ew-resize;
}
</style>
