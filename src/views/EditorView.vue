<script setup>
import ToolsPanel from '@/components/tools/ToolsPanel.vue';
import CollapsiblePanel from '@/components/common/CollapsiblePanel.vue';
import ToolsSettingsPanel from '@/components/toolsSettings/ToolsSettingsPanel.vue';
import ViewportWrapper from '@/components/editor/ViewportWrapper.vue';
import DragAndDropArea from '@/components/editor/DragAndDropArea.vue';
import { useImageStore } from '@/stores/imageStore'
import { useKeyboardShortcuts } from '@/composables/editor/useKeyboardShortcuts';
import { useHistoryStore } from '@/stores/historyStore';
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

// === Keyboard shortcuts configuration ===
import { useUndoRedo } from '@/composables/topPanel/useUndoRedo';
import { useZoomControl } from '@/composables/topPanel/useZoomControl';
import { useViewportStore } from '@/stores/viewportStore';
import { useCloseFileButton } from '@/composables/topPanel/useCloseFileButton';
import { useUploadFileButton } from '@/composables/topPanel/useUploadFileButton';
import { useRoute } from 'vue-router';
import { useToolsPanel } from '@/composables/tools/useToolsPanel';
import { useEditorStore } from '@/stores/editorStore';

const { undo, redo } = useUndoRedo(useHistoryStore(), useImageStore())
const { zoomIn, zoomOut, resetZoom } = useZoomControl(useViewportStore())
const { closeFile } = useCloseFileButton(useImageStore(), t)
const { uploadFile } = useUploadFileButton(useImageStore(), t, useRoute())
const { toggleTool } = useToolsPanel(useEditorStore(), useImageStore())

useKeyboardShortcuts({ undo, redo, zoomIn, zoomOut, resetZoom, closeFile, uploadFile, toggleTool })
// === ===

const imageStore = useImageStore()
</script>

<template>
  <div class="editor-view">
    <ToolsPanel />
    <div class="editor-content" :class="{ 'drag-and-drop-area': imageStore.file === null }">
      <ViewportWrapper v-if="imageStore.file !== null" />
      <DragAndDropArea v-else />
    </div>
    <div class="right-panel">
      <CollapsiblePanel v-if="imageStore.file !== null">
        <ToolsSettingsPanel />
      </CollapsiblePanel>
    </div>
  </div>
</template>

<style scoped>
.editor-view {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
  height: 100%;
}

.editor-content {
  flex: 1;
}

.editor-content.drag-and-drop-area {
  padding: 20px 25px;
}
</style>
