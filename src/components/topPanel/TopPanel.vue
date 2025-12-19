<script setup>
import SettingsButton from './SettingsButton.vue';
import HelpButton from './HelpButton.vue';
import FileNameDisplay from './FileNameDisplay.vue';
import UndoRedo from './UndoRedo.vue';
import ZoomControl from './ZoomControl.vue';
import UploadFileButton from './UploadFileButton.vue';
import CloseFileButton from './CloseFileButton.vue';
import ExportFileButton from './ExportFileButton.vue';
import { useRoute } from 'vue-router'
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import BaseIcon from '@/components/icons/BaseIcon.vue'
import { useUserModeStore } from '@/stores/userModeStore';
import { useEditorStore } from '@/stores/editorStore';
import SnowFall from '../randomEvents/SnowFall.vue';
import ChristmasLights from '../randomEvents/ChristmasLights.vue';
import FireWorks from '../randomEvents/FireWorks.vue';

const router = useRouter()
const userModeStore = useUserModeStore()
const editorStore = useEditorStore()

/**
 * Checks if the current view is 'home' to conditionally render parts of the top panel
 */
const route = useRoute()
const isEditorViewOrStatistics = computed(() => route.name === 'editor' || route.name === 'statistics')
const isEditorView = computed(() => route.name === 'editor')

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
    <SnowFall v-if="editorStore.randomEvents.snowfall" />
    <ChristmasLights v-if="editorStore.randomEvents.christmasLights" />
    <FireWorks v-if="editorStore.randomEvents.fireworks" />

    <div class="top-panel-left" v-if="isEditorViewOrStatistics">
      <div class="top-panel-left-wrapper" id="top-panel-left">
        <div class="top-panel-logo-wrapper" @click="goHome">
          <BaseIcon name="IconLogo" class="logo" :size="40" color="var(--primary-c)" />

          <p class="logo-letter">F</p>

          <BaseIcon v-if="userModeStore.isExpertMode" class="user-mode-icon" name="IconStar" size="17"
            color="var(--gold-c)" />
          <BaseIcon v-if="userModeStore.isAdminMode" class="user-mode-icon" name="IconCrown" size="17"
            color="var(--gold-c)" />
        </div>
        <FileNameDisplay v-if="showControls" />
        <UploadFileButton v-if="showControls" />
        <CloseFileButton v-if="showControls" />
      </div>
      <ExportFileButton v-if="showControls" />
    </div>
    <div class="top-panel-center" v-if="isEditorView">
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

.top-panel-logo-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  margin-right: 10px;
  cursor: pointer;
}

.logo-letter {
  position: absolute;
  top: 50%;
  left: 45%;
  transform: translate(-50%, -50%);
  font-family: var(--font-family-rc);
  font-size: 33px;
  opacity: 0.8;
}

.user-mode-icon {
  position: absolute;
  top: -6px;
  left: -4px;
  filter: drop-shadow(var(--box-shadow-hover));
}

.top-panel-left .top-panel-logo-wrapper img {
  height: 40px;
  transition: var(--default-transition);
  cursor: pointer;
}

.top-panel-left .top-panel-logo-wrapper img:hover {
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
