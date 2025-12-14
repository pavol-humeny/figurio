<script setup>
import { onMounted, onBeforeUnmount, ref, watch } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

const container = ref(null)
const blinkSpeed = ref(1.0)
const bulbCount = ref(200)
const blinkEnabled = ref(true)
const whiteLights = ref(false)

let scene, camera, renderer, controls, animationId
let raycaster, mouse
let draggedOrnament = null
let treeMesh = null

const lights = []
const ornaments = []

const lightColors = ['#ff0000', '#00ffcc', '#ffff00', '#ff00ff']

// Lowered scene baseline
const BASE_Y = -0.8

// Tree dimensions
const TREE_HEIGHT = 4.5
const TREE_RADIUS = 2.2
const TRUNK_HEIGHT = 1.2
const TREE_OFFSET_Y = TRUNK_HEIGHT + BASE_Y

const STAR_SIZE = 0.45
const STAR_Y = TREE_OFFSET_Y + TREE_HEIGHT + STAR_SIZE * 0.6
const ORNAMENT_RADIUS = 0.18

/* --------------------------------------------------
   CHRISTMAS LIGHTS
-------------------------------------------------- */
function createTree(numBulbs = 200) {
  lights.forEach(b => scene.remove(b))
  lights.length = 0

  const turns = 8

  for (let i = 0; i < numBulbs; i++) {
    const originalColor = lightColors[i % lightColors.length]

    const bulb = new THREE.Mesh(
      new THREE.SphereGeometry(0.08, 8, 8),
      new THREE.MeshStandardMaterial({
        color: originalColor,
        emissive: originalColor,
        emissiveIntensity: 0
      })
    )

    const t = i / numBulbs
    const y = TREE_OFFSET_Y + t * TREE_HEIGHT
    const radiusAtH = TREE_RADIUS * (1 - t)
    const angle = t * Math.PI * 2 * turns

    const x = Math.cos(angle) * radiusAtH
    const z = Math.sin(angle) * radiusAtH

    const normal = new THREE.Vector3(x, TREE_RADIUS / TREE_HEIGHT, z).normalize()

    bulb.position.set(x, y, z).add(normal.multiplyScalar(0.06))
    bulb.userData = { t, base: 0.25, originalColor }

    scene.add(bulb)
    lights.push(bulb)
  }

  applyLightColors()
}

function applyLightColors() {
  lights.forEach(b => {
    const c = whiteLights.value ? '#ffffff' : b.userData.originalColor
    b.material.color.set(c)
    b.material.emissive.set(c)
  })
}

/* --------------------------------------------------
   ORNAMENT BOX
-------------------------------------------------- */
function createOrnamentsBox() {
  const box = new THREE.Mesh(
    new THREE.BoxGeometry(2.4, 0.6, 1.6),
    new THREE.MeshStandardMaterial({ color: '#8b4513' })
  )
  box.position.set(-3.2, BASE_Y + 0.3, 0)
  scene.add(box)

  const colors = [
    '#ff0000', '#ffd700', '#00ff00', '#00aaff', '#ff00ff',
    '#ff8800', '#ffffff', '#00ffcc', '#aa00ff', '#ff5555'
  ]

  colors.forEach((color, i) => {
    const ball = new THREE.Mesh(
      new THREE.SphereGeometry(ORNAMENT_RADIUS, 16, 16),
      new THREE.MeshStandardMaterial({
        color,
        metalness: 0.6,
        roughness: 0.3
      })
    )

    ball.position.set(
      -3.2 + (i % 5) * 0.45 - 0.9,
      BASE_Y + 0.7,
      Math.floor(i / 5) * 0.45 - 0.4
    )

    ball.userData.isOrnament = true
    scene.add(ball)
    ornaments.push(ball)
  })
}

/* --------------------------------------------------
   DRAG & DROP (PROPER CONE SNAP)
-------------------------------------------------- */
function updateMouse(event) {
  mouse.x = (event.offsetX / container.value.clientWidth) * 2 - 1
  mouse.y = -(event.offsetY / container.value.clientHeight) * 2 + 1
}

function onPointerDown(e) {
  updateMouse(e)
  raycaster.setFromCamera(mouse, camera)

  const hits = raycaster.intersectObjects(ornaments)
  if (hits.length) {
    draggedOrnament = hits[0].object
    controls.enabled = false
  }
}

