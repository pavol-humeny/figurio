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
import { useExportToolSettings } from '@/composables/toolsSettings/useExportToolSettings';
import { useHelpModal } from '@/composables/modals/useHelpModal';
import { useSettingsPanel } from '@/composables/topPanel/useSettingsPanel';
import { useUiStore } from '@/stores/uiStore';
import { usePrivacyAndDataModal } from '@/composables/modals/usePrivacyAndDataModal';
import { useFileNameDisplay } from '@/composables/topPanel/useFileNameDisplay';
import FileTabs from '@/components/editor/FileTabs.vue';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { useFileTabs } from '@/composables/editor/useFileTabs';

const { undo, redo } = useUndoRedo(useHistoryStore(), useImageStore())
const { zoomIn, zoomOut, resetZoom } = useZoomControl(useViewportStore())
const { closeFile } = useCloseFileButton(useImageStore(), useWorkspaceStore(), t)
const { uploadFile } = useUploadFileButton(useImageStore(), t, useRoute())
const { toggleTool } = useToolsPanel(useEditorStore(), useImageStore(), t)
const { openExportToolSettings } = useExportToolSettings(useImageStore(), useEditorStore(), useHistoryStore(), t)
const { openHelpModal } = useHelpModal()
const { openSettingsPanel } = useSettingsPanel(useUiStore())
const { openPrivacyAndDataModal } = usePrivacyAndDataModal(t)
const { startEditing } = useFileNameDisplay(useImageStore(), t)
const { switchToNextTab, switchToPreviousTab, } = useFileTabs(useUiStore(), t)

useKeyboardShortcuts({ undo, redo, zoomIn, zoomOut, resetZoom, closeFile, uploadFile, toggleTool, openExportToolSettings, openHelpModal, openSettingsPanel, openPrivacyAndDataModal, startEditing, switchToNextTab, switchToPreviousTab }, useUiStore(), useImageStore());
// === ===

const imageStore = useImageStore()
</script>

<template>
  <div class="editor-view">
    <ToolsPanel />
    <div class="editor-content" :class="{ 'drag-and-drop-area': imageStore.file === null }">
      <FileTabs v-if="imageStore.isImageLoaded" />
      <ViewportWrapper v-if="imageStore.isImageLoaded" />
      <DragAndDropArea v-else />
    </div>
    <div class="right-panel">
      <CollapsiblePanel v-if="imageStore.isImageLoaded">
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
  overflow: hidden;
}

.editor-content.drag-and-drop-area {
  padding: 20px 25px;
}
</style>
