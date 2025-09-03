<script setup>
import SettingsButton from './SettingsButton.vue';
import HelpButton from './HelpButton.vue';
import FileNameDisplay from './FileNameDisplay.vue';
import UndoRedo from './UndoRedo.vue';
import ZoomControl from './ZoomControl.vue';
import UploadFileButton from './UploadFileButton.vue';
import CloseFileButton from './CloseFileButton.vue';
import ExportFileButton from './ExportFileButton.vue';
import { useUiStore } from '@/stores/uiStore';
import { useRoute } from 'vue-router'
import { computed } from 'vue'
import EdimageLogoDark from '@/assets/EdimageLogoDark.png'
import EdimageLogoLight from '@/assets/EdimageLogoLight.png'

const uiStore = useUiStore()

/**
 * Checks if the current view is 'home' to conditionally render parts of the top panel
 */
const route = useRoute()
const isHomeView = computed(() => route.name === 'home')

/**
 * Computes the logo source based on the current theme.
 */
const logoSrc = computed(() => {
  return uiStore.theme === 'dark' ? EdimageLogoDark : EdimageLogoLight
})

/**
 * Navigates to the home view.
 */
const goHome = () => {
  window.location.reload()
}

</script>

<template>
  <div class="top-panel">
    <div class="top-panel-left" v-if="!isHomeView" id="top-panel-left">
      <img @click="goHome" :src="logoSrc" alt="Edimage logo">
      <FileNameDisplay />
      <UploadFileButton />
      <CloseFileButton />
      <ExportFileButton />
    </div>
    <div class="top-panel-center" v-if="!isHomeView" id="top-panel-center">
      <UndoRedo />
      <ZoomControl />
    </div>
    <div class="top-panel-right" id="top-panel-right">
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
  z-index: var(--z-index-top-panel);
  position: relative;
}

.top-panel-left,
.top-panel-center,
.top-panel-right {
  flex: 1;
  display: flex;
  align-items: center;
}

.top-panel-left {
  justify-content: flex-start;
  gap: 10px;
}

.top-panel-left img {
  height: 40px;
  margin-right: 10px;
  transition: var(--default-transition);
  cursor: pointer;
}

.top-panel-left img:hover {
  transition: var(--default-transition);
  filter: drop-shadow(var(--box-shadow-hover));
}

.top-panel-center {
  justify-content: center;
  gap: 10px;
}

.top-panel-right {
  justify-content: flex-end;
  gap: 10px;
}
</style>
