<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

/* ===============================
   Canvas
================================ */
const canvas = ref(null)
let ctx = null
let rafId = null
let spawnInterval = null

/* ===============================
   Physics constants
================================ */
const GRAVITY = 0.03
const AIR_DRAG = 0.992

/* ===============================
   Collections
================================ */
const fireworks = []
const particles = []

/* ===============================
   Utils
================================ */
const rand = (min, max) => Math.random() * (max - min) + min
const pick = arr => arr[Math.floor(Math.random() * arr.length)]

/* ===============================
   Color palettes
================================ */
const COLOR_SETS = [
  ['#ffd166', '#ffb703'], // gold
  ['#ff595e', '#f94144'], // red
  ['#4cc9f0', '#4895ef'], // blue
  ['#cdb4db', '#9d4edd'], // violet
  ['#ffffff'], // white
]

/* ===============================
   Firework shell (rocket)
================================ */
class Firework {
  constructor(width, height) {
    this.x = rand(width * 0.2, width * 0.8)
    this.y = height
    this.vx = rand(-1.6, 1.6)
    this.vy = rand(-11.5, -14)
    this.explodeY = rand(height * 0.25, height * 0.65)
    this.colors = pick(COLOR_SETS)
  }

  update() {
    this.x += this.vx
    this.y += this.vy
    this.vy += GRAVITY * 0.35
    this.vx *= AIR_DRAG
  }

  draw() {
    ctx.fillStyle = this.colors
    ctx.fillRect(this.x, this.y, 2, 8)
  }

  shouldExplode() {
    return this.vy >= 0 || this.y <= this.explodeY
  }

  explode() {
    const type = pick(['peony', 'chrysanthemum', 'willow'])
    createExplosion(this.x, this.y, this.colors, type)
  }
}

/* ===============================
   Particle
================================ */
class Particle {
  constructor(x, y, angle, speed, color, life) {
    this.x = x
    this.y = y

    this.vx = Math.cos(angle) * speed
    this.vy = Math.sin(angle) * speed

    this.life = life
    this.remaining = life
    this.color = color
    this.size = rand(0.7, 2.2)

    // 🆕 realistic physics
    this.age = 0
    this.gravityDelay = rand(10, 25) // frames before gravity
    this.gravityScale = 0
  }

  update() {
    this.age++

    // air drag
    this.vx *= AIR_DRAG
    this.vy *= AIR_DRAG

    // gravity ramp-up
    if (this.age > this.gravityDelay) {
      this.gravityScale = Math.min(this.gravityScale + 0.04, 1)
      this.vy += GRAVITY * this.gravityScale
    }

    this.x += this.vx
    this.y += this.vy
    this.remaining--
  }

  draw() {
    ctx.globalAlpha = this.remaining / this.life
    ctx.fillStyle = this.color
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
    ctx.fill()
    ctx.globalAlpha = 1
  }

  isDead() {
    return this.remaining <= 0
  }
}

/* ===============================
   Explosion types
================================ */
function createExplosion(x, y, colors, type) {
  let count = 0
  let speedMin = 0
  let speedMax = 0
  let life = 0

  switch (type) {
    case 'peony':
      count = 120
      speedMin = 2.5
      speedMax = 4.2
      life = 100
      break

    case 'chrysanthemum':
      count = 160
      speedMin = 1.8
      speedMax = 3.6
      life = 130
      break

    case 'willow':
      count = 140
      speedMin = 1.0
      speedMax = 2.0
      life = 200
      break
  }

  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2

    // 🆕 slight upward / horizontal bias
    const biasedAngle =
      angle > Math.PI
        ? angle + rand(-0.2, 0.2)
        : angle + rand(-0.35, 0.35)

    particles.push(
      new Particle(
        x,
        y,
        biasedAngle,
        rand(speedMin, speedMax),
        pick(colors),
        life + rand(-20, 20),
      ),
    )
  }
}

/* ===============================
   Animation loop
================================ */
function animate() {
  rafId = requestAnimationFrame(animate)

  // transparent overlay
  ctx.clearRect(0, 0, canvas.value.width, canvas.value.height)

  for (let i = fireworks.length - 1; i >= 0; i--) {
    const fw = fireworks[i]
    fw.update()
    fw.draw()

    if (fw.shouldExplode()) {
      fw.explode()
      fireworks.splice(i, 1)
    }
  }

  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i]
    p.update()
    p.draw()

    if (p.isDead()) {
      particles.splice(i, 1)
    }
  }
}

/* ===============================
   Lifecycle
================================ */
onMounted(() => {
  const c = canvas.value
  ctx = c.getContext('2d')

  c.width = window.innerWidth
  c.height = window.innerHeight

  animate()

  spawnInterval = setInterval(() => {
    fireworks.push(new Firework(c.width, c.height))
  }, 450)

  window.addEventListener('resize', () => {
    c.width = window.innerWidth
    c.height = window.innerHeight
  })
})

onBeforeUnmount(() => {
  cancelAnimationFrame(rafId)
  clearInterval(spawnInterval)
})
</script>

<template>
  <canvas ref="canvas" class="fireworks-canvas" />
</template>

<style scoped>
.fireworks-canvas {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 1000000;
}
</style>
