<script setup>
import { useImageStore } from '@/stores/imageStore'
import { useHistoryStore } from '@/stores/historyStore'
import { useSmartCropTool } from '@/composables/tools/useSmartCropTool'
import { useI18n } from 'vue-i18n'
import { useEditorStore } from '@/stores/editorStore'

const { t } = useI18n()

/**
 * Logic of the smart crop tool
 */
const { cropBox } = useSmartCropTool(useImageStore(), useHistoryStore(), useEditorStore(), t)

</script>

<template>
  <div class="crop-overlay">
    <div
      class="crop-box"
      :style="{
        left: cropBox.leftIndent + 'px',
        top: cropBox.topIndent + 'px',
        width: cropBox.width + 'px',
        height: cropBox.height + 'px',
      }"
    ></div>
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
  pointer-events: none;
}
</style>
