<script setup>
import ToolsSettingsTabs from './ToolsSettingsTabs.vue'
import DefaultButton from '../common/DefaultButton.vue'
import LinkValuesIcon from '../common/LinkValuesIcon.vue'
import BaseIcon from '../icons/BaseIcon.vue'
import NumberInput from '../common/NumberInput.vue'
import { useEditorStore } from '@/stores/editorStore'
import { useImageStore } from '@/stores/imageStore'
import { useViewportStore } from '@/stores/viewportStore'
import { useCropTool } from '@/composables/tools/useCropTool'
import { useFlipTool } from '@/composables/tools/useFlipTool'
import { useRotateTool } from '@/composables/tools/useRotateTool'
import { useHistoryStore } from '@/stores/historyStore'
import { useI18n } from 'vue-i18n'

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
} = useCropTool(useImageStore(), useViewportStore(), useEditorStore(), useHistoryStore(), t)

const { applyFlip } = useFlipTool(useImageStore(), useHistoryStore())

const { applyRotation, rotationAngle, resetRotationAngle, rotationAngleInputRef } = useRotateTool(
  useImageStore(),
  useHistoryStore(),
  t,
)

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
          <div class="content-wrapper">
            <div class="content-title">
              <BaseIcon name="IconRotateLeft" size="25" :color="'var(--primary-c)'" />
              <p>
                {{ $t('tools.transform.settings.rotate.rotateLeft') }}
              </p>
            </div>
            <div class="content-button">
              <DefaultButton
                :text="$t('tools.transform.settings.rotate.applyRotationButton.text')"
                @click="applyRotation(-90)"
              />
            </div>
          </div>
        </div>
        <div class="settings-content-wrapper">
          <div class="content-wrapper">
            <div class="content-title">
              <BaseIcon name="IconRotateRight" size="25" :color="'var(--primary-c)'" />
              <p>
                {{ $t('tools.transform.settings.rotate.rotateRight') }}
              </p>
            </div>
            <div class="content-button">
              <DefaultButton
                :text="$t('tools.transform.settings.rotate.applyRotationButton.text')"
                @click="applyRotation(90)"
              />
            </div>
          </div>
        </div>
        <div class="settings-content-wrapper">
          <div class="content-wrapper">
            <div class="content-title">
              <BaseIcon name="IconFreeRotate" size="25" :color="'var(--primary-c)'" />
              <p>
                {{ $t('tools.transform.settings.rotate.freeRotation') }}
              </p>
            </div>
            <NumberInput
              ref="rotationAngleInputRef"
              v-model="rotationAngle"
              :min="-45"
              :max="45"
              :step="1"
              :icon="'IconFreeRotate'"
              :color="'var(--primary-c)'"
              :tip="$t('tools.transform.settings.rotate.tip')"
              position="bottom-left"
              @update="applyRotation(rotationAngle)"
              :onReset="() => resetRotationAngle()"
              unit="°"
            />
            <div class="content-button">
              <DefaultButton
                :text="$t('tools.transform.settings.rotate.applyRotationButton.text')"
                @click="applyRotation(rotationAngle, true)"
                :disabled="rotationAngle === 0"
              />
            </div>
          </div>
        </div>

        <div class="settings-content-wrapper" style="border: none">
          <!-- Empty space -->
        </div>
      </div>

      <div
        v-if="editorStore.selectedTabPerTool[editorStore.selectedToolKey] === 'flip'"
        class="specific-settings"
      >
        <div class="settings-content-wrapper">
          <div class="content-wrapper">
            <div class="content-title">
              <BaseIcon name="IconFlipHorizontal" size="30" :color="'var(--primary-c)'" />
              <p>
                {{ $t('tools.transform.settings.flip.horizontal') }}
              </p>
            </div>
            <div class="content-button">
              <DefaultButton
                :text="$t('tools.transform.settings.flip.applyFlipButton.text')"
                @click="applyFlip('horizontal')"
              />
            </div>
          </div>
        </div>
        <div class="settings-content-wrapper">
          <div class="content-wrapper">
            <div class="content-title">
              <BaseIcon name="IconFlipVertical" size="30" :color="'var(--primary-c)'" />
              <p>
                {{ $t('tools.transform.settings.flip.vertical') }}
              </p>
            </div>
            <div class="content-button">
              <DefaultButton
                :text="$t('tools.transform.settings.flip.applyFlipButton.text')"
                @click="applyFlip('vertical')"
              />
            </div>
          </div>
        </div>
        <div class="settings-content-wrapper" style="border: none">
          <!-- Empty space -->
        </div>
      </div>
      <!-- <div
        v-if="editorStore.selectedTabPerTool[editorStore.selectedToolKey] === 'scale'"
        class="specific-settings"
      >
      </div> -->
      <div
        v-if="editorStore.selectedTabPerTool[editorStore.selectedToolKey] === 'crop'"
        class="specific-settings"
      >
        <div class="settings-content-wrapper">
          <div class="content-wrapper">
            <div class="content-title">
              <p>
                {{ $t('tools.transform.settings.crop.cropPosition.title') }}
              </p>
            </div>
            <div class="content-inputs">
              <div class="content-input">
                <label for="x-input">
                  {{ $t('tools.transform.settings.crop.cropPosition.x') }}
                </label>
                <NumberInput
                  ref="PositionXInputRef"
                  v-model="cropPositionX"
                  :min="0"
                  :max="maxCropPositionX"
                  @update="(val) => updatePosition('x', val)"
                  unit="px"
                />
              </div>

              <div class="content-between-inputs-icon-wrapper disabled"></div>

              <div class="content-input">
                <label for="y-input">
                  {{ $t('tools.transform.settings.crop.cropPosition.y') }}
                </label>
                <NumberInput
                  ref="PositionYInputRef"
                  v-model="cropPositionY"
                  :min="0"
                  :max="maxCropPositionY"
                  @update="(val) => updatePosition('y', val)"
                  unit="px"
                />
              </div>
            </div>
          </div>
        </div>
        <div class="settings-content-wrapper">
          <div class="content-wrapper">
            <div class="content-title">
              <p>
                {{ $t('tools.transform.settings.crop.cropDimensions.title') }}
              </p>
            </div>
            <div class="content-inputs">
              <div class="content-input">
                <label for="width-input">
                  {{ $t('tools.transform.settings.crop.cropDimensions.width') }}
                </label>
                <NumberInput
                  ref="widthInputRef"
                  v-model="tmpCropWidth"
                  :min="0"
                  :max="maxCropWidth"
                  @update="(val) => updateDimension('width', val)"
                  unit="px"
                />
              </div>

              <div class="content-between-inputs-icon-wrapper">
                <LinkValuesIcon
                  v-model="isDimensionsLinked"
                  :tipLinked="$t('tools.transform.settings.crop.cropDimensions.tipLinked')"
                  :tipUnlinked="$t('tools.transform.settings.crop.cropDimensions.tipUnlinked')"
                  size="30"
                  :disabled="cropRatio !== null"
                  position="bottom-left"
                />
              </div>

              <div class="content-input">
                <label for="height-input">
                  {{ $t('tools.transform.settings.crop.cropDimensions.height') }}
                </label>
                <NumberInput
                  ref="heightInputRef"
                  v-model="tmpCropHeight"
                  :min="0"
                  :max="maxCropHeight"
                  @update="(val) => updateDimension('height', val)"
                  unit="px"
                />
              </div>
            </div>
          </div>
        </div>
        <div class="settings-content-wrapper">
          <div class="content-title">
            <p>
              {{ $t('tools.transform.settings.crop.cropVariants.label') }}
            </p>
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
          <div class="content-wrapper">
            <div class="content-button">
              <DefaultButton
                :text="$t('tools.transform.settings.crop.applyCropButton.text')"
                @click="applyCrop"
              />
            </div>
          </div>
        </div>
        <div class="settings-content-wrapper" style="border: none">
          <!-- Empty space -->
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
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
</style>
