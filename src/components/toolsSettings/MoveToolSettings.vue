<script setup>
import DefaultSlider from '@/components/common/DefaultSlider.vue'
import { useViewportStore } from '@/stores/viewportStore'
import { useMoveToolSettings } from '@/composables/toolsSettings/useMoveToolSettings'

const {
  zoomSpeed,
  zoomSpeedMin,
  zoomSpeedMax,
  updateZoomSpeed,
  resetZoomSpeed,
  movementSpeed,
  movementSpeedMin,
  movementSpeedMax,
  updateMovementSpeed,
  resetMovementSpeed,
} = useMoveToolSettings(useViewportStore())
</script>

<template>
  <div class="tool-settings">
    <div class="tool-settings-item">
      <DefaultSlider
        v-model="zoomSpeed"
        :min="zoomSpeedMin"
        :max="zoomSpeedMax"
        :step="1"
        showValue
        :valueDescription="$t('tools.move.settings.general.zoomSpeed.label')"
        valueUnit="%"
        @update:modelValue="(value) => updateZoomSpeed(value)"
        @dblclick="resetZoomSpeed"
        :tip="$t('tools.move.settings.general.zoomSpeed.tip')"
        position="bottom-left"
      />
    </div>
    <div class="tool-settings-item">
      <DefaultSlider
        v-model="movementSpeed"
        :min="movementSpeedMin"
        :max="movementSpeedMax"
        :step="1"
        showValue
        :valueDescription="$t('tools.move.settings.general.movementSpeed.label')"
        valueUnit="%"
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
