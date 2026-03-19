<script setup>
/**
 * @file: InteractiveTutorial.vue
 * @author: Pavol Humeny
 * @date: 15.5.2026
 * @description: Component for the interactive tutorial. Renders the interactive tutorial that guides users through the features of the application. The tutorial consists of multiple steps, each highlighting a specific feature or area of the application with an overlay and a tooltip. Users can navigate through the steps using next and previous buttons, and can also close the tutorial at any time.
 */
import { useInteractiveTutorial } from '@/composables/tutorial/useInteractiveTutorial'
import BaseIcon from '../icons/BaseIcon.vue';
import { useI18n } from 'vue-i18n'
import { useUiStore } from '@/stores/uiStore'
import { useRouter } from 'vue-router'
import { useImageStore } from '@/stores/imageStore'

const { t } = useI18n()

/**
 * Logic for the interactive tutorial.
 */
const {
  isRunning,
  currentStep,
  activeStep,
  nextStep,
  prevStep,
  tutorialItemStyle,
  overlayStyles,
  tutorialItemRef,
  closeTutorial,
  numberOfSteps,
  finishTutorial,
} = useInteractiveTutorial(useUiStore(), useImageStore(), useRouter(), t)

</script>

<template>
  <teleport to="body">
    <div v-if="isRunning">
      <!-- Tutorial overlay -->
      <div class="tutorial-overlay" v-for="(style, key) in overlayStyles" :key="key" :style="style"></div>

      <!-- Click blocker -->
      <div class="tutorial-click-blocker"></div>

      <!-- Tutorial item -->
      <div class="tutorial-item" ref="tutorialItemRef" :style="tutorialItemStyle">
        <p class="tutorial-close" @click="closeTutorial()">✕</p>

        <p class="tutorial-title">{{ currentStep.title }}</p>
        <p class="tutorial-text">{{ currentStep.text }}</p>

        <div class="tutorial-buttons">
          <BaseIcon name="IconArrowLeft" size="22" @click="prevStep()" :color="'var(--primary-c)'"
            :class="{ 'tutorial-navigation': activeStep !== 0 }" :disabled="activeStep === 0" />

          <p class="tutorial-step-indicator">{{ activeStep + 1 }}/{{ numberOfSteps }}</p>

          <BaseIcon :name="activeStep + 1 === numberOfSteps ? 'IconTick' : 'IconArrowRight'" size="22"
            @click="activeStep + 1 === numberOfSteps ? finishTutorial() : nextStep()" :color="'var(--primary-c)'"
            class="tutorial-navigation" />
        </div>
      </div>
    </div>
  </teleport>
</template>

<style scoped>
.tutorial-item {
  position: absolute;
  background: var(--secondary-c);
  border: var(--border-modal);
  padding: 15px 20px;
  width: 330px;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  z-index: var(--z-index-tutorial-item);
}

.tutorial-title {
  font-size: var(--subtitle-font-size);
  font-weight: var(--subtitle-font-weight);
  color: var(--text-c);
  margin-bottom: 15px;
}

.tutorial-buttons {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
}

.tutorial-step-indicator {
  font-size: var(--text-font-size);
  color: var(--text-c);
  font-weight: var(--text-font-weight);
}

.tutorial-navigation {
  cursor: pointer;
}

.tutorial-overlay {
  position: fixed;
  background: var(--tutorial-overlay-c);
  z-index: var(--z-index-tutorial-overlay);
  pointer-events: auto;
}

.tutorial-close {
  position: absolute;
  top: 15px;
  right: 20px;
  cursor: pointer;
  color: var(--primary-c);
  font-weight: bold;
}

.tutorial-close:hover {
  opacity: 1;
}

.tutorial-click-blocker {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: var(--z-index-tutorial-click-blocker);
  background: transparent;
  pointer-events: all;
}
</style>
