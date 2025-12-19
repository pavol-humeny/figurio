<script setup>
import { ref, onMounted } from 'vue'

const svgRef = ref(null)
const pathRef = ref(null)

const lights = ref(
  Array.from({ length: 30 }, () => ({
    color: ['#ff5757', '#ffd257', '#7cff8a', '#57c9ff', '#c57fff'][
      Math.floor(Math.random() * 5)
    ],
    delay: Math.random() * 2.5 + 's',
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
      left: (point.x) + '%',     // viewBox 0–100 → %
      top: (point.y) + '%',      // viewBox 0–80 → %
      backgroundColor: l.color,
      animationDelay: l.delay,
    }
  })
})
</script>


<template>
  <div class="lights-container">
    <svg ref="svgRef" class="lights-svg" viewBox="0 0 100 80" preserveAspectRatio="none">
      <path ref="pathRef" id="light-path" d="M 0 15 Q 50 35 100 15" fill="none" stroke="rgba(80,80,80,0.8)"
        stroke-width="2" />
    </svg>

    <div v-for="(style, i) in positions" :key="i" class="light-bulb" :style="style"> </div>
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
  animation: bulbGlow 1.6s infinite ease-in-out alternate;
  box-shadow: 0 0 8px currentColor;
}
</style>
