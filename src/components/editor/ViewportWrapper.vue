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

const { t } = useI18n()

const uiStore = useUiStore()

const contentRef = ref(null)

const editorStore = useEditorStore()

const { canvasRef, svgRef, frameSvgRef } = useImageRenderer(
  useImageStore(),
  useHistoryStore(),
  useEditorStore(),
  useViewportStore(),
  contentRef,
  t,
)

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
} = useViewportWrapper(useViewportStore(), useImageStore(), useEditorStore(), contentRef)

const isCropShown = ref(false)

// Sleduj zmenu hodnoty `selectedSubToolKey`
watch(
  () => editorStore.selectedSubToolKey,
  (newVal) => {
    isCropShown.value = newVal === 'isCropShown'
  },
  { immediate: true },
)
</script>

<template>
  <div class="viewport-wrapper">
    <div class="viewport-content-wrapper" ref="wrapperRef" @wheel.passive="setZoomAndScroll" @mousedown="startPan"
      :class="{
        'middle-dragging': isMiddleDragging,
        'move-tool-selected': editorStore.selectedToolKey === 'move',
      }">
      <div class="viewport-content" ref="contentRef" :style="{
        transform: `translate(${panX}px, ${panY}px) scale(${zoomLevel})`,
      }">
        <canvas ref="canvasRef" class="image-canvas"></canvas>
        <svg ref="svgRef" class="image-svg"></svg>

        <!--
        <canvas ref="frameCanvasRef" class="frame-canvas"></canvas>
        -->
        <svg ref="frameSvgRef" class="frame-svg"></svg>

        <CropTool v-if="editorStore.selectedTabPerTool[editorStore.selectedToolKey] === 'crop'" />
        <SmartCropTool v-if="isCropShown" />
        <PresetCropTool v-if="
          editorStore.selectedToolKey === 'preset' && editorStore.selectedSubToolKey === 'crop'
        " />
      </div>
    </div>

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

    <div v-if="uiStore.rulersEnabled" class="horizontal-ruler-wrapper">
      <div class="ruler">
        <div v-for="(mark, i) in horizontalRulerMarks" :key="'h' + i" class="ruler-mark horizontal"
          :style="{ left: mark.left + 'px' }">
          <span class="ruler-label">{{ mark.label }}</span>
        </div>
      </div>
    </div>
    <div v-if="uiStore.rulersEnabled" class="vertical-ruler-wrapper">
      <div class="ruler">
        <div v-for="(mark, i) in verticalRulerMarks" :key="'v' + i" class="ruler-mark vertical"
          :style="{ top: mark.top + 'px' }">
          <span class="ruler-label">{{ mark.label }}</span>
        </div>
      </div>
    </div>
    <div v-if="uiStore.rulersEnabled" class="ruler-padding"></div>
  </div>
</template>

<style scoped>
.viewport-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  z-index: var(--z-index-viewport);
}

.viewport-content-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  right: 0px;
  bottom: 0px;
  overflow: hidden;
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

.horizontal-ruler-wrapper {
  position: absolute;
  left: 0px;
  top: 0;
  background-color: var(--secondary-c);
  width: 100%;
  height: 12px;
  z-index: var(--z-index-rulers);
  overflow: hidden;
}

.vertical-ruler-wrapper {
  position: absolute;
  top: 0px;
  left: 0;
  background-color: var(--secondary-c);
  width: 12px;
  height: 100%;
  z-index: var(--z-index-rulers);
  overflow: hidden;
}

.ruler-padding {
  position: absolute;
  top: 0;
  left: 0;
  width: 12px;
  height: 12px;
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
</style>
