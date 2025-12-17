<script setup>
import SettingsButton from './SettingsButton.vue';
import HelpButton from './HelpButton.vue';
import FileNameDisplay from './FileNameDisplay.vue';
import UndoRedo from './UndoRedo.vue';
import ZoomControl from './ZoomControl.vue';
import UploadFileButton from './UploadFileButton.vue';
import CloseFileButton from './CloseFileButton.vue';
import ExportFileButton from './ExportFileButton.vue';
// import { useUiStore } from '@/stores/uiStore';
import { useRoute } from 'vue-router'
import { computed } from 'vue'
// import FigurioLogoDark from '@/assets/FigurioLogoDark.png'
// import FigurioLogoLight from '@/assets/FigurioLogoLight.png'
import { useRouter } from 'vue-router'
import { ref } from 'vue'
import BaseIcon from '@/components/icons/BaseIcon.vue'
import { useUserModeStore } from '@/stores/userModeStore';
import { useEditorStore } from '@/stores/editorStore';

// const uiStore = useUiStore()
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
 * Computes the logo source based on the current theme.
 */
// const logoSrc = computed(() => {
//   return uiStore.theme === 'dark' ? FigurioLogoDark : FigurioLogoLight
// })

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

/** Christmas lights data (evenly spaced on a string) */
const lights = ref(
  Array.from({ length: 30 }, (_, i) => ({
    left: (i / 29) * 100 + '%', // evenly spaced
    color: ['#ff5757', '#ffd257', '#7cff8a', '#57c9ff', '#c57fff'][Math.floor(Math.random() * 5)],
    delay: Math.random() * 2.5 + 's'
  }))
);

const getLightPosition = (index, total, color, delay) => {
  const svg = document.querySelector('.lights-svg')
  const path = svg?.querySelector('#light-path')
  if (!path) return {}

  const t = index / (total - 1)
  const length = path.getTotalLength()
  const point = path.getPointAtLength(length * t)

  // bounding box of the rendered SVG
  const rect = svg.getBoundingClientRect()

  // convert SVG coordinates → screen pixel coordinates
  const x = rect.left + (point.x / 100) * rect.width
  const y = rect.top + (point.y / 80) * rect.height

  return {
    left: x + 'px',
    top: (y - 6) + 'px',
    backgroundColor: color,
    animationDelay: delay
  }
}
</script>

<template>
  <div class="top-panel">
    <!-- Snow animation -->
    <div class="snow-container" v-if="editorStore.randomEvents.snowfall">
      <div v-for="(flake, index) in snowflakes" :key="index" class="snowflake" :style="{
        left: flake.left,
        fontSize: flake.size,
        animationDuration: flake.duration,
        animationDelay: flake.delay
      }">
        ❄
      </div>
    </div>

    <!-- Christmas lights -->
    <div class="lights-container" v-if="editorStore.randomEvents.christmasLights">

      <!-- Cable curve -->
      <svg class="lights-svg" viewBox="0 0 100 80" preserveAspectRatio="none">
        <path id="light-path" d="M 0 15 Q 50 35 100 15" fill="none" stroke="rgba(80,80,80,0.8)" stroke-width="2" />
      </svg>

      <!-- Bulbs following the path -->
      <div v-for="(l, i) in lights" :key="'light-' + i" class="light-bulb"
        :style="getLightPosition(i, lights.length, l.color, l.delay)">
      </div>

    </div>

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
  color: var(--text-c);
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

.lights-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 40px;
  pointer-events: none;
  z-index: 999999;
}

.lights-svg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 40px;
  overflow: visible;
  pointer-events: none;
}

.light-bulb {
  position: absolute;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  opacity: 0.8;
  animation: bulbGlow 1.6s infinite ease-in-out alternate;
  box-shadow: 0 0 8px currentColor;
}

@keyframes bulbGlow {
  0% {
    opacity: 0.4;
    transform: translateX(-50%) scale(0.95);
    box-shadow: 0 0 4px currentColor;
  }

  100% {
    opacity: 1;
    transform: translateX(-50%) scale(1.1);
    box-shadow: 0 0 14px currentColor;
  }
}
</style>
