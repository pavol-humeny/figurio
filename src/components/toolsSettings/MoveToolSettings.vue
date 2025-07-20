<script setup>
import DefaultSlider from '@/components/common/DefaultSlider.vue'
import { useViewportStore } from '@/stores/viewportStore'
import { useMoveToolSettings } from '@/composables/toolsSettings/useMoveToolSettings'

/**
 * Logic of the move tool settings panel
 */
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
    <div class="settings-wrapper">
      <div class="specific-settings">
        <!-- Zoom speed setting -->
        <div class="settings-content-wrapper">
          <div class="content-wrapper">
            <DefaultSlider v-model="zoomSpeed" :min="zoomSpeedMin" :max="zoomSpeedMax" :step="1" showValue
              :valueDescription="$t('tools.move.settings.general.zoomSpeed.label')" valueUnit="%"
              @update:modelValue="(value) => updateZoomSpeed(value)" @dblclick="resetZoomSpeed"
              :tip="$t('tools.move.settings.general.zoomSpeed.tip')" position="bottom-left" />
          </div>
        </div>

        <!-- Movement speed setting -->
        <div class="settings-content-wrapper">
          <div class="content-wrapper">
            <DefaultSlider v-model="movementSpeed" :min="movementSpeedMin" :max="movementSpeedMax" :step="1" showValue
              :valueDescription="$t('tools.move.settings.general.movementSpeed.label')" valueUnit="%"
              @update:modelValue="(value) => updateMovementSpeed(value)" @dblclick="resetMovementSpeed"
              :tip="$t('tools.move.settings.general.movementSpeed.tip')" position="bottom-left" />
          </div>
        </div>

        <!-- Empty space -->
        <div class="settings-content-wrapper" style="border: none">
          <!-- Empty space -->
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
