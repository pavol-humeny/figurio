<script setup>
import { ref } from 'vue'
import { useFeatureTourModal } from '@/composables/modals/useFeatureTourModal'
import FeatureTourCard from './FeatureTourCard.vue'

import cropVideo from '@/assets/videos/crop.mp4'

// Pole kariet (môžeš si ho neskôr ťahať z i18n)
const slides = ref([
  {
    icon: 'IconCropTool',
    title: 'Crop tool',
    description: 'This is crop tool',
    videoSrc: cropVideo
  },
  {
    icon: 'IconBrush',
    title: 'Brush',
    description: 'Simple brush demo',
    videoSrc: cropVideo
  },
  {
    icon: 'IconShapeTool',
    title: 'Shape',
    description: 'Work with layers easily',
    videoSrc: cropVideo
  }
])

const currentCard = ref(0)

/**
 * Navigate to the next card
 */
const next = () => {
  currentCard.value = (currentCard.value + 1) % slides.value.length
}

/**
 * Navigate to the previous card
 */
const prev = () => {
  currentCard.value =
    (currentCard.value - 1 + slides.value.length) % slides.value.length
}

/**
 * Logic of the feature tour modal state
 */
const { isVisible, closeFeatureTourModal } = useFeatureTourModal()
</script>

<template>
  <Teleport to="body">
    <div v-if="isVisible" class="feature-tour-modal-overlay" @mousedown.self="closeFeatureTourModal">
      <div class="modal-box">

        <div class="card-wrapper">

          <!-- Current card -->
          <transition name="fade" mode="out-in">
            <FeatureTourCard :key="currentCard" :icon="slides[currentCard].icon" :title="slides[currentCard].title"
              :description="slides[currentCard].description" :videoSrc="slides[currentCard].videoSrc" />
          </transition>

          <!-- Close cross -->
          <p class="navigation-cross" @click="closeFeatureTourModal">
            ✕
          </p>

          <!-- Left arrow -->
          <p class="navigation-arrow left" @click="prev">
            ‹
          </p>

          <!-- Right arrow -->
          <p class="navigation-arrow right" @click="next">
            ›
          </p>

          <!-- Dots -->
          <div class="dots">
            <span v-for="(s, i) in slides" :key="i" class="dot" :class="{ active: i === currentCard }"
              @click="currentCard = i"></span>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.feature-tour-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: var(--overlay-c);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: var(--z-index-feature-tour);
  min-width: var(--min-window-width);
  min-height: var(--min-window-height);
}

.modal-box {
  width: 70%;
  height: 80%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  background: var(--secondary-c);
  border-radius: 20px;
  border: var(--border-modal);
  box-shadow: var(--box-shadow-ui);
}

.card-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  position: relative;
}

/* Arrows */
.navigation-arrow {
  position: absolute;
  bottom: 15px;
  font-size: 38px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  color: var(--primary-c);
  user-select: none;
}

.navigation-cross {
  position: absolute;
  font-size: 23px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  color: var(--primary-c);
  user-select: none;
  top: 15px;
  right: 20px;
  font-weight: bold;
}

.navigation-arrow.left {
  left: 20px;
}

.navigation-arrow.right {
  right: 20px;
}

/* Dots */
.dots {
  position: absolute;
  bottom: 25px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 10px;
  z-index: 10;
}

.dot {
  width: 12px;
  height: 12px;
  background: var(--background-c);
  border-radius: 50%;
  cursor: pointer;
  transition: 0.2s;
}

.dot.active {
  background: var(--primary-c);
  transform: scale(1.1);
}

/* Fade animation */
.fade-enter-from,
.fade-leave-to {
  opacity: 0.5;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
</style>
