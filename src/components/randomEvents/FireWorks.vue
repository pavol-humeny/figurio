<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

/* ===============================
   Canvas
================================ */
const canvas = ref(null)
let ctx = null
let rafId = null
let eventTimer = null

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
  ['#ffd166', '#ffb703'],
  ['#ff595e', '#f94144'],
  ['#4cc9f0', '#4895ef'],
  ['#cdb4db', '#9d4edd'],
  ['#ffffff'],
]

/* ===============================
   Firework shell
================================ */
class Firework {
  constructor(width, height, forcedX = null) {
    this.x = forcedX ?? rand(width * 0.1, width * 0.9)
    this.y = height
    this.vx = rand(-0.6, 0.6)
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
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(this.x, this.y, 2, 8)
  }

  shouldExplode() {
    return this.vy >= 0 || this.y <= this.explodeY
  }

  explode() {
    createExplosion(this.x, this.y, this.colors, pick(['peony', 'chrysanthemum', 'willow']))
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

    this.age = 0
    this.gravityDelay = rand(10, 25)
    this.gravityScale = 0
  }

  update() {
    this.age++
    this.vx *= AIR_DRAG
    this.vy *= AIR_DRAG

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
   Explosion
================================ */
function createExplosion(x, y, colors, type) {
  let count = 120
  let speedMin = 1.5
  let speedMax = 4
  let life = 120

  if (type === 'willow') {
    speedMin = 1
    speedMax = 2
    life = 200
  }

  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2
    const biased =
      angle > Math.PI
        ? angle + rand(-0.2, 0.2)
        : angle + rand(-0.35, 0.35)

    particles.push(
      new Particle(
        x,
        y,
        biased,
        rand(speedMin, speedMax),
        pick(colors),
        life + rand(-20, 20),
      ),
    )
  }
}

/* ===============================
   Launch patterns
================================ */
function launchSingle() {
  fireworks.push(new Firework(canvas.value.width, canvas.value.height))
}

function launchBurst() {
  const count = Math.floor(rand(15, 20))
  for (let i = 0; i < count; i++) {
    fireworks.push(new Firework(canvas.value.width, canvas.value.height))
  }
}

function launchWave() {
  const steps = 20
  for (let i = 0; i < steps; i++) {
    setTimeout(() => {
      const x = (canvas.value.width / steps) * i
      fireworks.push(new Firework(canvas.value.width, canvas.value.height, x))
    }, i * 120)
  }
}

function launchDoubleWave() {
  const steps = 20
  for (let i = 0; i < steps; i++) {
    setTimeout(() => {
      const x = (canvas.value.width / steps) * i
      fireworks.push(new Firework(canvas.value.width, canvas.value.height, x))
    }, i * 100)
  }
  for (let i = steps - 1; i >= 0; i--) {
    setTimeout(() => {
      const x = (canvas.value.width / steps) * i
      fireworks.push(new Firework(canvas.value.width, canvas.value.height, x))
    }, (steps + (steps - i)) * 100)
  }
}

function launchFinaleMini() {
  const duration = 3000
  const start = performance.now()

  function loop(time) {
    if (time - start > duration) return
    fireworks.push(new Firework(canvas.value.width, canvas.value.height))
    setTimeout(() => requestAnimationFrame(loop), 50)
  }

  requestAnimationFrame(loop)
}

/* ===============================
   Event scheduler
================================ */
function scheduleEvent() {
  const events = [
    launchSingle,
    launchSingle,
    launchBurst,
    launchWave,
    launchDoubleWave,
    launchFinaleMini,
  ]

  pick(events)()

  eventTimer = setTimeout(scheduleEvent, rand(1200, 2800))
}

/* ===============================
   Animation loop
================================ */
function animate() {
  rafId = requestAnimationFrame(animate)
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
    if (p.isDead()) particles.splice(i, 1)
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
  scheduleEvent()

  window.addEventListener('resize', () => {
    c.width = window.innerWidth
    c.height = window.innerHeight
  })
})

onBeforeUnmount(() => {
  cancelAnimationFrame(rafId)
  clearTimeout(eventTimer)
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
