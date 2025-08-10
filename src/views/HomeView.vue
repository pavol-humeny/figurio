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
import { useInteractiveTutorial } from '@/composables/tutorial/useInteractiveTutorial';

const uiStore = useUiStore();

const { t } = useI18n()

const { uploadFile } = useUploadFileButton(useImageStore(), t, useRouter())
const { openHelpModal } = useHelpModal(useUiStore(), useImageStore(), useRouter(), t)
const { openSettingsPanel } = useSettingsPanel(useUiStore())
const { prevStep, nextStep, finishTutorial, closeTutorial } = useInteractiveTutorial(useUiStore(), useImageStore(), useRouter(), t)

useKeyboardShortcuts({ uploadFile, openHelpModal, openSettingsPanel, prevStep, nextStep, finishTutorial, closeTutorial }, useUiStore(), useImageStore());

// TODO
const test = async () => {
  console.log('Test button clicked');

  const userUuid = uiStore.userUuid;

  try {
    const response = await fetch('https://bp-api-ft1e.onrender.com/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: userUuid,
        event_type: 'add_object',
        tool: 'rectangle',
        button_name: 'test',
        event_data: { ahoj: 'test' },
      }),
    });

    if (!response.ok) {
      // Ak server vráti chybu, napríklad 400 alebo 500
      const errorText = await response.text();
      console.error('Server error:', errorText);
      return;
    }

    const data = await response.json();
    console.log('Server odpoveď:', data);
  } catch (error) {
    console.error('Chyba pri fetch:', error);
  }
}

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
