<script setup>
import { useViewportWrapper } from '@/composables/editor/useViewportWrapper'
import { useViewportStore } from '@/stores/viewportStore'
import { useImageRenderer } from '@/composables/editor/useImageRenderer'
import { useImageStore } from '@/stores/imageStore'
import { useEditorStore } from '@/stores/editorStore'
import { ref, watch } from 'vue'
import CropTool from '@/components/tools/CropTool.vue'
import PresetCropTool from '../tools/PresetCropTool.vue'
import SmartCropTool from '../tools/SmartCropTool.vue'
import { useHistoryStore } from '@/stores/historyStore'
import { useI18n } from 'vue-i18n'
import { useUiStore } from '@/stores/uiStore'
import LoadingSpinner from '../common/LoadingSpinner.vue'
import SvgObjectWrapper from '../tools/SvgObjectWrapper.vue'
import { useSvgObjects } from '@/composables/tools/useSvgObjects'

const { t } = useI18n()
const uiStore = useUiStore()
const editorStore = useEditorStore()
const imageStore = useImageStore()

console.log('---------------svgObjects:', imageStore.svgObjects)

/**
 * Reference to the viewport content element
 * @type {import('vue').Ref<HTMLElement | null>}
 */
const contentRef = ref(null)

/**
 * Logic of the image renderer (canvas, SVG, frame)
 */
const { canvasRef, svgRef, frameSvgRef } = useImageRenderer(
  useImageStore(),
  useHistoryStore(),
  useEditorStore(),
  useViewportStore(),
  contentRef,
  t,
)

/**
 * Logic of the viewport wrapper (zoom, pan, rulers, sliders)
 */
const {
  zoomLevel,
  setZoomAndScroll,
  startPan,
  panX,
  startDrag,
  isDraggingHorizontal,
  isDraggingVertical,
  isMiddleDragging,
  panY,
  wrapperRef,
  verticalSliderTop,
  horizontalSliderLeft,
  verticalSliderHeight,
  horizontalSliderWidth,
  horizontalRulerMarks,
  verticalRulerMarks,
  onMouseMove,
  mouseX,
  mouseY,
  cursorPosX,
  cursorPosY,
  cursorPosXSameAsImageWidth,
  cursorPosYSameAsImageHeight,
  guideLine
} = useViewportWrapper(useViewportStore(), useImageStore(), useEditorStore(), useUiStore(), contentRef, t)

const { OnClickImageSvg, cursorOnSvgArea, onMouseDownImageSvg, onMouseMoveImageSvg } = useSvgObjects(
  useImageStore(),
  useHistoryStore(),
  useViewportStore(),
  useEditorStore(),
  t
)

/**
 * Whether to show SmartCropTool
 * @type {import('vue').Ref<boolean>}
 */
const isCropShown = ref(false)
/**
 * Watch selected sub-tool and toggle SmartCropTool visibility
 */
watch(
  () => editorStore.selectedSubToolKey,
  (newVal) => {
    isCropShown.value = newVal === 'isCropShown'
  },
  { immediate: true },
)
</script>

