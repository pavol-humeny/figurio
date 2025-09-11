<script setup>
import { ref, watchEffect, watch, computed, onBeforeUnmount, onMounted } from 'vue'
import { useSvgObjectWrapper } from '@/composables/tools/useSvgObjectWrapper'
import { useEditorStore } from '@/stores/editorStore'
import { useHistoryStore } from '@/stores/historyStore'
import { useImageStore } from '@/stores/imageStore'
import { useViewportStore } from '@/stores/viewportStore'
import { useI18n } from 'vue-i18n'
import BaseIcon from '@/components/icons/BaseIcon.vue'
import { useUiStore } from '@/stores/uiStore'

const { t } = useI18n()
const viewportStore = useViewportStore()
const imageStore = useImageStore()

const props = defineProps({
  objectId: {
    type: Number,
    required: true,
  }
})

const {
  textRef,
  isSelected,
  onMouseDownResizer,
  onMouseDownDrag,
  getResizerPositions,
  boundingBox,
  resizerSize,
  resizerBorderSize,
  object,
  isSymmetricalObject,
  showResizers, //
  controlIconSize,
  boundingBoxStrokeWidth,
  onMouseDownRotate,
  isRotating,
  cursorOnSvgObject,
  isInMultiSelection,
  isResizerIconInside,
  isRotateIconInside,
  onObjectMouseUp,
} = useSvgObjectWrapper(
  props.objectId,
  useImageStore(),
  useViewportStore(),
  useEditorStore(),
  useHistoryStore(),
  useUiStore(),
  t
)

const boundingScreen = ref({ x: 0, y: 0, width: 0, height: 0 })

function updateBoundingScreen() {
  if (!boundingBox.value) return
  const svg = document.getElementById('image-svg')
  if (!svg) return

  const ctm = svg.getScreenCTM()
  if (!ctm) return

  const pt = svg.createSVGPoint()
  pt.x = boundingBox.value.x
  pt.y = boundingBox.value.y
  const topLeft = pt.matrixTransform(ctm)

  pt.x = boundingBox.value.x + boundingBox.value.width
  pt.y = boundingBox.value.y + boundingBox.value.height
  const bottomRight = pt.matrixTransform(ctm)

  boundingScreen.value = {
    x: topLeft.x,
    y: topLeft.y,
    width: bottomRight.x - topLeft.x,
    height: bottomRight.y - topLeft.y
  }
}

// WatchEffect pre počiatočný render alebo zmenu objektu
watchEffect(() => updateBoundingScreen())

// Watch na panX a panY
watch([() => viewportStore.panX, () => viewportStore.panY], () => {
  updateBoundingScreen()
})

const screenResizerPositions = computed(() => {
  if (!boundingBox.value) return []

  const svg = document.getElementById('image-svg')
  if (!svg) return []

  const ctm = svg.getScreenCTM()
  if (!ctm) return []

  return getResizerPositions().map(pos => {
    const pt = svg.createSVGPoint()
    pt.x = pos.x
    pt.y = pos.y
    const screenPos = pt.matrixTransform(ctm)

    return {
      ...pos,
      screenX: screenPos.x - boundingScreen.value.x,
      screenY: screenPos.y - boundingScreen.value.y,
      screenWidth: (pos.width || 0) * viewportStore.realZoomLevel,
      screenHeight: (pos.height || 0) * viewportStore.realZoomLevel,
    }
  })
})

const object2 = computed(() => {
  return imageStore.getSvgObjectById(props.objectId)
})

const rotation = computed(() => {
  if (!object2.value?.attrs?.transform) return { angle: 0, cx: 0, cy: 0 }
  const match = object2.value.attrs.transform.match(/rotate\(([-\d.]+),\s*([-\d.]+),\s*([-\d.]+)\)/)
  if (!match) return { angle: 0, cx: 0, cy: 0 }
  return {
    angle: parseFloat(match[1]),
    cx: parseFloat(match[2]),
    cy: parseFloat(match[3])
  }
})

const viewportWidth = ref(window.innerWidth)
const viewportHeight = ref(window.innerHeight)

const updateViewport = () => {
  viewportWidth.value = window.innerWidth
  viewportHeight.value = window.innerHeight
}

onMounted(() => {
  window.addEventListener('resize', updateViewport)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateViewport)
})
</script>

