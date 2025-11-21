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
import FigurioLogoDark from '@/assets/FigurioLogoDark.png'
import FigurioLogoLight from '@/assets/FigurioLogoLight.png'
import { useRouter } from 'vue-router'

const uiStore = useUiStore()
const router = useRouter()

/**
 * Checks if the current view is 'home' to conditionally render parts of the top panel
 */
const route = useRoute()
const isHomeView = computed(() => route.name === 'home')

/**
 * Computes the logo source based on the current theme.
 */
const logoSrc = computed(() => {
  return uiStore.theme === 'dark' ? FigurioLogoDark : FigurioLogoLight
})

/**
 * Navigates to the home view.
 */
const goHome = () => {
  if (route.name === 'editor') {
    // Reload window to reset state
    window.location.reload();
  } else {
    router.replace({ name: 'home' })
  }
}

/** Computes whether to show the controls */
const showControls = computed(() => route.name === 'editor')
</script>

<template>
  <div class="top-panel">
    <div class="top-panel-left" v-if="!isHomeView">
      <div class="top-panel-left-wrapper" id="top-panel-left">
        <img @click="goHome" :src="logoSrc" alt="Figurio logo">
        <FileNameDisplay v-if="showControls" />
        <UploadFileButton v-if="showControls" />
        <CloseFileButton v-if="showControls" />
      </div>
      <ExportFileButton v-if="showControls" />
    </div>
    <div class="top-panel-center" v-if="!isHomeView">
      <div class="top-panel-center-wrapper" id="top-panel-center">
        <UndoRedo v-if="showControls" />
        <ZoomControl v-if="showControls" />
      </div>
    </div>
    <div class="top-panel-right">
      <div class="top-panel-right-wrapper" id="top-panel-right">
        <HelpButton />
        <SettingsButton />
      </div>
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
  border-bottom: var(--border-ui);
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

.top-panel-left-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
}

.top-panel-center-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
}

.top-panel-right-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
}

.top-panel-left {
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
  padding: 0 10px;
}

.top-panel-right {
  justify-content: flex-end;
  gap: 10px;
}
</style>
