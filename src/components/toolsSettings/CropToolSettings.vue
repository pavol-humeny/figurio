<script setup>
import ToolsSettingsTabs from './ToolsSettingsTabs.vue'
import { useEditorStore } from '@/stores/editorStore'
import { useImageStore } from '@/stores/imageStore'
import { useViewportStore } from '@/stores/viewportStore'
import { useHistoryStore } from '@/stores/historyStore'
import { useCropTool } from '@/composables/tools/useCropTool'
import { useI18n } from 'vue-i18n'
import NumberInput from '../common/NumberInput.vue'
import LinkValuesIcon from '../common/LinkValuesIcon.vue'
import DefaultButton from '../common/DefaultButton.vue'
import ColorPicker from '../common/ColorPicker.vue'
import ToggleButton from '../common/ToggleButton.vue'
import StepperInput from '../common/StepperInput.vue'
import DefaultSlider from '../common/DefaultSlider.vue'


const { t } = useI18n()

const imageStore = useImageStore()

/**
 * Logic of the crop tool
 */
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
  positionXInputRef,
  positionYInputRef,
  applyCrop,
  resetCrop,
  cropCanBeReset,
  // Auto crop
  selectedColor,
  useBaseImage,
  fitCrop,
  manualIndents,
  recalculateCropBox,
  fitCropApplied,
  showArtifacts,
  hideArtifacts,
  isArtifactsVisible,
  autoCropThreshold,
  resetThreshold,
} = useCropTool(useImageStore(), useViewportStore(), useEditorStore(), useHistoryStore(), t)

</script>

