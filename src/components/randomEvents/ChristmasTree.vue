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
const lights = []

const lightColors = ['#ff0000', '#00ffcc', '#ffff00', '#ff00ff']

// Tree dimensions
const TREE_HEIGHT = 4.5
const TREE_RADIUS = 2.2
const TRUNK_HEIGHT = 1.2
const TREE_OFFSET_Y = TRUNK_HEIGHT
const STAR_SIZE = 0.45
const STAR_Y = TRUNK_HEIGHT + TREE_HEIGHT + STAR_SIZE * 0.6


// Create bulbs distributed in a spiral on cone surface
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

    const localY = t * TREE_HEIGHT
    const y = TREE_OFFSET_Y + localY
    const radiusAtH = TREE_RADIUS * (1 - t)
    const angle = t * Math.PI * 2 * turns

    const x = Math.cos(angle) * radiusAtH
    const z = Math.sin(angle) * radiusAtH

    const normal = new THREE.Vector3(x, TREE_RADIUS / TREE_HEIGHT, z).normalize()

    bulb.position
      .set(x, y, z)
      .add(normal.multiplyScalar(0.06))

    bulb.userData = {
      t,
      base: 0.25,
      originalColor
    }

    scene.add(bulb)
    lights.push(bulb)
  }

  applyLightColors()
}

// Apply white / colored mode
function applyLightColors() {
  lights.forEach(b => {
    const color = whiteLights.value ? '#ffffff' : b.userData.originalColor
    b.material.color.set(color)
    b.material.emissive.set(color)
  })
}

onMounted(() => {
  scene = new THREE.Scene()

  // Camera
  camera = new THREE.PerspectiveCamera(
    75,
    container.value.clientWidth / container.value.clientHeight,
    0.1,
    1000
  )
  camera.position.set(0, 2.8, 7)

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setSize(container.value.clientWidth, container.value.clientHeight)
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.shadowMap.enabled = true
  container.value.appendChild(renderer.domElement)

  // Lights
  scene.add(new THREE.AmbientLight('#ffffff', 0.8))
  const dirLight = new THREE.DirectionalLight('#ffffff', 0.6)
  dirLight.position.set(3, 6, 4)
  scene.add(dirLight)

  // Shadow
  const shadowTexture = new THREE.TextureLoader().load(
    'https://threejs.org/examples/textures/roundshadow.png'
  )
  const shadowMat = new THREE.MeshBasicMaterial({
    map: shadowTexture,
    transparent: true,
    opacity: 0.4
  })
  const shadowPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(6, 6),
    shadowMat
  )
  shadowPlane.rotation.x = -Math.PI / 2
  shadowPlane.position.y = 0.01
  scene.add(shadowPlane)

  // Tree
  const treeMaterial = new THREE.MeshStandardMaterial({ color: '#0b8f2f' })
  const tree = new THREE.Mesh(
    new THREE.ConeGeometry(TREE_RADIUS, TREE_HEIGHT, 48),
    treeMaterial
  )
  tree.position.y = TRUNK_HEIGHT + TREE_HEIGHT / 2
  scene.add(tree)

  // Trunk
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.35, 0.35, TRUNK_HEIGHT, 16),
    new THREE.MeshStandardMaterial({ color: '#5a3b1e' })
  )
  trunk.position.y = TRUNK_HEIGHT / 2
  scene.add(trunk)

  // Star (golden)
  const starGeometry = new THREE.IcosahedronGeometry(STAR_SIZE, 0)
  const starMaterial = new THREE.MeshStandardMaterial({
    color: '#ffd700',
    emissive: '#ffcc33',
    emissiveIntensity: 0.8,
    metalness: 0.9,
    roughness: 0.2
  })

  const star = new THREE.Mesh(starGeometry, starMaterial)
  star.position.set(0, STAR_Y, 0)
  scene.add(star)

  // Initial bulbs
  createTree(bulbCount.value)

  // Controls
  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.enablePan = false
  controls.minDistance = 4
  controls.maxDistance = 9
  controls.target.set(0, TRUNK_HEIGHT + TREE_HEIGHT / 2, 0)

  // Animation loop
  const animate = () => {
    animationId = requestAnimationFrame(animate)
    controls.update()

    if (blinkEnabled.value) {
      const time = Date.now() * 0.001 * blinkSpeed.value

      const waveWidth = 0.12
      const waveSpeed = 0.25

      lights.forEach(b => {
        const d = b.userData

        const wavePos = (time * waveSpeed) % 1
        let dist = Math.abs(d.t - wavePos)
        dist = Math.min(dist, 1 - dist)

        const wave = Math.max(0, 1 - dist / waveWidth)
        b.material.emissiveIntensity = d.base + wave * 1.4
      })

      // Star subtle shimmer
      const starTime = Date.now() * 0.002
      star.material.emissiveIntensity =
        0.7 + Math.sin(starTime) * 0.15

      star.rotation.y += 0.002
    } else {
      lights.forEach(b => (b.material.emissiveIntensity = 0))
    }

    renderer.render(scene, camera)
  }
  animate()

  // Resize
  const handleResize = () => {
    const { clientWidth, clientHeight } = container.value
    camera.aspect = clientWidth / clientHeight
    camera.updateProjectionMatrix()
    renderer.setSize(clientWidth, clientHeight)
  }

  window.addEventListener('resize', handleResize)

  onBeforeUnmount(() => {
    cancelAnimationFrame(animationId)
    renderer.dispose()
    window.removeEventListener('resize', handleResize)
  })
})

// UI watchers
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
