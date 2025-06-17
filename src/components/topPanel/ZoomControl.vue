<script setup>
import BaseIcon from '@/components/icons/BaseIcon.vue'
import { useZoomControl } from '@/composables/topPanel/useZoomControl';
import { useI18n } from 'vue-i18n'
import { useViewportStore } from '@/stores/viewportStore';

import ItemTip from '../common/ItemTip.vue'

const { t } = useI18n()


const { zoomLevel, zoomIn, zoomOut, wheelZoom, setZoomLevel, resetZoom, canZoomIn, canZoomOut } = useZoomControl(useViewportStore(), t);

</script>

<template>
  <div class="zoom-control">
    <ItemTip
      :text="$t('topPanel.zoomControl.tip.zoomOut')"
      position="bottom"
    >
      <div
        class="zoom-out-button button button-control button-circle"
        @click="zoomOut"
        :class="{ 'button--disabled': !canZoomOut }">
        <BaseIcon name="IconMinus" size="24" />
      </div>
    </ItemTip>

    <ItemTip
      :text="$t('topPanel.zoomControl.tip.setZoom')"
      position="bottom"
    >
      <div class="zoom-level-wrapper">
        <input
          class="zoom-level-input"
          type="text"
          v-model="zoomLevel"
          @wheel.prevent="wheelZoom"
          @blur="setZoomLevel(zoomLevel)"
          @dblclick="resetZoom"
          @keydown.enter="setZoomLevel(zoomLevel)"
        />
      </div>
    </ItemTip>

    <ItemTip
      :text="$t('topPanel.zoomControl.tip.zoomIn')"
      position="bottom"
    >
      <div
        class="zoom-in-button button button-control button-circle"
        @click="zoomIn"
        :class="{ 'button--disabled': !canZoomIn }">
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

.zoom-level-input {
  padding-right: 20px;
  width: 60px;
  height: 100%;
  background: var(--secondary-c);
  border: none;
  color: var(--text-c);
  text-align: center;
  font-size: var(--text-font-size);
  outline: none;
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