<template>
  <div class="tool-settings">
    <ToolsSettingsTabs :tabs="[]" />
    <div class="settings-wrapper">
      <div class="specific-settings">
        <!-- Crop position -->
        <div class="settings-content-wrapper">
          <div class="content-wrapper">
            <div class="content-title">
              <p>
                {{ $t('tools.crop.settings.general.cropPosition.title') }}
              </p>
            </div>
            <div class="content-inputs">
              <div class="content-input">
                <label for="x-input">
                  {{ $t('tools.crop.settings.general.cropPosition.x') }}
                </label>
                <NumberInput ref="positionXInputRef" v-model="cropPositionX" :min="0" :max="maxCropPositionX"
                  @update="(val) => updatePosition('x', val)" unit="px" />
              </div>

              <div class="content-between-inputs-icon-wrapper disabled"></div>

              <div class="content-input">
                <label for="y-input">
                  {{ $t('tools.crop.settings.general.cropPosition.y') }}
                </label>
                <NumberInput ref="positionYInputRef" v-model="cropPositionY" :min="0" :max="maxCropPositionY"
                  @update="(val) => updatePosition('y', val)" unit="px" />
              </div>
            </div>
          </div>
        </div>

        <!-- Crop dimensions -->
        <div class="settings-content-wrapper">
          <div class="content-wrapper">
            <div class="content-title">
              <p>
                {{ $t('tools.crop.settings.general.cropDimensions.title') }}
              </p>
            </div>
            <div class="content-inputs">
              <div class="content-input">
                <label for="width-input">
                  {{ $t('tools.crop.settings.general.cropDimensions.width') }}
                </label>
                <NumberInput ref="widthInputRef" v-model="tmpCropWidth" :min="0" :max="maxCropWidth"
                  @update="(val) => updateDimension('width', val)" unit="px" />
              </div>

              <div class="content-between-inputs-icon-wrapper">
                <LinkValuesIcon v-model="isDimensionsLinked"
                  :tipLinked="$t('tools.crop.settings.general.cropDimensions.tipLinked')"
                  :tipUnlinked="$t('tools.crop.settings.general.cropDimensions.tipUnlinked')" size="30"
                  position="bottom-left" />
              </div>

              <div class="content-input">
                <label for="height-input">
                  {{ $t('tools.crop.settings.general.cropDimensions.height') }}
                </label>
                <NumberInput ref="heightInputRef" v-model="tmpCropHeight" :min="0" :max="maxCropHeight"
                  @update="(val) => updateDimension('height', val)" unit="px" />
              </div>
            </div>
          </div>
        </div>

        <!-- Auto crop -->
        <div class="settings-content-wrapper">
          <div class="content-title">
            <p>
              {{ $t('tools.crop.settings.general.autoCrop.title') }}
            </p>
          </div>
          <div class="content-wrapper">
            <div class="content-aligned two-items">
              <p style="text-align: start">
                {{ $t('tools.crop.settings.general.autoCrop.autoCropColor.title') }}
              </p>
              <ColorPicker v-model="selectedColor" :tip="$t('tools.crop.settings.general.autoCrop.autoCropColor.tip')"
                position="bottom-left" />
            </div>
          </div>
          <div class="content-wrapper">
            <div class="content-aligned two-items">
              <p style="text-align: start">
                {{ $t('tools.crop.settings.general.autoCrop.useBaseImage.title') }}
              </p>
              <ToggleButton v-model="useBaseImage" :scale="0.6" :style="{ transform: 'translateX(16px)' }"
                :tip="$t('tools.crop.settings.general.autoCrop.useBaseImage.tip')" position="bottom-left" />
            </div>
          </div>
          <div class="content-wrapper" style="margin-bottom: 10px;">
            <div class="content-aligned two-items">

              <div class="content-title">
                {{ $t('tools.crop.settings.general.autoCrop.sensitivity.title') }}
              </div>
              <DefaultSlider v-model="autoCropThreshold" :min="0" :max="1" :step="0.01" showValue
                :tip="$t('tools.crop.settings.general.autoCrop.sensitivity.tip')" position="bottom-left"
                :onReset="resetThreshold" />
            </div>
          </div>

          <!-- Fit crop -->
          <div class="content-wrapper">
            <DefaultButton :text="$t('tools.crop.settings.general.autoCrop.fitCropButton.text')" @click="fitCrop" />
          </div>
        </div>

        <!-- Manual adjustment -->
        <div v-if="fitCropApplied" class="settings-content-wrapper">
          <div class="content-wrapper">
            <div class="content title">
              <p>
                {{ $t('tools.crop.settings.general.autoCrop.manualAdjustments.title') }}
              </p>
            </div>
            <div class="content-title">
              <p>{{ $t('tools.crop.settings.general.autoCrop.manualAdjustments.top') }}</p>
            </div>
            <StepperInput v-model="manualIndents.topIndent" :min="manualIndents.topIndentMin"
              :max="manualIndents.topIndentMax" :step="1" @update="recalculateCropBox" />
            <div class="content-title">
              <p>{{ $t('tools.crop.settings.general.autoCrop.manualAdjustments.right') }}</p>
            </div>
            <StepperInput v-model="manualIndents.rightIndent" :min="manualIndents.rightIndentMin"
              :max="manualIndents.rightIndentMax" :step="1" @update="recalculateCropBox" />
            <div class="content-title">
              <p>{{ $t('tools.crop.settings.general.autoCrop.manualAdjustments.bottom') }}</p>
            </div>
            <StepperInput v-model="manualIndents.bottomIndent" :min="manualIndents.bottomIndentMin"
              :max="manualIndents.bottomIndentMax" :step="1" @update="recalculateCropBox" />
            <div class="content-title">
              <p>{{ $t('tools.crop.settings.general.autoCrop.manualAdjustments.left') }}</p>
            </div>
            <StepperInput v-model="manualIndents.leftIndent" :min="manualIndents.leftIndentMin"
              :max="manualIndents.leftIndentMax" :step="1" @update="recalculateCropBox" />
          </div>
        </div>

        <!-- Show/hide artifacts -->
        <div v-if="imageStore.fileType === 'image'" class="settings-content-wrapper">
          <div class="content-wrapper">
            <div class="content-button">
              <DefaultButton
                :text="isArtifactsVisible ? $t('tools.crop.settings.general.hideArtifactsButton.text') : $t('tools.crop.settings.general.showArtifactsButton.text')"
                @click="isArtifactsVisible ? hideArtifacts() : showArtifacts()"
                :tip="isArtifactsVisible ? $t('tools.crop.settings.general.hideArtifactsButton.tip') : $t('tools.crop.settings.general.showArtifactsButton.tip')"
                position="bottom-left" />
            </div>
          </div>
        </div>

        <!-- Reset crop -->
        <div class="settings-content-wrapper">
          <div class="content-wrapper">
            <div class="content-button">
              <DefaultButton :text="$t('tools.crop.settings.general.resetCropButton.text')" @click="resetCrop"
                :disabled=!cropCanBeReset :tip="$t('tools.crop.settings.general.resetCropButton.tip')"
                position="bottom-left" />
            </div>
          </div>
        </div>

        <!-- Apply crop -->
        <div class="settings-content-wrapper">
          <div class="content-wrapper">
            <div class="content-button">
              <DefaultButton :text="$t('tools.crop.settings.general.applyCropButton.text')" @click="applyCrop" />
            </div>
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
