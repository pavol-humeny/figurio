<script setup>
/**
 * @file: SnowFall.vue
 * @author: Pavol Humeny
 * @date: 15.5.2026
 * @description: Component for the snow fall animation. It generates snowflakes with random properties (size, speed, delay) and animates them falling down the screen using CSS animations.
 * @note: This component was generated with the assistance of AI as a decorative element. It is included purely for visual purposes and is not considered as a part of the core application implementation.
 */
import { ref } from 'vue'

/**
 * Generate snowflakes with random properties
 */
const snowflakes = ref(
  Array.from({ length: 30 }, () => ({
    left: Math.random() * 100 + '%',
    size: Math.random() * 1 + 0.5 + 'rem',
    duration: Math.random() * 5 + 5 + 's',
    delay: Math.random() * 5 + 's',
  })),
)
</script>

<template>
  <div class="snow-container">
    <div v-for="(flake, index) in snowflakes" :key="index" class="snowflake" :style="{
      left: flake.left,
      fontSize: flake.size,
      animationDuration: flake.duration,
      animationDelay: flake.delay,
    }">
      ❄
    </div>
  </div>
</template>

<style scoped>
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
  color: var(--text-c) !important;
  user-select: none;
  animation-name: fall;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
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
