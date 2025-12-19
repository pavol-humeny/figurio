<script setup>
import { ref, onMounted } from 'vue'

const svgRef = ref(null)
const pathRef = ref(null)

/**
 * Generate decorative light bulbs
 */
const lights = ref(
  Array.from({ length: 30 }, () => ({
    color: ['#ff5757', '#ffd257', '#7cff8a', '#57c9ff', '#c57fff'][
      Math.floor(Math.random() * 5)
    ],
  })),
)

const positions = ref([])

onMounted(() => {
  const path = pathRef.value
  if (!path) return

  const length = path.getTotalLength()

  positions.value = lights.value.map((l, i) => {
    const t = i / (lights.value.length - 1)
    const point = path.getPointAtLength(length * t)

    return {
      left: point.x + '%',
      top: point.y + '%',
      backgroundColor: l.color,
      /* glow delay, flicker delay */
      animationDelay: `${Math.random() * 2}s, ${Math.random() * 5}s`,
    }
  })
})
</script>

<template>
  <div class="lights-container">
    <svg ref="svgRef" class="lights-svg" viewBox="0 0 100 80" preserveAspectRatio="none">
      <path ref="pathRef" d="M 0 15 Q 50 35 100 15" fill="none" stroke="rgba(80,80,80,0.8)" stroke-width="2" />
    </svg>

    <div v-for="(style, i) in positions" :key="i" class="light-bulb" :style="style" />
  </div>
</template>

<style scoped>
.lights-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 40px;
  pointer-events: none;
  overflow: hidden;
}

.lights-svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.light-bulb {
  position: absolute;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  transform: translate(-50%, -30%);
  opacity: 0.95;
  box-shadow: 0 0 6px currentColor;

  animation:
    bulbGlow 1.8s ease-in-out infinite,
    bulbFlicker 3.5s linear infinite;
}

/* soft breathing glow */
@keyframes bulbGlow {
  0% {
    box-shadow: 0 0 4px currentColor;
    transform: translate(-50%, -30%) scale(0.95);
  }

  100% {
    box-shadow: 0 0 12px currentColor;
    transform: translate(-50%, -30%) scale(1.05);
  }
}

/* irregular blinking */
@keyframes bulbFlicker {
  0% {
    opacity: 1;
  }

  4% {
    opacity: 0.6;
  }

  7% {
    opacity: 1;
  }

  15% {
    opacity: 0.85;
  }

  22% {
    opacity: 1;
  }

  30% {
    opacity: 0.7;
  }

  33% {
    opacity: 1;
  }

  55% {
    opacity: 0.9;
  }

  60% {
    opacity: 0.5;
  }

  63% {
    opacity: 1;
  }

  100% {
    opacity: 0.95;
  }
}
</style>
