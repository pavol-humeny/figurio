<script setup>
/**
 * @file: FeatureTourModal.vue
 * @author: Pavol Humeny
 * @date: 15.5.2026
 * @description: Component for the feature tour modal. It shows a series of cards with videos, titles and descriptions of new features in the app. It allows navigation between cards and keeps track of seen slides in localStorage to only show new features to users.
 */
import { ref, computed } from 'vue'
import { useFeatureTourModal } from '@/composables/modals/useFeatureTourModal'
import FeatureTourCard from './FeatureTourCard.vue'
import { useVideoLoader } from '@/composables/modals/useVideoLoader.js'
import { useI18n } from 'vue-i18n'
import { useConsole } from '@/composables/common/useConsole'
const { warn } = useConsole()
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
  warn('Active videos for feature tour:', activeVideos.value)
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
    <div v-if="isVisible" class="feature-tour-modal-overlay modal-overlay"
      @mousedown.self="closeFeatureTourModalWrapper">
      <div class="modal-box">

        <div class="card-wrapper">

          <!-- Current card -->
          <FeatureTourCard :key="currentCard" :icon="slides[currentCard].icon" :title="slides[currentCard].title"
            :description="slides[currentCard].description" :videoSrc="slides[currentCard].videoSrc"
            :videoKey="slides[currentCard].videoKey" :hasNavigation="slides.length > 1" :isFirst="currentCard === 0"
            :isLast="currentCard === slides.length - 1" :total="slides.length" :index="currentCard"
            @close="closeFeatureTourModalWrapper" @next="next" @prev="prev" @goTo="i => currentCard = i" />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.feature-tour-modal-overlay {
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-index-feature-tour);
  background: var(--background-overlay-modal);
  backdrop-filter: var(--backdrop-filter-modal);
}

.modal-box {
  width: min(1200px, 92vw);
  max-height: 92vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: transparent;
}

.card-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  position: relative;
}
</style>
