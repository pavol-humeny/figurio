<script setup>
import ToolsSettingsTabs from './ToolsSettingsTabs.vue'
import { useEditorStore } from '@/stores/editorStore'
import DefaultButton from '../common/DefaultButton.vue'
import { useImageStore } from '@/stores/imageStore'
import { useViewportStore } from '@/stores/viewportStore'
import LinkValuesIcon from '../common/LinkValuesIcon.vue'
import { useCropTool } from '@/composables/tools/useCropTool'
import BaseIcon from '../icons/BaseIcon.vue'
import { useI18n } from 'vue-i18n'
import { useFlipTool } from '@/composables/tools/useFlipTool'
import { useRotateTool } from '@/composables/tools/useRotateTool'
import DefaultSlider from '../common/DefaultSlider.vue'

const { t } = useI18n()

const editorStore = useEditorStore()

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
  selectSubTool,
  cropRatio,
  applyCrop,
} = useCropTool(useImageStore(), useViewportStore(), useEditorStore(), t)

const { applyFlip } = useFlipTool(useImageStore())

const {
  applyRotation90,
  applyRotation,
  rotationAngle,
  resetRotationAngle,
  setRotationAngleByScroll,
} = useRotateTool(useImageStore(), t)

const tabs = ['rotate', 'flip', 'crop']
</script>

