<script setup>
import { useViewportWrapper } from '@/composables/editor/useViewportWrapper';
import { useViewportStore } from '@/stores/viewportStore';

const {
  zoomLevel,
  changeZoomLevel,    
  panX,
  panY,
} = useViewportWrapper(useViewportStore());

</script>

<template>
  <div
    class="viewport-wrapper"
    @wheel="changeZoomLevel"
  >
    <div
      class="viewport-content"
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
</template>

<style scoped>
.viewport-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border: solid 1px red ;
  /* display: flex;
  justify-content: center;
  align-items: center; */
}

.viewport-content {
  transform-origin: top left;
  position: relative;
  display: inline-block;

}

.tmp {
  width: 800px;
  height: 600px;
  background: rgb(57, 78, 148);
  position: absolute;
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
</style>
