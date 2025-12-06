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
import { ref } from 'vue'
import { globalConfig } from '@/config/globalConfig';

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

/** Generate snowflakes with random properties */
const snowflakes = ref(
  Array.from({ length: 30 }, () => ({
    left: Math.random() * 100 + '%',
    size: Math.random() * 1 + 0.5 + 'rem',
    duration: Math.random() * 5 + 5 + 's',
    delay: Math.random() * 5 + 's'
  }))
);
</script>

<template>
  <div class="top-panel">
    <!-- Snow animation -->
    <div class="snow-container" v-if="globalConfig.randomEvents.enableSnowfall">
      <div v-for="(flake, index) in snowflakes" :key="index" class="snowflake" :style="{
        left: flake.left,
        fontSize: flake.size,
        animationDuration: flake.duration,
        animationDelay: flake.delay
      }">
        ❄
      </div>
    </div>

    <div class="top-panel-left" v-if="!isHomeView">
      <div class="top-panel-left-wrapper" id="top-panel-left">
        <img @click="goHome" :src="logoSrc" alt="Figurio logo" @dragstart.prevent>
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

/* Snow animation */
.snow-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
  z-index: 1000;
}

.snowflake {
  position: absolute;
  color: white;
  user-select: none;
  animation-name: fall;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
  z-index: 100000000000000000;
  opacity: 0;
}

@keyframes fall {
  0% {
    transform: translateY(-1em) rotate(0deg);
    opacity: 0.1;
  }

  50% {
    opacity: 0.2;
  }

  100% {
    transform: translateY(150%) rotate(360deg);
    opacity: 0;
  }
}
</style>
