<script setup>
import { onMounted, onBeforeUnmount, ref, watch } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

const container = ref(null)
const blinkSpeed = ref(1.0)       // multiplier pre rýchlosť blikania
const bulbCount = ref(200)        // počet svetielok
const blinkEnabled = ref(true)    // zapnuté/vypnuté blikanie

let scene, camera, renderer, controls, animationId
const lights = []
const lightColors = ['#ff0000', '#00ffcc', '#ffff00', '#ff00ff']
const cones = []

// Funkcia na vytvorenie stromu a svetielok
function createTree(numBulbs = 200) {
  // Odstráni staré svetielka
  lights.forEach(b => scene.remove(b))
  lights.length = 0

  const coneSections = [
    { height: 2.5, radius: 2, baseY: 2 },
    { height: 2.2, radius: 1.6, baseY: 3.3 },
    { height: 1.8, radius: 1.2, baseY: 4.3 }
  ]

  function coneSurfaceArea(radius, height) {
    const slant = Math.sqrt(radius * radius + height * height)
    return Math.PI * radius * slant
  }
  const areas = coneSections.map(s => coneSurfaceArea(s.radius, s.height))
  const totalArea = areas.reduce((a, b) => a + b, 0)
  const bulbsPerSection = areas.map(a => Math.round(numBulbs * (a / totalArea)))

  for (let s = 0; s < coneSections.length; s++) {
    const section = coneSections[s]
    const count = bulbsPerSection[s]
    for (let i = 0; i < count; i++) {
      const bulb = new THREE.Mesh(
        new THREE.SphereGeometry(0.09, 8, 8),
        new THREE.MeshStandardMaterial({
          color: lightColors[i % lightColors.length],
          emissive: lightColors[i % lightColors.length],
          emissiveIntensity: 0
        })
      )
      const u = Math.random(), localH = Math.sqrt(u) * section.height
      const radiusAtH = section.radius * (1 - localH / section.height)
      const angle = Math.random() * Math.PI * 2
      const x = Math.cos(angle) * radiusAtH
      const y = section.baseY - section.height / 2 + localH
      const z = Math.sin(angle) * radiusAtH
      bulb.position.set(x, y, z)
      bulb.position.sub(new THREE.Vector3(x, 0, z).normalize().multiplyScalar(0.05))
      bulb.userData = { speed: 0.002 + Math.random() * 0.004, offset: Math.random() * 10 }
      scene.add(bulb)
      lights.push(bulb)
    }
  }
}

onMounted(() => {
  scene = new THREE.Scene()

  // Camera
  camera = new THREE.PerspectiveCamera(75, container.value.clientWidth / container.value.clientHeight, 0.1, 1000)
  camera.position.set(0, 2.8, 6)

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setSize(container.value.clientWidth, container.value.clientHeight)
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  container.value.appendChild(renderer.domElement)

  // Lights
  scene.add(new THREE.AmbientLight('#ffffff', 0.8))
  const dirLight = new THREE.DirectionalLight('#ffffff', 0.6)
  dirLight.position.set(3, 6, 4)
  dirLight.castShadow = true
  scene.add(dirLight)

  // Shadow plane
  const shadowTexture = new THREE.TextureLoader().load('https://threejs.org/examples/textures/roundshadow.png')
  const shadowMat = new THREE.MeshBasicMaterial({ map: shadowTexture, transparent: true, opacity: 0.4 })
  const shadowPlane = new THREE.Mesh(new THREE.PlaneGeometry(6, 6), shadowMat)
  shadowPlane.rotation.x = -Math.PI / 2
  shadowPlane.position.y = 0.01
  scene.add(shadowPlane)

  // Tree
  const treeMaterial = new THREE.MeshStandardMaterial({ color: '#0b8f2f' })
  const cone1 = new THREE.Mesh(new THREE.ConeGeometry(2, 2.5, 32), treeMaterial)
  cone1.position.y = 2; scene.add(cone1); cones.push(cone1)
  const cone2 = new THREE.Mesh(new THREE.ConeGeometry(1.6, 2.2, 32), treeMaterial)
  cone2.position.y = 3.3; scene.add(cone2); cones.push(cone2)
  const cone3 = new THREE.Mesh(new THREE.ConeGeometry(1.2, 1.8, 32), treeMaterial)
  cone3.position.y = 4.3; scene.add(cone3); cones.push(cone3)
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 1.2, 16), new THREE.MeshStandardMaterial({ color: '#5a3b1e' }))
  trunk.position.y = 0.6; scene.add(trunk)

  // Inicializacia svetielok
  createTree(bulbCount.value)

  // Orbit controls
  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.enablePan = false
  controls.minDistance = 4
  controls.maxDistance = 8
  controls.target.set(0, 3, 0)

  // Animate
  const animate = () => {
    animationId = requestAnimationFrame(animate)
    controls.update()
    if (blinkEnabled.value) {
      lights.forEach(b => {
        const t = Date.now() * b.userData.speed * blinkSpeed.value + b.userData.offset
        b.material.emissiveIntensity = Math.abs(Math.sin(t)) * 1.5
      })
    } else {
      lights.forEach(b => b.material.emissiveIntensity = 0)
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

// Watchers pre UI ovladace
watch(bulbCount, (v) => { createTree(v) })
</script>

<template>
  <div class="wrapper">
    <div class="christmas-tree-wrapper" ref="container"></div>

    <div class="ui-panel">
      <label>Rýchlosť blikania: {{ blinkSpeed }}</label>
      <input type="range" min="0.1" max="5" step="0.1" v-model="blinkSpeed" />
      <br />
      <label>Počet svetielok: {{ bulbCount }}</label>
      <input type="range" min="50" max="500" step="10" v-model="bulbCount" />
      <br />
      <label>Blikanie zap./vyp.:</label>
      <input type="checkbox" v-model="blinkEnabled" />
    </div>
  </div>
</template>

<style scoped>
.wrapper {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}

.christmas-tree-wrapper {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.ui-panel {
  background: var(--background-c);
  padding: 20px 30px;
  border-radius: 8px;
  border: 1px solid var(--border-c);
}

/* color of slider */
input[type="range"]::-webkit-slider-thumb {
  background: var(--primary-c);
}

input[type="range"]::-moz-range-thumb {
  background: var(--primary-c);
}

/* track */
input[type="range"]::-webkit-slider-runnable-track {
  background: var(--secondary-c);
}

input[type="range"]::-moz-range-track {
  background: var(--secondary-c);
}
</style>
