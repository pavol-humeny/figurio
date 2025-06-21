<script setup>
import { useViewportWrapper } from '@/composables/editor/useViewportWrapper'
import { useViewportStore } from '@/stores/viewportStore'
import { useImageRenderer } from '@/composables/editor/useImageRenderer'
import { useImageStore } from '@/stores/imageStore'
import { ref } from 'vue'

const contentRef = ref(null)

const {
  canvasRef,
  svgRef,
} = useImageRenderer(useImageStore(), contentRef)

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
} = useViewportWrapper(useViewportStore(), useImageStore(), contentRef)
</script>

<template>
  <div class="viewport-wrapper">
    <div
      class="viewport-content-wrapper"
      ref="wrapperRef"
      @wheel.passive="setZoomAndScroll"
      @mousedown="startPan"
      :class="{ 'middle-dragging': isMiddleDragging }"
    >
      <div
        class="viewport-content"
        ref="contentRef"
        :style="{
          transform: `translate(${panX}px, ${panY}px) scale(${zoomLevel})`
        }"
      >
        <canvas ref="canvasRef" class="image-canvas"></canvas>
        <svg ref="svgRef" class="image-svg"></svg>
      </div>
    </div>

    <div class="vertical-slider-wrapper">
      <div
        class="slider"
        @mousedown="(e) => startDrag('y', e)"
        :style="{
          top: verticalSliderTop + 'px',
          height: verticalSliderHeight + 'px',
        }"
        :class="{ active: isDraggingVertical }"
      ></div>
    </div>

    <div class="horizontal-slider-wrapper">
      <div
        class="slider"
        @mousedown="(e) => startDrag('x', e)"
        :style="{
          left: horizontalSliderLeft + 'px',
          width: horizontalSliderWidth + 'px',
        }"
        :class="{ active: isDraggingHorizontal }"
      ></div>
    </div>
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
  display: inline-block;
}

.image-canvas,
.image-svg {
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
  cursor: grabbing;
}
</style>