<template>
  <div class="tool-settings">
    <ToolsSettingsTabs :tabs="tabs" />

    <div class="settings-wrapper">
      <div
        v-if="editorStore.selectedTabPerTool[editorStore.selectedToolKey] === 'rotate'"
        class="specific-settings"
      >
        <div class="settings-content-wrapper">
          <div class="rotate-wrapper">
            <div class="rotate-title">
              <BaseIcon name="IconRotateLeft" size="25" :color="'var(--primary-c)'" />
              <p>
                {{ $t('tools.transform.settings.rotate.rotateLeft') }}
              </p>
            </div>
            <div class="rotate-button">
              <DefaultButton
                :text="$t('tools.transform.settings.rotate.applyRotationButton.text')"
                @click="applyRotation90('left')"
              />
            </div>
          </div>
        </div>
        <div class="settings-content-wrapper">
          <div class="rotate-wrapper">
            <div class="rotate-title">
              <BaseIcon name="IconRotateRight" size="25" :color="'var(--primary-c)'" />
              <p>
                {{ $t('tools.transform.settings.rotate.rotateRight') }}
              </p>
            </div>
            <div class="rotate-button">
              <DefaultButton
                :text="$t('tools.transform.settings.rotate.applyRotationButton.text')"
                @click="applyRotation90('right')"
              />
            </div>
          </div>
        </div>
        <div class="settings-content-wrapper">
          <div class="rotate-wrapper">
            <div class="rotate-title">
              <BaseIcon name="IconFreeRotate" size="25" :color="'var(--primary-c)'" />
              <p>
                {{ $t('tools.transform.settings.rotate.freeRotation') }}
              </p>
            </div>
            <DefaultSlider
              v-model="rotationAngle"
              :min="-45"
              :max="45"
              :step="1"
              :valueUnit="'°'"
              :showValue="true"
              :style="{ margin: '0 0 10px 0' }"
              :tip="$t('tools.transform.settings.rotate.tip')"
              position="bottom-left"
              @dblclick="resetRotationAngle()"
              @wheel="setRotationAngleByScroll"
              @input="applyRotation(rotationAngle)"
            />
            <div class="rotate-button">
              <DefaultButton
                :text="$t('tools.transform.settings.rotate.applyRotationButton.text')"
                @click="applyRotation(rotationAngle, true)"
                :disabled="rotationAngle === 0"
              />
            </div>
          </div>
        </div>

        <div class="settings-content" style="border: none">
          <!-- Empty space -->
        </div>
      </div>

      <div
        v-if="editorStore.selectedTabPerTool[editorStore.selectedToolKey] === 'flip'"
        class="specific-settings"
      >
        <div class="settings-content-wrapper">
          <div class="flip-wrapper">
            <div class="flip-title">
              <BaseIcon name="IconFlipHorizontal" size="30" :color="'var(--primary-c)'" />
              <p>
                {{ $t('tools.transform.settings.flip.horizontal') }}
              </p>
            </div>
            <div class="flip-button">
              <DefaultButton
                :text="$t('tools.transform.settings.flip.applyFlipButton.text')"
                @click="applyFlip('horizontal')"
              />
            </div>
          </div>
        </div>
        <div class="settings-content-wrapper">
          <div class="flip-wrapper">
            <div class="flip-title">
              <BaseIcon name="IconFlipVertical" size="30" :color="'var(--primary-c)'" />
              <p>
                {{ $t('tools.transform.settings.flip.vertical') }}
              </p>
            </div>
            <div class="flip-button">
              <DefaultButton
                :text="$t('tools.transform.settings.flip.applyFlipButton.text')"
                @click="applyFlip('vertical')"
              />
            </div>
          </div>
        </div>
        <div class="settings-content" style="border: none">
          <!-- Empty space -->
        </div>
      </div>
      <!-- <div
        v-if="editorStore.selectedTabPerTool[editorStore.selectedToolKey] === 'scale'"
        class="specific-settings"
      >
        <div class="settings-content-wrapper">
          <div class="scale-wrapper"></div>
        </div>
        <div class="settings-content" style="border: none">
          Empty space
        </div>
      </div> -->
      <div
        v-if="editorStore.selectedTabPerTool[editorStore.selectedToolKey] === 'crop'"
        class="specific-settings"
      >
        <div class="settings-content-wrapper">
          <div class="settings-content-title">
            <label>
              {{ $t('tools.transform.settings.crop.cropPosition.title') }}
            </label>
          </div>
          <div class="settings-content-inputs">
            <div class="x">
              <label for="x-input">
                {{ $t('tools.transform.settings.crop.cropPosition.x') }}
              </label>
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

            <div class="settings-content-icon-wrapper"></div>

            <div class="y">
              <label for="y-input">
                {{ $t('tools.transform.settings.crop.cropPosition.y') }}
              </label>
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
          <div class="settings-content-title">
            <label>
              {{ $t('tools.transform.settings.crop.cropDimensions.title') }}
            </label>
          </div>
          <div class="settings-content-inputs">
            <div class="width">
              <label for="width-input">
                {{ $t('tools.transform.settings.crop.cropDimensions.width') }}
              </label>
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

            <div class="settings-content-icon-wrapper">
              <LinkValuesIcon
                v-model="isDimensionsLinked"
                :tipLinked="$t('tools.transform.settings.crop.cropDimensions.tipLinked')"
                :tipUnlinked="$t('tools.transform.settings.crop.cropDimensions.tipUnlinked')"
                size="30"
                :disabled="cropRatio !== null"
                position="bottom-left"
              />
            </div>

            <div class="height">
              <label for="height-input">
                {{ $t('tools.transform.settings.crop.cropDimensions.height') }}
              </label>
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
          <div class="settings-content-title">
            <label>
              {{ $t('tools.transform.settings.crop.cropVariants.label') }}
            </label>
          </div>
          <div class="crop-variants-wrapper">
            <div
              class="crop-variant"
              :class="{ active: editorStore.selectedSubToolKey === 'cropFree' }"
              @click="selectSubTool('cropFree')"
            >
              <BaseIcon name="IconCropFree" size="40" :color="'var(--primary-c)'" />
              <p>
                {{ $t('tools.transform.settings.crop.cropVariants.cropFree') }}
              </p>
            </div>
            <div
              class="crop-variant"
              :class="{ active: editorStore.selectedSubToolKey === 'crop11' }"
              @click="selectSubTool('crop11')"
            >
              <BaseIcon name="IconCrop11" size="40" :color="'var(--primary-c)'" />
              <p>
                {{ $t('tools.transform.settings.crop.cropVariants.crop11') }}
              </p>
            </div>
            <div
              class="crop-variant"
              :class="{ active: editorStore.selectedSubToolKey === 'crop43' }"
              @click="selectSubTool('crop43')"
            >
              <BaseIcon name="IconCrop43" size="40" :color="'var(--primary-c)'" />
              <p>
                {{ $t('tools.transform.settings.crop.cropVariants.crop43') }}
              </p>
            </div>
            <div
              class="crop-variant"
              :class="{ active: editorStore.selectedSubToolKey === 'crop34' }"
              @click="selectSubTool('crop34')"
            >
              <BaseIcon name="IconCrop34" size="40" :color="'var(--primary-c)'" />
              <p>
                {{ $t('tools.transform.settings.crop.cropVariants.crop34') }}
              </p>
            </div>
            <div
              class="crop-variant"
              :class="{ active: editorStore.selectedSubToolKey === 'crop169' }"
              @click="selectSubTool('crop169')"
            >
              <BaseIcon name="IconCrop169" size="40" :color="'var(--primary-c)'" />
              <p>
                {{ $t('tools.transform.settings.crop.cropVariants.crop169') }}
              </p>
            </div>
            <div
              class="crop-variant"
              :class="{ active: editorStore.selectedSubToolKey === 'crop916' }"
              @click="selectSubTool('crop916')"
            >
              <BaseIcon name="IconCrop916" size="40" :color="'var(--primary-c)'" />
              <p>
                {{ $t('tools.transform.settings.crop.cropVariants.crop916') }}
              </p>
            </div>
          </div>
        </div>
        <div class="settings-content-wrapper">
          <DefaultButton
            :text="$t('tools.transform.settings.crop.applyCropButton.text')"
            @click="applyCrop"
          />
        </div>
        <div class="settings-content" style="border: none">
          <!-- Empty space -->
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
.settings-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: var(--text-c);
  overflow-y: auto;
  overflow-x: hidden;
}
.specific-settings {
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

.settings-content-title {
  width: 100%;
  font-size: var(--subtitle-font-size);
  font-weight: var(--subtitle-font-weight);
  display: flex;
  justify-content: center;
}

.settings-content-inputs {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: row;
  gap: 10px;
  width: 100%;
}

.settings-content-inputs input {
  width: 100%;
  padding: 7px 10px;
  border-radius: 10px;
  border: none;
  background: var(--secondary-c);
  color: var(--text-c);
  width: 80px;
}

.settings-content-inputs .width,
.settings-content-inputs .height,
.settings-content-inputs .x,
.settings-content-inputs .y {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
}
.settings-content-inputs .width label,
.settings-content-inputs .height label,
.settings-content-inputs .x label,
.settings-content-inputs .y label {
  font-size: var(--text-font-size);
}

.settings-content-icon-wrapper {
  padding-top: 20px;
  width: 30px;
  cursor: pointer;
}

input[type='number'] {
  text-align: center;
}

.crop-variants-wrapper {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  justify-items: center;
  max-height: 300px;
  overflow-y: auto;
  overflow-x: hidden;
}
.crop-variant {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 2px;
  cursor: pointer;
  height: 70px;
  width: 60px;
  background: none;
  font-size: 12px;
}

.crop-variant.active {
  background: var(--secondary-c);
  border-radius: 10px;
}

.flip-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 10px;
}

.flip-title {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: row;
  gap: 10px;
}

.scale-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 10px;
}

.rotate-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 10px;
}

.rotate-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 10px;
}

.rotate-title {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: row;
  gap: 10px;
}
</style>