function onPointerMove(e) {
  if (!draggedOrnament) return

  updateMouse(e)
  raycaster.setFromCamera(mouse, camera)

  // Try to snap directly onto the cone surface
  const hit = raycaster.intersectObject(treeMesh)
  if (hit.length) {
    draggedOrnament.position.copy(hit[0].point)
  }
}

function onPointerUp() {
  draggedOrnament = null
  controls.enabled = true
}

/* --------------------------------------------------
   MOUNT
-------------------------------------------------- */
onMounted(() => {
  scene = new THREE.Scene()
  raycaster = new THREE.Raycaster()
  mouse = new THREE.Vector2()

  camera = new THREE.PerspectiveCamera(
    75,
    container.value.clientWidth / container.value.clientHeight,
    0.1,
    1000
  )
  camera.position.set(0, 2.0, 7)

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setSize(container.value.clientWidth, container.value.clientHeight)
  renderer.setPixelRatio(window.devicePixelRatio)
  container.value.appendChild(renderer.domElement)

  scene.add(new THREE.AmbientLight('#ffffff', 0.8))
  const dir = new THREE.DirectionalLight('#ffffff', 0.6)
  dir.position.set(3, 6, 4)
  scene.add(dir)

  // Tree
  treeMesh = new THREE.Mesh(
    new THREE.ConeGeometry(TREE_RADIUS, TREE_HEIGHT, 48),
    new THREE.MeshStandardMaterial({ color: '#0b8f2f' })
  )
  treeMesh.position.y = TREE_OFFSET_Y + TREE_HEIGHT / 2
  scene.add(treeMesh)

  // Trunk
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.35, 0.35, TRUNK_HEIGHT, 16),
    new THREE.MeshStandardMaterial({ color: '#5a3b1e' })
  )
  trunk.position.y = BASE_Y + TRUNK_HEIGHT / 2
  scene.add(trunk)

  // Star
  const star = new THREE.Mesh(
    new THREE.IcosahedronGeometry(STAR_SIZE),
    new THREE.MeshStandardMaterial({
      color: '#ffd700',
      emissive: '#ffcc33',
      emissiveIntensity: 0.8
    })
  )
  star.position.y = STAR_Y
  scene.add(star)

  createTree(bulbCount.value)
  createOrnamentsBox()

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.enablePan = false
  controls.target.set(0, TREE_OFFSET_Y + TREE_HEIGHT / 2, 0)

  renderer.domElement.addEventListener('pointerdown', onPointerDown)
  renderer.domElement.addEventListener('pointermove', onPointerMove)
  renderer.domElement.addEventListener('pointerup', onPointerUp)

  const animate = () => {
    animationId = requestAnimationFrame(animate)
    controls.update()

    if (blinkEnabled.value) {
      const t = Date.now() * 0.001 * blinkSpeed.value
      lights.forEach(b => {
        let d = Math.abs(b.userData.t - (t * 0.25) % 1)
        d = Math.min(d, 1 - d)
        b.material.emissiveIntensity =
          b.userData.base + Math.max(0, 1 - d / 0.12) * 1.4
      })
    }

    renderer.render(scene, camera)
  }
  animate()
})

onBeforeUnmount(() => cancelAnimationFrame(animationId))

watch(bulbCount, v => createTree(v))
watch(whiteLights, applyLightColors)
</script>


<template>
  <div class="wrapper">
    <div class="christmas-tree-wrapper" ref="container"></div>

    <div class="ui-panel">
      <label>Rýchlosť pohybu: {{ blinkSpeed }}</label>
      <input type="range" min="0.2" max="5" step="0.1" v-model="blinkSpeed" />
      <br />

      <label>Počet svetielok: {{ bulbCount }}</label>
      <input type="range" min="50" max="500" step="10" v-model="bulbCount" />
      <br />

      <label>Animácia zap./vyp.:</label>
      <input type="checkbox" v-model="blinkEnabled" />
      <br />

      <label>Biele svetielka:</label>
      <input type="checkbox" v-model="whiteLights" />
    </div>
  </div>
</template>

<style scoped>
.wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.christmas-tree-wrapper {
  flex: 1;
  overflow: hidden;
}

.ui-panel {
  background: var(--background-c);
  padding: 20px 30px;
  border-radius: 8px;
  border: 1px solid var(--border-c);
}
</style>
