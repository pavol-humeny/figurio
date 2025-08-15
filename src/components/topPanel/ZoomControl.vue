<script setup>
import BaseIcon from '@/components/icons/BaseIcon.vue'
import { useZoomControl } from '@/composables/topPanel/useZoomControl'
import { useViewportStore } from '@/stores/viewportStore'
import { useImageStore } from '@/stores/imageStore'
import ItemTip from '@/components/common/ItemTip.vue'
import NumberInput from '../common/NumberInput.vue'

const imageStore = useImageStore()
const viewportStore = useViewportStore()

/**
 * Logic for the zoom control.
 */
const {
  zoomLevel,
  zoomIn,
  zoomOut,
  wheelZoom,
  resetZoom,
  canZoomIn,
  canZoomOut,
  onZoomInput,
  applyZoomFromInput,
  revertZoomInput,
  toggleZoomMode,
  textWidth,
  setNewTextWidth,
  resetTextWidth,
} = useZoomControl(useViewportStore())
</script>

<template>
  <div class="zoom-control" :class="{ disabled: imageStore.file === null }">
    <!-- Reset zoom -->
    <ItemTip :text="$t('topPanel.zoomControl.tip.resetZoom')" position="bottom">
      <div class="reset-zoom-button button button-control button-circle" @click="resetZoom">
        <BaseIcon name="IconResetZoom" size="24" />
      </div>
    </ItemTip>

    <div class="zoom-buttons">
      <!-- Zoom Out -->
      <ItemTip :text="$t('topPanel.zoomControl.tip.zoomOut')" position="bottom">
        <div class="zoom-out-button button button-control button-circle" @click="zoomOut()"
          :class="{ 'disabled': !canZoomOut }">
          <BaseIcon name="IconMinus" size="24" />
        </div>
      </ItemTip>

      <!-- Zoom value -->
      <ItemTip :text="$t('topPanel.zoomControl.tip.setZoom')" position="bottom">
        <div class="zoom-level-wrapper">
          <input class="zoom-level" type="number" :value="zoomLevel" :min="viewportStore.minZoomLevel * 100"
            :max="viewportStore.maxZoomLevel * 100" step="1" @input="onZoomInput($event)" @blur="applyZoomFromInput()"
            @keydown.enter.prevent="applyZoomFromInput()" @keydown.esc.prevent="revertZoomInput()"
            @wheel.passive="wheelZoom" :disabled="imageStore.file === null" @dblclick="resetZoom" />
          <p class="zoom-level-percentage">%</p>
        </div>
      </ItemTip>

      <!-- Zoom In -->
      <ItemTip :text="$t('topPanel.zoomControl.tip.zoomIn')" position="bottom">
        <div class="zoom-in-button button button-control button-circle" @click="zoomIn()"
          :class="{ 'disabled': !canZoomIn }">
          <BaseIcon name="IconPlus" size="24" />
        </div>
      </ItemTip>
    </div>

    <!-- Zoom modes -->
    <div class="zoom-modes">
      <!-- Classic mode -->
      <ItemTip advance :text="$t('topPanel.zoomControl.tip.classicMode.text')"
        :title="$t('topPanel.zoomControl.tip.classicMode.title')"
        :shortcut="$t('topPanel.zoomControl.tip.classicMode.shortcut')" position="bottom">
        <div class="zoom-mode-classic button button-control button-circle" @click="toggleZoomMode('classic')"
          :class="{ 'selected': viewportStore.zoomMode === 'classic' }">
          <BaseIcon name="IconZoomModeClassic" size="24" />
        </div>
      </ItemTip>

      <!-- Text mode -->
      <ItemTip advance :text="$t('topPanel.zoomControl.tip.textMode.text')"
        :title="$t('topPanel.zoomControl.tip.textMode.title')"
        :shortcut="$t('topPanel.zoomControl.tip.textMode.shortcut')" position="bottom">
        <div class="zoom-mode-text button button-control button-circle" @click="toggleZoomMode('text')"
          :class="{ 'selected': viewportStore.zoomMode === 'text' }">
          <BaseIcon name="IconZoomModeText" size="24" />
        </div>
      </ItemTip>
    </div>

    <NumberInput v-if="viewportStore.zoomMode === 'text'" v-model="textWidth" @update="setNewTextWidth" unit="cm"
      :min="1" :max="21" :step="0.01" icon="IconTextWidth" color="var(--primary-c)" :onReset="resetTextWidth"
      :tip="$t('topPanel.zoomControl.tip.textWidth.tip')" />
  </div>
</template>

<style scoped>
.zoom-control {
  display: flex;
  align-items: center;
  flex-direction: row;
  gap: 10px;
  height: 40px;
}

.zoom-buttons,
.zoom-modes {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: row;
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
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: row;
}

.zoom-level {
  padding: 0 5px 0 5px;
  width: 35px;
  height: 40px;
  background: var(--secondary-c);
  color: var(--text-c);
  font-size: var(--text-font-size);
  display: flex;
  align-items: baseline;
  justify-content: center;
  border: none;
  text-align: right;
}

.zoom-level:focus {
  outline: none;
}

.zoom-level::selection {
  background: var(--primary-c);
}

.zoom-level-wrapper .zoom-level-percentage {
  background: var(--secondary-c);
  color: var(--text-c);
  font-size: var(--text-font-size);
  pointer-events: none;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 5px 0 0;
}

.zoom-mode-classic,
.zoom-mode-text {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 45px;
}

.zoom-mode-text {
  padding-right: 5px;
  border-radius: 0 20px 20px 0;
  border-width: 3px 3px 3px 0px;
}

.zoom-mode-classic {
  padding-left: 5px;
  border-radius: 20px 0 0 20px;
  border-width: 3px 0 3px 3px;
}

.selected {
  background: var(--primary-c);
  color: var(--secondary-c);

}

.button-control {
  border-style: solid;
  border-color: var(--secondary-c);
}
</style>
