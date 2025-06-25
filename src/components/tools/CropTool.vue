<script setup>
import { useImageStore } from '@/stores/imageStore'
import { useEditorStore } from '@/stores/editorStore'
import { useViewportStore } from '@/stores/viewportStore'
import { useCropTool } from '@/composables/tools/useCropTool'
import { useI18n } from 'vue-i18n'
import { useHistoryStore } from '@/stores/historyStore'

const { t } = useI18n()

const { startPan, startResize, cropBox } = useCropTool(
  useImageStore(),
  useViewportStore(),
  useEditorStore(),
  useHistoryStore(),
  t,
)
</script>

<template>
  <div class="crop-overlay">
    <div
      class="crop-box"
      :style="{
        left: cropBox.x + 'px',
        top: cropBox.y + 'px',
        width: cropBox.width + 'px',
        height: cropBox.height + 'px',
      }"
      @mousedown="startPan"
    >
      <div
        v-for="dir in ['top-left', 'top-right', 'bottom-left', 'bottom-right']"
        :key="dir"
        class="resizer"
        :class="dir"
        @mousedown="(event) => startResize(event, dir.replace('-', ''))"
      ></div>
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
  border: var(--border-crop);
  background-color: var(--crop-c);
  pointer-events: auto;
  cursor: move;
}

/* Resize corners */
.resizer {
  position: absolute;
  width: 14px;
  height: 14px;
  background: var(--text-c);
  border: 2px solid var(--editor-highlight-c);
  border-radius: 50%;
  cursor: nwse-resize;
}

.resizer.top-left {
  top: -7px;
  left: -7px;
  cursor: nwse-resize;
}
.resizer.top-right {
  top: -7px;
  right: -7px;
  cursor: nesw-resize;
}
.resizer.bottom-left {
  bottom: -7px;
  left: -7px;
  cursor: nesw-resize;
}
.resizer.bottom-right {
  bottom: -7px;
  right: -7px;
  cursor: nwse-resize;
}
</style>
