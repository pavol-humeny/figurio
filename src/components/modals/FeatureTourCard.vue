<script setup>
import { ref, onMounted } from 'vue'
import BaseIcon from '../icons/BaseIcon.vue'

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
})

/**
 * Reference to the video element
 */
const videoRef = ref(null)

/**
 * Try to play the video on mount
 */
onMounted(() => {
  // Try to play again if browser blocks autoplay
  videoRef.value?.play().catch(() => { })
})

</script>

<template>
  <div class="feature-card">
    <!-- Video -->
    <div class="video-wrapper">
      <video ref="videoRef" class="video-preview" :src="videoSrc" autoplay loop muted playsinline></video>
    </div>

    <!-- Text -->
    <div class="card-content-wrapper">
      <div class="feature-title">
        <BaseIcon :name="props.icon" size="40" color="var(--primary-c)" />
        <p>{{ props.title }}</p>
      </div>
      <div class="feature-description">{{ props.description }}</div>
    </div>
  </div>
</template>

<style scoped>
.feature-card {
  width: 100%;
  height: 100%;
  border-radius: 20px;
  background: var(--secondary-c);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  user-select: none;
}

.video-wrapper {
  width: 100%;
  height: 65%;
  border-top-left-radius: 18px;
  border-top-right-radius: 18px;
  overflow: hidden;
}

.video-preview {
  width: 100%;
  height: 100%;
  object-fit: fill;
  background: black;
}

.card-content-wrapper {
  width: 100%;
  height: 35%;
  display: flex;
  flex-direction: column;
  align-items: start;
  padding: 40px 45px;
  gap: 20px;
}

.feature-title {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.feature-title p {
  font-size: 32px;
  font-weight: var(--title-font-weight);
  color: var(--primary-c);
}

.feature-description {
  width: 40%;
  font-size: 18px;
  color: var(--text-c);
}
</style>
