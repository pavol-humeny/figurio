<script setup>
import DefaultSlider from '../common/DefaultSlider.vue'
import { useViewportStore } from '@/stores/viewportStore'
import { useMoveToolSettings } from '@/composables/toolsSettings/useMoveToolSettings'

const {
  zoomSpeed,
  updateZoomSpeed,
  resetZoomSpeed,
  movementSpeed,
  updateMovementSpeed,
  resetMovementSpeed,
} = useMoveToolSettings(useViewportStore())
</script>

<template>
  <div class="tool-settings">
    <div class="tool-settings-item">
      <DefaultSlider
        v-model="zoomSpeed"
        :min="0.01"
        :max="0.4"
        :step="0.01"
        showValue
        :valueDescription="$t('tools.move.settings.general.zoomSpeed.label')"
        @update:modelValue="(value) => updateZoomSpeed(value)"
        @dblclick="resetZoomSpeed"
        :tip="$t('tools.move.settings.general.zoomSpeed.tip')"
        position="bottom-left"
      />
    </div>
    <div class="tool-settings-item">
      <DefaultSlider
        v-model="movementSpeed"
        :min="0.01"
        :max="5"
        :step="0.01"
        showValue
        :valueDescription="$t('tools.move.settings.general.movementSpeed.label')"
        @update:modelValue="(value) => updateMovementSpeed(value)"
        @dblclick="resetMovementSpeed"
        :tip="$t('tools.move.settings.general.movementSpeed.tip')"
        position="bottom-left"
      />
    </div>

    <div class="settings-content"></div>
  </div>
</template>

<style scoped>
.tool-settings {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: 100%;
  padding: 20px 0;
  gap: 20px;
}

.tool-settings-item {
  width: 70%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 10px;
}
</style>
