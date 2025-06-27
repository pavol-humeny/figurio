<script setup>
import BaseIcon from '@/components/icons/BaseIcon.vue'
import { useZoomControl } from '@/composables/topPanel/useZoomControl'
import { useViewportStore } from '@/stores/viewportStore'
import { useImageStore } from '@/stores/imageStore'
import ItemTip from '@/components/common/ItemTip.vue'

const imageStore = useImageStore()

const {
  zoomLevel,
  zoomIn,
  zoomOut,
  wheelZoom,
  resetZoom,
  canZoomIn,
  canZoomOut,
  startDragging,
} = useZoomControl(useViewportStore())
</script>

<template>
  <div class="zoom-control" :class="{ disabled: imageStore.file === null }">
    <ItemTip :text="$t('topPanel.zoomControl.tip.zoomOut')" position="bottom">
      <div
        class="zoom-out-button button button-control button-circle"
        @click="zoomOut"
        :class="{ 'button--disabled': !canZoomOut }"
      >
        <BaseIcon name="IconMinus" size="24" />
      </div>
    </ItemTip>

    <ItemTip :text="$t('topPanel.zoomControl.tip.setZoom')" position="bottom">
      <div class="zoom-level-wrapper">
        <p
        class="zoom-level"
        :textContent="zoomLevel"
        @wheel.passive="wheelZoom"
        @dblclick="resetZoom"
        @mousedown="startDragging"
        ref="editableZoom"
        >
        </p>
      </div>
    </ItemTip>

    <ItemTip :text="$t('topPanel.zoomControl.tip.zoomIn')" position="bottom">
      <div
        class="zoom-in-button button button-control button-circle"
        @click="zoomIn"
        :class="{ 'button--disabled': !canZoomIn }"
      >
        <BaseIcon name="IconPlus" size="24" />
      </div>
    </ItemTip>
  </div>
</template>

<style scoped>
.zoom-control {
  display: flex;
  align-items: center;
  height: 40px;
}

/* .zoom-control.disabled{
  opacity: 0.5;
  pointer-events: none;
} */

.zoom-in-button,
.zoom-out-button {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Border radius only on left side */
.zoom-in-button {
  border-radius: 0 20px 20px 0;
}
/* Border radius only on right side */
.zoom-out-button {
  border-radius: 20px 0 0 20px;
}

.zoom-level-wrapper {
  position: relative;
  height: 100%;
}

p.zoom-level{
  padding-right: 20px;
  width: 60px;
  height: 40px;
  background: var(--secondary-c);
  color: var(--text-c);
  font-size: var(--text-font-size);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: ew-resize;
  user-select: none;
}

.zoom-level-wrapper::after {
  content: '%';
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-c);
  pointer-events: none;
}
</style>