<template>
  <div class="viewport-wrapper" id="viewport" @mousemove="onMouseMoveImageSvg">
    <LoadingSpinner />

    <div class="viewport-content-wrapper" ref="wrapperRef" @wheel.passive="setZoomAndScroll" @mousedown="startPan"
      @mousemove="onMouseMove" :class="{
        'middle-dragging': isMiddleDragging,
        'move-tool-selected': editorStore.selectedToolKey === 'move',
      }">
      <div :class="{ 'hide': uiStore.isLoading }" class="viewport-content" ref="contentRef" :style="{
        transform: `translate(${panX}px, ${panY}px) scale(${zoomLevel})`,
      }">
        <canvas ref="canvasRef" class="image-canvas"></canvas>
        <!-- <svg ref="svgRef" class="image-svg"></svg> -->

        <svg ref="frameSvgRef" class="frame-svg"></svg>

        <svg ref="svgRef" class="image-svg" xmlns="http://www.w3.org/2000/svg" :width="imageStore.fileDimensions.width"
          :height="imageStore.fileDimensions.height" @mousedown="onMouseDownImageSvg" @click="OnClickImageSvg"
          :style="{ cursor: cursorOnSvgArea }">
          <SvgObjectWrapper v-for="object in imageStore.svgObjects" :key="object.id" :objectId="object.id" />
        </svg>


        <CropTool v-if="editorStore.selectedTabPerTool[editorStore.selectedToolKey] === 'crop'" />
        <SmartCropTool v-if="isCropShown" />
        <PresetCropTool v-if="
          editorStore.selectedToolKey === 'preset' && editorStore.selectedSubToolKey === 'crop'
        " />
      </div>
    </div>


    <!-- Sliders -->
    <div class="vertical-slider-wrapper">
      <div class="slider" @mousedown="(e) => startDrag('y', e)" :style="{
        top: verticalSliderTop + 'px',
        height: verticalSliderHeight + 'px',
      }" :class="{ active: isDraggingVertical }"></div>
    </div>

    <div class="horizontal-slider-wrapper">
      <div class="slider" @mousedown="(e) => startDrag('x', e)" :style="{
        left: horizontalSliderLeft + 'px',
        width: horizontalSliderWidth + 'px',
      }" :class="{ active: isDraggingHorizontal }"></div>
    </div>

    <!-- Rulers -->
    <div v-if="uiStore.rulersEnabled" class="horizontal-ruler-wrapper">
      <div class="ruler">
        <div v-for="(mark, i) in horizontalRulerMarks" :key="'h' + i"
          :class="['ruler-mark', 'horizontal', { 'sub-mark': mark.isSub }]" :style="{ left: mark.left + 'px' }">
          <span v-if="!mark.isSub" class="ruler-label">{{ mark.label }}</span>
        </div>
        <div v-if="mouseX !== null" class="ruler-cursor-mark horizontal" :style="{ left: mouseX + 'px' }">
          <span class="ruler-cursor-label horizontal" :class="{ 'active': cursorPosXSameAsImageWidth }">{{ cursorPosX
            }}</span>
        </div>

      </div>
    </div>
    <div v-if="uiStore.rulersEnabled" class="vertical-ruler-wrapper">
      <div class="ruler">
        <div v-for="(mark, i) in verticalRulerMarks" :key="'v' + i"
          :class="['ruler-mark', 'vertical', { 'sub-mark': mark.isSub }]" :style="{ top: mark.top + 'px' }">
          <span v-if="!mark.isSub" class="ruler-label">{{ mark.label }}</span>
        </div>
        <div v-if="mouseY !== null" class="ruler-cursor-mark vertical" :style="{ top: mouseY + 'px' }">
          <span class="ruler-cursor-label vertical" :class="{ 'active': cursorPosYSameAsImageHeight }">{{ cursorPosY
            }}</span>
        </div>
      </div>
    </div>
    <div v-if="uiStore.rulersEnabled" class="ruler-padding"></div>

    <!-- Universal guide line rendered as a rotated div -->
    <div v-if="guideLine" class="guide-line-rotated" :style="{
      transform: `translate(${guideLine.x * zoomLevel + panX}px, ${guideLine.y * zoomLevel + panY}px) rotate(${guideLine.angle}deg)`,
    }"></div>
  </div>
</template>

<style scoped>
.viewport-wrapper {
  position: relative;
  width: 100%;
  height: calc(100% - 30px - 20px);
  display: flex;
  z-index: var(--z-index-viewport);
}

.viewport-content-wrapper {
  position: absolute;
  top: 0px;
  left: 0px;
  right: 0px;
  bottom: 0px;
  overflow: hidden;
  z-index: var(--z-index-viewport);
}

.viewport-content {
  position: relative;
  transform-origin: top left;
  /* display: inline-block; */
  display: block;
}

.image-canvas,
.image-svg,
.frame-svg {
  position: absolute;
  top: 0;
  left: 0;
  display: block;
}

/* Sliders */
.vertical-slider-wrapper {
  position: absolute;
  top: 0;
  right: 0;
  width: 10px;
  height: calc(100% - 16px);
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: hidden;
  z-index: var(--z-index-sliders);
}

