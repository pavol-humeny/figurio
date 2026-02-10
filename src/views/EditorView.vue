<script setup>
import { onBeforeMount, onMounted, watch } from 'vue'
import { useConsole } from '@/composables/common/useConsole.js'
const { warn } = useConsole()

import ToolsPanel from '@/components/tools/ToolsPanel.vue';
import CollapsiblePanel from '@/components/common/CollapsiblePanel.vue';
import ToolsSettingsPanel from '@/components/toolsSettings/ToolsSettingsPanel.vue';
import ViewportWrapper from '@/components/editor/ViewportWrapper.vue';
import DragAndDropArea from '@/components/editor/DragAndDropArea.vue';
import { useImageStore } from '@/stores/imageStore'
import { useKeyboardShortcuts } from '@/composables/editor/useKeyboardShortcuts';
import { useHistoryStore } from '@/stores/historyStore';
import { useI18n } from 'vue-i18n'
import { useCollapsiblePanel } from '@/composables/common/useCollapsiblePanel';
import SvgObjectsList from '@/components/toolsSettings/SvgObjectsList.vue';

const { t } = useI18n()

// === Keyboard shortcuts configuration ===
import { useUndoRedo } from '@/composables/topPanel/useUndoRedo';
import { useZoomControl } from '@/composables/topPanel/useZoomControl';
import { useViewportStore } from '@/stores/viewportStore';
import { useCloseFileButton } from '@/composables/topPanel/useCloseFileButton';
import { useUploadFileButton } from '@/composables/topPanel/useUploadFileButton';
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
import { useCropTool } from '@/composables/tools/useCropTool';
import { useBackgroundRemovalTool } from '@/composables/tools/useBackgroundRemovalTool';
import { useImageAnalysis } from '@/composables/tools/useImageAnalysis';
import { useFeatureTourModal } from '@/composables/modals/useFeatureTourModal';
import { useCalibrationModal } from '@/composables/modals/useCalibrationModal';
import { useImportModal } from '@/composables/modals/useImportModal';
import { useReleaseModal } from '@/composables/modals/useReleaseModal';
import { useUserModeStore } from '@/stores/userModeStore';

const { hideArtifacts } = useImageAnalysis(useImageStore(), useViewportStore(), useUiStore(), useHistoryStore(), useEditorStore(), useWorkspaceStore(), t)

const { undo, redo } = useUndoRedo(useHistoryStore(), useImageStore(), useUiStore(), t)
const { zoomIn, zoomOut, resetZoom, toggleZoomMode } = useZoomControl(useViewportStore(), useImageStore(), t)
const { closeFile } = useCloseFileButton(useImageStore(), useWorkspaceStore(), t)
const { uploadFile } = useUploadFileButton(useImageStore(), t, useRouter(), useUserModeStore(), useWorkspaceStore(), useUiStore(), useViewportStore(), useHistoryStore(), useEditorStore())
const { toggleTool } = useToolsPanel(useEditorStore(), useImageStore(), useUiStore(), useWorkspaceStore(), t)
const { openHelpModal } = useHelpModal(useUiStore(), useImageStore(), useEditorStore(), useUserModeStore(), useRouter(), t)
const { openSettingsPanel } = useSettingsPanel(useUiStore())
const { openPrivacyAndDataModal } = usePrivacyAndDataModal(t)
const { startEditing } = useFileNameDisplay(useImageStore(), t)
const { switchToNextTab, switchToPreviousTab, } = useFileTabs(useUiStore(), useViewportStore(), useImageStore(), useEditorStore(), t)
const { prevStep, nextStep, finishTutorial, closeTutorial, startTutorial } = useInteractiveTutorial(useUiStore(), useImageStore(), useRouter(), t)
const { hideCropBox, showCropBox, applyCrop } = useCropTool(useImageStore(), useViewportStore(), useEditorStore(), useHistoryStore(), useUiStore(), t)
const { toggleVisibility: toggleCollapsiblePanel, } = useCollapsiblePanel(useUiStore())

const {
  moveObjectLeftLocal,
  moveObjectRightLocal,
  moveObjectUpLocal,
  moveObjectDownLocal,
  moveObjectLeftGlobal,
  moveObjectRightGlobal,
  moveObjectUpGlobal,
  moveObjectDownGlobal,
  deleteSelectedSvgObjects,
  moveSelectedSvgObjectForward,
  moveSelectedSvgObjectBackward,
  selectedObjectInfo,
  copySelectedSvgObject,
  pasteSvgObjectToCenter,
  duplicateSelectedSvgObject,
  cutSelectedSvgObject,
} = useSvgObjects(useImageStore(), useHistoryStore(), useViewportStore(), useEditorStore(), useUiStore(), useWorkspaceStore(), t)

