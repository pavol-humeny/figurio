<script setup>
import { ref, computed } from 'vue'
import { useFeatureTourModal } from '@/composables/modals/useFeatureTourModal'
import FeatureTourCard from './FeatureTourCard.vue'
import { useVideoLoader } from '@/composables/modals/useVideoLoader.js'
import { useI18n } from 'vue-i18n'

const { getVideo } = useVideoLoader()
const { messages, locale } = useI18n()
/**
 * Logic of the feature tour modal state
 */
const {
  isVisible,
  closeFeatureTourModal,
  activeVideos
} = useFeatureTourModal()

/**
 * All slides from i18n with video sources
 */
const allSlides = computed(() => {
  const featureTour = messages.value[locale.value]?.featureTour || []
  return featureTour.map(f => ({
    icon: f.icon,
    title: f.title,
    description: f.description,
    videoSrc: getVideo(f.video),
    videoKey: f.video
  }))
})

/**
 * Slides to display based on currently activeVideos
 * If activeVideos is empty, display all slides
 */
const slides = computed(() => {
  if (!activeVideos.value.length) return allSlides.value
  return allSlides.value.filter(slide => activeVideos.value.includes(slide.videoKey))
})
/**
 * Current card index
 */
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
 * Close the feature tour modal and reset the current card index
 */
const closeFeatureTourModalWrapper = () => {
  closeFeatureTourModal()
  currentCard.value = 0
}
</script>

<template>
  <Teleport to="body">
    <div v-if="isVisible" class="feature-tour-modal-overlay modal-overlay" @mousedown.self="closeFeatureTourModalWrapper">
      <div class="modal-box">

        <div class="card-wrapper">

          <!-- Current card -->
          <transition name="fade" mode="out-in">
            <FeatureTourCard :key="currentCard" :icon="slides[currentCard].icon" :title="slides[currentCard].title"
              :description="slides[currentCard].description" :videoSrc="slides[currentCard].videoSrc"
              :videoKey="slides[currentCard].videoKey" />
          </transition>

          <!-- Close cross -->
          <p class="navigation-cross" @click="closeFeatureTourModalWrapper">
            ✕
          </p>

          <!-- Left arrow -->
          <p v-if="slides.length > 1" class="navigation-arrow left" @click="prev">
            ‹
          </p>

          <!-- Right arrow -->
          <p v-if="slides.length > 1" class="navigation-arrow right" @click="next">
            ›
          </p>

          <!-- Dots -->
          <div v-if="slides.length > 1" class="dots">
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
  z-index: var(--z-index-feature-tour);
}

.modal-box {
  width: 60%;
  aspect-ratio: 16 / 13;
  max-height: 85vh;
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