<template>
  <teleport to="body">
    <div v-if="(isSelected && boundingBox) || isInMultiSelection" :style="{
      position: 'absolute',
      left: '0px',
      top: '0px',
      width: viewportWidth + 'px',
      height: viewportHeight + 'px',
      overflow: 'hidden',
      pointerEvents: 'none',
    }">
      <div v-if="(isSelected && boundingBox) || isInMultiSelection" :style="{
        position: 'absolute',
        left: boundingScreen.x + 'px',
        top: boundingScreen.y + 'px',
        width: boundingScreen.width + 'px',
        height: boundingScreen.height + 'px',
        zIndex: 'var(--z-index-svg-control)',
        transform: `rotate(${rotation.angle}deg)`,
        pointerEvents: 'none',
      }">
        <!-- Náš bounding box + resizery ako keby boli v SVG -->
        <svg :width="boundingScreen.width" :height="boundingScreen.height" style="overflow: visible">
          <!-- Bounding box -->
          <rect x="0" y="0" :width="boundingScreen.width" :height="boundingScreen.height" fill="#00000001"
            :style="{ cursor: cursorOnSvgObject }" @mousedown="onMouseDownDrag"
            :stroke="isSymmetricalObject ? 'var(--editor-highlight-align-c)' : 'var(--editor-highlight-c)'"
            :stroke-width="boundingBoxStrokeWidth * viewportStore.realZoomLevel"
            :stroke-dasharray="[boundingBoxStrokeWidth * 4 * viewportStore.realZoomLevel, boundingBoxStrokeWidth * 2 * viewportStore.realZoomLevel]" />

          <!-- Icon to turn on resize -->
          <foreignObject v-if="object.tag !== 'text' && !isInMultiSelection && object.class !== 'magnifyArea'"
            :x="boundingScreen.width / 2 - controlIconSize * viewportStore.realZoomLevel * 0.5"
            :y="-controlIconSize * viewportStore.realZoomLevel" :width="controlIconSize * viewportStore.realZoomLevel"
            :height="controlIconSize * viewportStore.realZoomLevel"
            @mousedown.stop.prevent="showResizers = !showResizers" style="cursor: pointer; pointer-events: auto;">
            <BaseIcon v-if="showResizers" name="IconCross" :tip="t('tools.svgObject.resizeObject.tipStopResize')"
              :size="controlIconSize * viewportStore.realZoomLevel" color="var(--primary-c)" />
            <BaseIcon v-else name="IconResizeObject" :tip="t('tools.svgObject.resizeObject.tipStartResize')"
              :size="controlIconSize * viewportStore.realZoomLevel" color="var(--primary-c)" />
          </foreignObject>

          <!-- Resizers -->
          <template v-if="showResizers && object.tag !== 'text' && object.class !== 'magnifyArea'" >
            <template v-for="(pos, i) in screenResizerPositions" :key="i">
              <circle v-if="pos.type === 'circle'" :cx="pos.screenX" :cy="pos.screenY" :r="resizerSize"
                fill="var(--text-c)" stroke="var(--editor-highlight-c)"
                :stroke-width="resizerBorderSize * viewportStore.realZoomLevel"
                :style="{ cursor: pos.cursor, display: pos.visible ? 'block' : 'none' }"
                @mousedown.stop.prevent="onMouseDownResizer($event, i)" />

              <rect v-else :x="pos.screenX - pos.screenWidth / 2" :y="pos.screenY - pos.screenHeight / 2"
                :width="pos.screenWidth" :height="pos.screenHeight" fill="var(--text-c)"
                stroke="var(--editor-highlight-c)" :stroke-width="resizerBorderSize * viewportStore.realZoomLevel"
                :style="{ cursor: pos.cursor, display: pos.visible ? 'block' : 'none' }"
                @mousedown.stop.prevent="onMouseDownResizer($event, i)" />
            </template>
          </template>

          <!-- Rotate icon -->
          <foreignObject
            v-if="!showResizers && !isRotating && !isInMultiSelection && object.tag !== 'line' && object.class !== 'magnifyArea'"
            :x="boundingScreen.width" :y="boundingScreen.height / 2 - controlIconSize * viewportStore.realZoomLevel / 2"
            :width="controlIconSize * viewportStore.realZoomLevel"
            :height="controlIconSize * viewportStore.realZoomLevel" @mousedown.stop.prevent="onMouseDownRotate($event)"
            style="cursor: grab; pointer-events: auto;">
            <BaseIcon name="IconRotate" :tip="t('tools.svgObject.rotateObject.tip')"
              :size="controlIconSize * viewportStore.realZoomLevel" color="var(--primary-c)" />
          </foreignObject>
        </svg>
      </div>
    </div>
  </teleport>
</template>
