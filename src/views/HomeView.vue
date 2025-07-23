<script setup>
import DragAndDropArea from '@/components/editor/DragAndDropArea.vue';
import { useKeyboardShortcuts } from '@/composables/editor/useKeyboardShortcuts';
import { useUiStore } from '@/stores/uiStore';
import { useImageStore } from '@/stores/imageStore';
import { useUploadFileButton } from '@/composables/topPanel/useUploadFileButton';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n'
import { useHelpModal } from '@/composables/modals/useHelpModal';
import { useSettingsPanel } from '@/composables/topPanel/useSettingsPanel';

const { t } = useI18n()

const { uploadFile } = useUploadFileButton(useImageStore(), t, useRouter())
const { openHelpModal } = useHelpModal()
const { openSettingsPanel } = useSettingsPanel(useUiStore())

useKeyboardShortcuts({ uploadFile, openHelpModal, openSettingsPanel }, useUiStore(), useImageStore());

</script>

<template>
  <div class="home-view">
    <DragAndDropArea />
  </div>
</template>

<style scoped>
.home-view {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background: var(--background-c);
  padding: 14px 20px;
}
</style>
