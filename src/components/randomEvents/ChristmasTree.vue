<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

const container = ref(null)

let scene, camera, renderer, controls, animationId

onMounted(() => {
  scene = new THREE.Scene()

  // Camera
  camera = new THREE.PerspectiveCamera(
    75,
    container.value.clientWidth / container.value.clientHeight,
    0.1,
    1000
  )
  camera.position.set(0, 2.8, 6)

  // Transparent renderer
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true
  })
  renderer.setSize(container.value.clientWidth, container.value.clientHeight)
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  container.value.appendChild(renderer.domElement)

  // Lights
  const ambient = new THREE.AmbientLight('#ffffff', 0.8)
  scene.add(ambient)

  const dirLight = new THREE.DirectionalLight('#ffffff', 0.6)
  dirLight.position.set(3, 6, 4)
  dirLight.castShadow = true
  dirLight.shadow.mapSize.set(2048, 2048)
  scene.add(dirLight)

  // Shadow plane
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

  // Tree material
  const treeMaterial = new THREE.MeshStandardMaterial({
    color: '#0b8f2f'
  })

  // Tree cones
  const cone1 = new THREE.Mesh(new THREE.ConeGeometry(2, 2.5, 32), treeMaterial)
  cone1.position.y = 2
  scene.add(cone1)

  const cone2 = new THREE.Mesh(new THREE.ConeGeometry(1.6, 2.2, 32), treeMaterial)
  cone2.position.y = 3.3
  scene.add(cone2)

  const cone3 = new THREE.Mesh(new THREE.ConeGeometry(1.2, 1.8, 32), treeMaterial)
  cone3.position.y = 4.3
  scene.add(cone3)

  // Trunk
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.4, 0.4, 1.2, 16),
    new THREE.MeshStandardMaterial({ color: '#5a3b1e' })
  )
  trunk.position.y = 0.6
  scene.add(trunk)

  // LIGHTS
  const lights = []
  const lightColors = ['#ff0000', '#00ffcc', '#ffff00', '#ff00ff']

  // Cone sections for correct placement
  const coneSections = [
    { height: 2.5, radius: 2, baseY: 2 },
    { height: 2.2, radius: 1.6, baseY: 3.3 },
    { height: 1.8, radius: 1.2, baseY: 4.3 }
  ]

  // Function to compute actual cone surface area
  function coneSurfaceArea(radius, height) {
    const slant = Math.sqrt(radius * radius + height * height)
    return Math.PI * radius * slant
  }

  const areas = coneSections.map(s => coneSurfaceArea(s.radius, s.height))
  const totalArea = areas.reduce((a, b) => a + b, 0)
  const bulbsPerSection = areas.map(a => Math.round(500 * (a / totalArea)))

  // Generate bulbs proportionally to surface area
  for (let s = 0; s < coneSections.length; s++) {
    const section = coneSections[s]
    const bulbCount = bulbsPerSection[s]

    for (let i = 0; i < bulbCount; i++) {
      const bulb = new THREE.Mesh(
        new THREE.SphereGeometry(0.09, 8, 8),
        new THREE.MeshStandardMaterial({
          color: lightColors[i % lightColors.length],
          emissive: lightColors[i % lightColors.length],
          emissiveIntensity: 0.0
        })
      )

      // Uniform distribution on cone surface
      const u = Math.random()
      const localH = Math.sqrt(u) * section.height
      const radiusAtH = section.radius * (1 - localH / section.height)
      const angle = Math.random() * Math.PI * 2

      const x = Math.cos(angle) * radiusAtH
      const y = section.baseY - section.height / 2 + localH
      const z = Math.sin(angle) * radiusAtH

      bulb.position.set(x, y, z)

      // Slight push inside
      const normal = new THREE.Vector3(x, 0, z).normalize().multiplyScalar(0.05)
      bulb.position.sub(normal)

      bulb.userData = {
        speed: 0.002 + Math.random() * 0.004,
        offset: Math.random() * 10
      }

      scene.add(bulb)
      lights.push(bulb)
    }
  }

  // Orbit controls
  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.enablePan = false
  controls.minDistance = 4
  controls.maxDistance = 8
  controls.target.set(0, 3, 0)

  // Animation loop
  const animate = () => {
    animationId = requestAnimationFrame(animate)
    controls.update()

    lights.forEach((bulb) => {
      const t = Date.now() * bulb.userData.speed + bulb.userData.offset
      const pulse = Math.abs(Math.sin(t))
      bulb.material.emissiveIntensity = pulse * 1.5
    })

    renderer.render(scene, camera)
  }
  animate()

  // Resize handler
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
</script>

<template>
  <div class="christmas-tree-wrapper" ref="container"></div>
</template>

<style scoped>
.christmas-tree-wrapper {
  width: 100%;
  height: 100%;
  overflow: hidden;
}
</style>
