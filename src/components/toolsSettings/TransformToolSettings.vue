<script setup>
import ToolsSettingsTabs from './ToolsSettingsTabs.vue'
import { useEditorStore } from '@/stores/editorStore'
import DefaultButton from '../common/DefaultButton.vue'
import { useTransformToolSettings } from '@/composables/toolsSettings/useTransformToolSettings'
import { useImageStore } from '@/stores/imageStore'
import { useViewportStore } from '@/stores/viewportStore'
import LinkValuesIcon from '../common/LinkValuesIcon.vue'
import { useCropTool } from '@/composables/tools/useCropTool'

const editorStore = useEditorStore()

const { applyCrop, freeCropBox } = useTransformToolSettings(useImageStore(), useViewportStore())

const {
  maxCropHeight,
  tmpCropHeight,
  maxCropWidth,
  tmpCropWidth,
  updateDimension,
  isDimensionsLinked,
  heightInputRef,
  widthInputRef,
  cropPositionX,
  cropPositionY,
  maxCropPositionX,
  maxCropPositionY,
  updatePosition,
  PositionXInputRef,
  PositionYInputRef,
} = useCropTool(useImageStore(), useViewportStore(), freeCropBox)

const tabs = ['rotation', 'scale', 'flip', 'crop']
</script>

<template>
  <div class="tool-settings">
    <ToolsSettingsTabs :tabs="tabs" />

    <div class="settings-content">
      <div
        v-if="editorStore.selectedTabPerTool[editorStore.selectedToolKey] === 'crop'"
        class="crop-settings"
      >
        <div class="settings-content-wrapper">
          <div class="settings-content-wrapper-title">
            <label>Crop dimensions</label>
          </div>
          <div class="settings-content-wrapper-inputs">
            <div class="width">
              <label for="width-input">Width</label>
              <input
                id="width-input"
                ref="widthInputRef"
                v-model.number="tmpCropWidth"
                type="number"
                min="0"
                :max="maxCropWidth"
                @blur="updateDimension('width', tmpCropWidth)"
                @keydown.enter="updateDimension('width', tmpCropWidth)"
              />
            </div>

            <div class="settings-content-wrapper-icon-wrapper">
              <LinkValuesIcon
                v-model="isDimensionsLinked"
                tipLinked="unlink"
                tipUnlinked="link"
                size="30"
              />
            </div>

            <div class="height">
              <label for="height-input">Height</label>
              <input
                id="height-input"
                ref="heightInputRef"
                v-model.number="tmpCropHeight"
                type="number"
                min="0"
                :max="maxCropHeight"
                @blur="updateDimension('height', tmpCropHeight)"
                @keydown.enter="updateDimension('height', tmpCropHeight)"
              />
            </div>
          </div>
        </div>
        <div class="settings-content-wrapper">
          <div class="settings-content-wrapper-title">
            <label>Crop position</label>
          </div>
          <div class="settings-content-wrapper-inputs">
            <div class="x">
              <label for="x-input">X</label>
              <input
                id="x-input"
                ref="PositionXInputRef"
                v-model.number="cropPositionX"
                type="number"
                min="0"
                :max="maxCropPositionX"
                @blur="updatePosition('x', cropPositionX)"
                @keydown.enter="updatePosition('x', cropPositionX)"
              />
            </div>

            <div class="settings-content-wrapper-icon-wrapper"></div>

            <div class="y">
              <label for="y-input">Y</label>
              <input
                id="y-input"
                ref="PositionYInputRef"
                v-model.number="cropPositionY"
                type="number"
                min="0"
                :max="maxCropPositionY"
                @blur="updatePosition('y', cropPositionY)"
                @keydown.enter="updatePosition('y', cropPositionY)"
              />
            </div>
          </div>
        </div>
        <div class="settings-content-wrapper">
          <DefaultButton text="Apply crop" @click="applyCrop" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tool-settings {
  width: 100%;
  height: 100%;
}
.settings-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  /* padding-right: 30px; */
  color: var(--text-c);
  overflow: hidden;
}
.crop-settings {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.settings-content-wrapper {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 20px 30px 20px 0;
  border-bottom: var(--border-ui);
}

.settings-content-wrapper-title {
  width: 100%;
  font-size: var(--subtitle-font-size);
  font-weight: var(--subtitle-font-weight);
  display: flex;
  justify-content: center;
}

.settings-content-wrapper-inputs {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: row;
  gap: 10px;
  width: 100%;
}

.settings-content-wrapper-inputs input {
  width: 100%;
  padding: 7px 10px;
  border-radius: 10px;
  border: none;
  background: var(--secondary-c);
  color: var(--text-c);
  width: 80px;
}

.settings-content-wrapper-inputs .width,
.settings-content-wrapper-inputs .height,
.settings-content-wrapper-inputs .x,
.settings-content-wrapper-inputs .y {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
}
.settings-content-wrapper-inputs .width label,
.settings-content-wrapper-inputs .height label,
.settings-content-wrapper-inputs .x label,
.settings-content-wrapper-inputs .y label {
  font-size: var(--text-font-size);
}

.settings-content-wrapper-icon-wrapper {
  padding-top: 20px;
  width: 30px;
}

input[type='number'] {
  text-align: center;
}
</style>
