<script setup>
import { useViewportWrapper } from '@/composables/editor/useViewportWrapper';
import { useViewportStore } from '@/stores/viewportStore';

const {
  zoomLevel,
  changeZoomLevel,
  panX,
  startDrag,
  panY,
  wrapperRef,
  contentRef,
  verticalSliderTop,
  horizontalSliderLeft,
  verticalSliderHeight,
  horizontalSliderWidth,
} = useViewportWrapper(useViewportStore());



</script>

<template>
  <div class="viewport-wrapper">
    <div
      class="viewport-content-wrapper"
      ref="wrapperRef"
      @wheel.passive="changeZoomLevel"
    >
      <div
        class="viewport-content"
        ref="contentRef"
        :style="{
          transform: `translate(${panX}px, ${panY}px) scale(${zoomLevel})`
        }"
      >
        <div class="tmp">
          a
        </div>
        <!-- <canvas class="image-canvas"></canvas> -->
        <!-- <svg class="image-svg"></svg> -->
      </div>
    </div>

    <!-- <input
      type="range"
      class="vertical-slider"
      min="-1000"
      max="1000"
      step="1"
      :value="panY * zoomLevel"
      @input="changePanY($event.target.value)"
    /> -->
    <div class="vertical-slider-wrapper">
      <div
        class="slider"
        @mousedown="(e) => startDrag('y', e)"
        :style="{
          top: verticalSliderTop + 'px',
          height: verticalSliderHeight + 'px'
        }"
      >

      </div>

    </div>

    <div class="horizontal-slider-wrapper">
      <div
        class="slider"
        @mousedown="(e) => startDrag('x', e)"
        :style="{
          left: horizontalSliderLeft + 'px',
          width: horizontalSliderWidth + 'px'
        }"
      >

      </div>

    </div>

    <!-- <input
      type="range"
      class="horizontal-slider"
      min="-1000"
      max="1000"
      step="1"
      :value="panX * zoomLevel"
      @input="changePanX($event.target.value)"
    /> -->
  </div>
</template>

<style scoped>
.viewport-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
}

.viewport-content-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  right: 16px;
  bottom: 16px;
  overflow: hidden;
  border: solid 1px red;
}

.viewport-content {
  transform-origin: top left;
  position: relative;
  height: fit-content;
  width: fit-content;
  border:  solid 1px green;
}

.tmp {
  width: 800px;
  height: 600px;
  background: rgb(57, 78, 148);
  /* position: absolute; */
  display: flex;
  justify-content: center;
  align-items: center;

}

.image-canvas,
.image-svg {
  position: absolute;
  top: 0;
  left: 0;
}

.vertical-slider-wrapper{
  position: absolute;
  top: 0;
  right: 0;
  width: 16px;
  height: calc(100% - 16px);
  display: flex;
  flex-direction: column;
  background: rgb(49, 122, 134);
  overflow: hidden;
}

.horizontal-slider-wrapper{
  position: absolute;
  left: 0;
  bottom: 0;
  width: calc(100% - 16px);
  height: 16px;
  background: rgb(26, 47, 116);
  overflow: hidden;
}

.slider {
  position: absolute;
  background: var(--secondary-c);
  cursor: pointer;
}

.vertical-slider-wrapper .slider{
  height: 200px;
  width: 100%;
  top: 50%;
  /* transform: translateY(-50%); */
}

.horizontal-slider-wrapper .slider{
  width: 200px;
  height: 100%;
  left: 50%;
  /* transform: translateX(-50%); */
}

</style>
