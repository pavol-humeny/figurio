<script setup>
import SettingsButton from './SettingsButton.vue';
import HelpButton from './HelpButton.vue';
import FileNameDisplay from './FileNameDisplay.vue';
import UndoRedo from './UndoRedo.vue';
import ZoomControl from './ZoomControl.vue';
import UploadFileButton from './UploadFileButton.vue';
import CloseFileButton from './CloseFileButton.vue';

import { useRoute } from 'vue-router'
import { computed } from 'vue'

/**
 * Checks if the current view is 'home' to conditionally render parts of the top panel
 */
const route = useRoute()
const isHomeView = computed(() => route.name === 'home')
</script>

<template>
  <div class="top-panel">
    <div class="top-panel__left" v-if="!isHomeView">
      <FileNameDisplay />
      <UploadFileButton />
      <CloseFileButton />
    </div>
    <div class="top-panel__center" v-if="!isHomeView">
      <UndoRedo />
      <ZoomControl />
    </div>
    <div class="top-panel__right">
      <HelpButton />
      <SettingsButton />
    </div>
  </div>
</template>

<style scoped>
.top-panel {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: 70px;
  background: var(--background-c);
  border: var(--border-ui);
  padding: 0 20px;
}

.top-panel__left,
.top-panel__center,
.top-panel__right {
  flex: 1;
  display: flex;
  align-items: center;
}

.top-panel__left {
  justify-content: flex-start;
  gap: 10px;
}

.top-panel__center {
  justify-content: center;
  gap: 10px;
}

.top-panel__right {
  justify-content: flex-end;
  gap: 10px;
}
</style>