.horizontal-slider-wrapper {
  position: absolute;
  left: 0;
  bottom: 0;
  width: calc(100% - 16px);
  height: 10px;
  overflow: hidden;
  display: flex;
  align-items: center;
  z-index: var(--z-index-sliders);
}

.slider {
  position: absolute;
  background: var(--secondary-c);
  border: solid 1px var(--border-c);
  border-radius: 10px;
}

.slider.active,
.slider:hover {
  border: solid 1px var(--primary-c);
  cursor: pointer;
}

.vertical-slider-wrapper .slider {
  height: 200px;
  width: 70%;
  top: 50%;
}

.horizontal-slider-wrapper .slider {
  width: 200px;
  height: 70%;
  left: 50%;
}

.middle-dragging {
  cursor: move;
}

.move-tool-selected {
  cursor: move;
}

/* Rulers */
.horizontal-ruler-wrapper {
  position: absolute;
  left: 0px;
  top: 0;
  background-color: var(--secondary-c);
  width: 100%;
  height: var(--ruler-size);
  z-index: var(--z-index-rulers);
  overflow: hidden;
}

.vertical-ruler-wrapper {
  position: absolute;
  top: 0px;
  left: 0;
  background-color: var(--secondary-c);
  width: var(--ruler-size);
  height: 100%;
  z-index: var(--z-index-rulers);
  overflow: hidden;
}

.ruler-padding {
  position: absolute;
  top: 0;
  left: 0;
  width: var(--ruler-size);
  height: var(--ruler-size);
  background: var(--secondary-c);
  z-index: var(--z-index-rulers-padding);
}

.ruler-mark.horizontal {
  position: absolute;
  top: 0;
  width: 2px;
  height: 100%;
  background-color: var(--border-c);
}

.ruler-mark.vertical {
  position: absolute;
  left: 0;
  height: 2px;
  width: 100%;
  background-color: var(--border-c);
}

.ruler-label {
  position: absolute;
  color: var(--text-c);
  font-size: 10px;
  transform: translateX(2px);
  white-space: nowrap;
  pointer-events: none;
  opacity: 0.7;
}

.ruler-mark.horizontal .ruler-label {
  top: 0px;
  left: 2px;
}

.ruler-mark.vertical .ruler-label {
  top: 2px;
  left: 0px;
  writing-mode: vertical-rl;
  transform: translateY(2px) rotate(180deg);
}

/* SubMarks */
.ruler-mark.sub-mark.horizontal {
  height: 30%;
  background-color: var(--border-c);
  top: 70%;
}

.ruler-mark.sub-mark.vertical {
  width: 30%;
  background-color: var(--border-c);
  left: 70%;
}

/* Cursor Marks */
.ruler-cursor-mark.horizontal {
  position: absolute;
  top: 0;
  width: 2px;
  height: 100%;
  background-color: var(--primary-c);
  z-index: 2;
  pointer-events: none;
}

.ruler-cursor-mark.vertical {
  position: absolute;
  left: 0;
  height: 2px;
  width: 100%;
  background-color: var(--primary-c);
  z-index: 2;
  pointer-events: none;
}

/* Ruler cursor label */
.ruler-cursor-label {
  position: absolute;
  font-size: 10px;
  color: var(--primary-c);
  background: var(--background-c);
  border-radius: 4px;
  pointer-events: none;
  opacity: 0.8;
}

.ruler-cursor-label.horizontal {
  top: 0;
  left: 4px;
  padding: 1px 4px;
}

.ruler-cursor-label.vertical {
  top: 4px;
  left: 0;
  padding: 4px 1px;
  writing-mode: vertical-rl;
  transform: rotate(180deg);
}

.ruler-cursor-label.active {
  background: var(--primary-c);
  color: var(--background-c);
}

.guide-line-rotated {
  position: absolute;
  width: 1000000px;
  height: 1px;
  background-color: var(--editor-highlight-align-c);
  opacity: 0.6;
  left: -500000px;
  top: 0;
  pointer-events: none;
  z-index: var(--z-index-guide-lines);
}
</style>
