<script setup>
import { onMounted } from 'vue'

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
import { useInteractiveTutorial } from '@/composables/tutorial/useInteractiveTutorial';
import { useRouter } from 'vue-router'
import { useSvgObjects } from '@/composables/tools/useSvgObjects';

const { undo, redo } = useUndoRedo(useHistoryStore(), useImageStore())
const { zoomIn, zoomOut, resetZoom } = useZoomControl(useViewportStore())
const { closeFile } = useCloseFileButton(useImageStore(), useWorkspaceStore(), t)
const { uploadFile } = useUploadFileButton(useImageStore(), t, useRoute())
const { toggleTool } = useToolsPanel(useEditorStore(), useImageStore(), useUiStore(), t)
const { openExportToolSettings } = useExportToolSettings(useImageStore(), useEditorStore(), useHistoryStore(), t)
const { openHelpModal } = useHelpModal(useUiStore(), useImageStore(), useRouter(), t)
const { openSettingsPanel } = useSettingsPanel(useUiStore())
const { openPrivacyAndDataModal } = usePrivacyAndDataModal(t)
const { startEditing } = useFileNameDisplay(useImageStore(), t)
const { switchToNextTab, switchToPreviousTab, } = useFileTabs(useUiStore(), t)
const { prevStep, nextStep, finishTutorial, closeTutorial, startTutorial } = useInteractiveTutorial(useUiStore(), useImageStore(), useRouter(), t)
const { moveObjectLeft, moveObjectRight, moveObjectUp, moveObjectDown, deleteSelectedSvgObject, moveSelectedSvgObjectForward, moveSelectedSvgObjectBackward, } = useSvgObjects(useImageStore(), useHistoryStore(), t)

const imageStore = useImageStore()

useKeyboardShortcuts({
  undo, redo, zoomIn, zoomOut, resetZoom, closeFile, uploadFile, toggleTool, openExportToolSettings, openHelpModal, openSettingsPanel, openPrivacyAndDataModal, startEditing, switchToNextTab, switchToPreviousTab, prevStep, nextStep, finishTutorial, closeTutorial, deleteSelectedSvgObject, moveSelectedSvgObjectForward, moveSelectedSvgObjectBackward, moveObjectLeft, moveObjectRight, moveObjectUp, moveObjectDown
}, useUiStore(), useImageStore());
// === ===


// Start tutorial if opening the editor for the first time
onMounted(() => {
  const uiStore = useUiStore()
  if (uiStore.tutorialStep === -1) {
    startTutorial()
  }
})
</script>

<template>
  <div class="editor-view">
    <ToolsPanel />
    <div class="editor-content" :class="{ 'drag-and-drop-area': imageStore.file === null }">
      <FileTabs v-if="imageStore.isImageLoaded" />
      <ViewportWrapper v-if="imageStore.isImageLoaded" />
      <DragAndDropArea v-else />
      <div v-if="imageStore.isImageLoaded" class="file-info">
        <p>{{ imageStore.fileDimensions.width }} px x {{ imageStore.fileDimensions.height }} px</p>
      </div>

    </div>
    <div class="right-panel">
      <CollapsiblePanel v-if="imageStore.isImageLoaded" id="tool-settings">
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

.file-info {
  height: 30px;
  width: 100%;
  border-top: var(--border-ui);
  background: var(--background-c);
  display: flex;
  /* align-items: center; */
  justify-content: center;
}

.file-info p {
  font-size: var(--file-tabs-name-font-size);
  color: var(--primary-c);
  margin-top: 3px;
}
</style>
