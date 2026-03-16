<template>
  <div ref="container" class="fireworks"></div>
</template>

<script setup>
/**
 * @file: FireWorks2.vue
 * @author: Pavol Humeny
 * @date: 15.5.2026
 * @description: Component for the fireworks animation using the fireworks-js library. It creates a canvas that covers the entire screen and renders fireworks with customizable options for intensity, particles, explosion, and colors. The fireworks are launched in waves with different styles to create a dynamic and festive atmosphere.
 * @note: This component was generated with the assistance of AI as a decorative element. It is included purely for visual purposes and is not considered as a part of the core application implementation.
 */
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { Fireworks } from 'fireworks-js'

const container = ref(null)
let fireworks = null
let waveInterval = null

onMounted(() => {
  fireworks = new Fireworks(container.value, {
    autoresize: true,
    opacity: 0.7,
    gravity: 1.8,
    friction: 0.92,
    particles: 50,
    intensity: 35,
    traceSpeed: 15,
    explosion: 5,
    hue: { min: 0, max: 360 },
  })

  fireworks.start()
  startFastShow()
})

onBeforeUnmount(() => {
  clearInterval(waveInterval)
  fireworks?.stop(true)
})

function startFastShow() {
  let phase = 0

  waveInterval = setInterval(() => {
    phase++

    // rýchle prepínanie štýlov
    if (phase % 3 === 0) {
      fireworks.updateOptions({
        intensity: 50,
        particles: 90,
        explosion: 6,
      })
      fireworks.launch(8)
    }
    else if (phase % 3 === 1) {
      fireworks.updateOptions({
        intensity: 30,
        particles: 40,
        explosion: 4,
        hue: { min: 200, max: 300 },
      })
      fireworks.launch(5)
    }
    else {
      fireworks.updateOptions({
        intensity: 40,
        particles: 60,
        explosion: 5,
        hue: { min: 20, max: 80 },
      })
      fireworks.launch(7)
    }
  }, 1200) // 🔥 rýchle vlny (1.2s)
}
</script>

<style>
.fireworks {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 9999;
}
</style>