const { applyBackgroundRemoval } = useBackgroundRemovalTool(
  useImageStore(),
  useHistoryStore(),
  useWorkspaceStore(),
  useEditorStore(),
  useUiStore(),
  t,
)

const { closeHelpModal } = useHelpModal(useUiStore(), useImageStore(), useEditorStore(), useUserModeStore(), useRouter(), t)
const { closeSettingsPanel } = useSettingsPanel(useUiStore())
const { closePrivacyAndDataModal } = usePrivacyAndDataModal(t)
const { closeFeatureTourModal } = useFeatureTourModal()
const { closeCalibrationModal } = useCalibrationModal(useViewportStore())
const { closeExportToolSettings, exportFileFunction, openExportToolSettings, copyImageToClipboardFunction } = useExportToolSettings(useImageStore(), useEditorStore(), useHistoryStore(), useViewportStore(), useUiStore(), t)
const { closeImportModal } = useImportModal()
const { closeReleaseModal } = useReleaseModal()

const imageStore = useImageStore()
const editorStore = useEditorStore()
const uiStore = useUiStore()

useKeyboardShortcuts({
  undo,
  redo,
  zoomIn,
  zoomOut,
  resetZoom,
  toggleZoomMode,
  closeFile,
  uploadFile,
  toggleTool,
  openExportToolSettings,
  openHelpModal,
  openSettingsPanel,
  openPrivacyAndDataModal,
  startEditing, switchToNextTab,
  switchToPreviousTab,
  prevStep,
  nextStep, finishTutorial,
  closeTutorial,
  deleteSelectedSvgObjects,
  moveSelectedSvgObjectForward,
  moveSelectedSvgObjectBackward,
  moveObjectLeftLocal,
  moveObjectRightLocal,
  moveObjectUpLocal,
  moveObjectDownLocal,
  moveObjectLeftGlobal,
  moveObjectRightGlobal,
  moveObjectUpGlobal,
  moveObjectDownGlobal,
  copySelectedSvgObject,
  pasteSvgObjectToCenter,
  duplicateSelectedSvgObject,
  cutSelectedSvgObject,
  hideCropBox,
  showCropBox,
  applyCrop,
  applyBackgroundRemoval,
  toggleCollapsiblePanel,
  closeHelpModal,
  closeSettingsPanel,
  closePrivacyAndDataModal,
  closeFeatureTourModal,
  closeCalibrationModal,
  closeExportToolSettings,
  exportFileFunction,
  copyImageToClipboardFunction,
  closeImportModal,
  closeReleaseModal,
}, useUiStore(), useEditorStore());
// ======

// Start tutorial if opening the editor for the first time
watch(() => uiStore.tutorialShouldBeStartedForFirstTime, (newVal) => {
  warn('tutorialShouldBeStartedForFirstTime changed: ', newVal)
  if (newVal) {
    uiStore.tutorialShouldBeStartedForFirstTime = false
    startTutorial()
  }
})

onMounted(() => {
  // Hide artifacts overlay on any click
  window.addEventListener('click', () => {
    hideArtifacts()
  })

  // Close right panel if there is no selected tool
  if (editorStore.selectedToolKey === '') {
    useCollapsiblePanel(uiStore).hidePanel()
  }
})

onBeforeMount(() => {
  window.removeEventListener('click', () => {
    hideArtifacts()
  })
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
        <div class="file-info-center">
          <p>
            {{ imageStore.fileDimensions.width }}px × {{ imageStore.fileDimensions.height }}px
          </p>
        </div>
        <div class="file-info-right">
          <p v-if="selectedObjectInfo?.width !== undefined && selectedObjectInfo?.height !== undefined">
            {{ selectedObjectInfo.width }}px × {{ selectedObjectInfo.height }}px
          </p>
          <p v-if="selectedObjectInfo?.angle !== undefined">
            {{ selectedObjectInfo.angle }}°
          </p>
        </div>
      </div>
    </div>
    <div class="right-panel">
      <CollapsiblePanel v-if="imageStore.isImageLoaded" id="tool-settings">
        <ToolsSettingsPanel />
        <SvgObjectsList />
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
  justify-content: center;
  position: relative;
  z-index: var(--z-index-file-tabs);
}

.file-info-center {
  padding-right: var(--ruler-size);
}

.file-info-right {
  position: absolute;
  right: 10px;
  /* top: 0; */
  display: flex;
  gap: 12px;
  /* height: 100%; */
  align-items: center;
  font-size: var(--file-tabs-name-font-size);
  color: var(--primary-c);
}

.file-info p {
  font-size: var(--file-tabs-name-font-size);
  color: var(--primary-c);
  margin-top: 3px;
}
</style>
