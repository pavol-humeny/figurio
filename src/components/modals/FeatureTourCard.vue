<script setup>
/**
 * @file: FeatureTourCard.vue
 * @author: Pavol Humeny
 * @date: 15.5.2026
 */
import { ref, onMounted } from 'vue'
import BaseIcon from '../icons/BaseIcon.vue'
import { globalConfig } from '@/config/globalConfig.js'

// Props for title, description and video source
const props = defineProps({
  icon: {
    type: String,
    default: '',
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  videoSrc: {
    type: String,
    required: true,
  },
  videoKey: {
    type: String,
    required: true,
  },
  hasNavigation: {
    type: Boolean,
    default: false,
  },
  index: {
    type: Number,
    default: 0,
  },
  total: {
    type: Number,
    default: 1,
  },
  isFirst: {
    type: Boolean,
    default: true,
  },
  isLast: {
    type: Boolean,
    default: true,
  }
})

/**
 * Reference to the video element
 */
const videoRef = ref(null)

/**
 * Update seen slides in localStorage
 * @param {string} key - video key
 */
const updateSeenSlides = (key) => {
  const seen = JSON.parse(localStorage.getItem(`${globalConfig.LOCAL_STORAGE_PREFIX}seenFeatureTour`) || '[]')
  if (!seen.includes(key)) {
    seen.push(key)
    localStorage.setItem(`${globalConfig.LOCAL_STORAGE_PREFIX}seenFeatureTour`, JSON.stringify(seen))
  }
}

/**
 * Try to play the video on mount
 */
onMounted(() => {
  // Try to play again if browser blocks autoplay
  videoRef.value?.play().catch(() => { })

  // Update seen slides
  updateSeenSlides(props.videoKey)
})

</script>

<template>
  <div class="feature-card">
    <!-- Cross -->
    <div class="card-header">
      <p class="navigation-cross" @click="$emit('close')">✕</p>
    </div>

    <!-- Video -->
    <div class="video-wrapper">
      <video ref="videoRef" class="video-preview" :src="videoSrc" autoplay loop muted playsinline></video>
    </div>

    <!-- Text -->
    <div class="card-content-wrapper">
      <div class="feature-title">
        <BaseIcon :name="props.icon" size="31" color="var(--primary-c)" />
        <p>{{ props.title }}</p>
      </div>
      <div class="feature-description">{{ props.description }}</div>
    </div>

    <!-- Navigation -->
    <div class="card-footer" v-if="hasNavigation">

      <button class="nav-btn" @click="$emit('prev')" :disabled="isFirst">
        ‹
      </button>

      <div class="dots">
        <span v-for="i in total" :key="i" class="dot" :class="{ active: i - 1 === index }"
          @click="$emit('goTo', i - 1)" />
      </div>

      <button class="nav-btn" @click="$emit('next')" :disabled="isLast">
        ›
      </button>

    </div>
  </div>
</template>

<style scoped>
.feature-card {
  width: min(1100px, 100%);
  max-height: 92vh;
  display: flex;
  flex-direction: column;
  border-radius: 20px;
  background: var(--background-c);
  border: var(--border-modal);
  overflow: hidden;
}

.card-header {
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 25px;
  border-bottom: 1px solid var(--primary-c);
}

.navigation-cross {
  font-size: 22px;
  cursor: pointer;
  color: var(--primary-c);
  user-select: none;
  font-weight: bold;
}

.video-wrapper {
  width: 100%;
  aspect-ratio: 16 / 9;
  max-height: 70vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #000;
}

.video-preview {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.card-content-wrapper {
  padding: 20px 30px;
  display: flex;
  flex-direction: column;
  gap: 15px;
  flex-grow: 1;
  border-top: 1px solid var(--primary-c);
}

.feature-title {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.feature-title p {
  font-size: clamp(1.1rem, 1.2vw, 1.5rem);
  font-weight: var(--title-font-weight);
  color: var(--primary-c);
}

.feature-description {
  font-size: clamp(0.9rem, 0.9vw, 1.05rem);
  color: var(--text-c);
  text-align: center;
}

.card-footer {
  padding: 10px 25px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-btn {
  font-size: 32px;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--primary-c);
  border-radius: 8px;
  transition: 0.2s;
}

.nav-btn:hover:not(:disabled) {
  background: rgba(0, 0, 0, 0.05);
}

.nav-btn:disabled {
  opacity: 0.3;
  cursor: default;
}

.dots {
  display: flex;
  gap: 10px;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--secondary-c);
  cursor: pointer;
  transition: 0.2s;
}

.dot.active {
  background: var(--primary-c);
  transform: scale(1.2);
}
</style>
