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
import ToggleButton from '../common/ToggleButton.vue'
import StepperInput from '../common/StepperInput.vue'
// import NumberDropdownInput from '../common/NumberDropdownInput.vue'
import { useWorkspaceStore } from '@/stores/workspaceStore'
import ExplainItem from '../common/ExplainItem.vue'
import ToggleHoldButton from '../common/ToggleHoldButton.vue'

const { t } = useI18n()

// const imageStore = useImageStore()
const editorStore = useEditorStore()

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
  maxCropPositionX,
  maxCropPositionY,
  updatePosition,
  positionXInputRef,
  positionYInputRef,
  applyCrop,
  resetCrop,
  cropCanBeReset,
  showCropBox,
  hideCropBox,
  // Auto crop
  useBaseImage,
  fitCrop,
  manualIndents,
  recalculateCropBox,
  // showArtifacts,
  // hideArtifacts,
  // isArtifactsVisible,
  // autoCropThreshold,
  // autoCropThresholdOptions,
  tmpCropX,
  tmpCropY,
  isManualAdjustmentsLinked,
  manualIndentsWereChangedManually,
} = useCropTool(useImageStore(), useViewportStore(), useEditorStore(), useHistoryStore(), useWorkspaceStore(), t)

</script>

<template>
  <div class="tool-settings">
    <ToolsSettingsTabs :tabs="[]" />
    <div class="settings-wrapper">
      <div class="specific-settings">
        <div class="scrollable-settings">
          <!-- Crop position -->
          <div class="settings-content-wrapper">
            <ExplainItem :text="$t('tools.crop.explain')" :title="$t('tools.crop.label')" position="left" />
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
                  <NumberInput ref="positionXInputRef" v-model="tmpCropX" :min="0" :max="maxCropPositionX"
                    @update="(val) => updatePosition('x', val)" unit="px" />
                </div>

                <div class="content-between-inputs-icon-wrapper disabled"></div>

                <div class="content-input">
                  <label for="y-input">
                    {{ $t('tools.crop.settings.general.cropPosition.y') }}
                  </label>
                  <NumberInput ref="positionYInputRef" v-model="tmpCropY" :min="0" :max="maxCropPositionY"
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
            <ExplainItem :text="$t('tools.crop.explain2')" :title="$t('tools.crop.settings.general.autoCrop.title')"
              position="left" />
            <div class="content-title">
              <p>
                {{ $t('tools.crop.settings.general.autoCrop.title') }}
              </p>
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
            <!--
          <div class="content-wrapper" style="margin-bottom: 10px;">
            <div class="content-aligned two-items">

              <div class="content-title">
                {{ $t('tools.crop.settings.general.autoCrop.sensitivity.title') }}
              </div>
              <NumberDropdownInput v-model="autoCropThreshold" :min="0" :max="0.9" :step="0.01"
                :options="autoCropThresholdOptions" :tip="$t('tools.crop.settings.general.autoCrop.sensitivity.tip')"
                position="bottom-left" />
            </div>
          </div>
          -->

            <!-- Fit crop -->
            <div class="content-wrapper">
              <DefaultButton :text="$t('tools.crop.settings.general.autoCrop.fitCropButton.text')" @click="fitCrop" />
            </div>
          </div>

          <!-- Manual adjustment -->
          <div class="settings-content-wrapper">
            <div class="content-wrapper">
              <div class="content title">
                <p>
                  {{ $t('tools.crop.settings.general.autoCrop.manualAdjustments.title') }}
                </p>
              </div>
              <div class="manual-adjustment-wrapper">
                <div class="grid-3-3">

                  <!-- Top -->
                  <div class="dpad top">
                    <StepperInput v-model="manualIndents.topIndent" :min="manualIndents.topIndentMin"
                      :max="manualIndents.topIndentMax" :step="1"
                      @update="recalculateCropBox; manualIndentsWereChangedManually()" type="block"
                      :tip="$t('tools.crop.settings.general.autoCrop.manualAdjustments.top')"
                      :onReset="() => manualIndents.topIndent = 0" />
                  </div>

                  <!-- Left -->
                  <div class="dpad left">

                    <StepperInput v-model="manualIndents.leftIndent" :min="manualIndents.leftIndentMin"
                      :max="manualIndents.leftIndentMax" :step="1"
                      @update="recalculateCropBox; manualIndentsWereChangedManually()" type="block"
                      :tip="$t('tools.crop.settings.general.autoCrop.manualAdjustments.left')"
                      :onReset="() => manualIndents.leftIndent = 0" />
                  </div>

                  <!-- Right -->
                  <div class="dpad right">
                    <StepperInput v-model="manualIndents.rightIndent" :min="manualIndents.rightIndentMin"
                      :max="manualIndents.rightIndentMax" :step="1"
                      @update="recalculateCropBox; manualIndentsWereChangedManually()" type="block"
                      :tip="$t('tools.crop.settings.general.autoCrop.manualAdjustments.right')"
                      :onReset="() => manualIndents.rightIndent = 0" />
                  </div>

                  <!-- Bottom -->
                  <div class="dpad bottom">
                    <StepperInput v-model="manualIndents.bottomIndent" :min="manualIndents.bottomIndentMin"
                      :max="manualIndents.bottomIndentMax" :step="1"
                      @update="recalculateCropBox; manualIndentsWereChangedManually()" type="block"
                      :tip="$t('tools.crop.settings.general.autoCrop.manualAdjustments.bottom')"
                      :onReset="() => manualIndents.bottomIndent = 0" />
                  </div>

                  <!-- Link -->
                  <div class="dpad center" style="cursor: pointer;">
                    <LinkValuesIcon v-model="isManualAdjustmentsLinked"
                      :tipLinked="$t('tools.crop.settings.general.autoCrop.manualAdjustments.tipLinked')"
                      :tipUnlinked="$t('tools.crop.settings.general.autoCrop.manualAdjustments.tipUnlinked')" size="30"
                      position="bottom-left" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Show/hide artifacts -->
          <!--
        <div v-if="imageStore.fileType === 'image'" class="settings-content-wrapper">
          <div class="content-wrapper">
            <div class="content-button">
              <DefaultButton
                :text="isArtifactsVisible ? $t('tools.crop.settings.general.hideArtifactsButton.text') : $t('tools.crop.settings.general.showArtifactsButton.text')"
                @click="isArtifactsVisible ? hideArtifacts() : showArtifacts()"
                :tip="isArtifactsVisible ? $t('tools.crop.settings.general.hideArtifactsButton.tip') : autoCropThreshold === 0 ? $t('tools.crop.settings.general.showArtifactsButton.tipDisabled') : $t('tools.crop.settings.general.showArtifactsButton.tip')"
                position="bottom-left" :disabled="autoCropThreshold === 0" />
            </div>
          </div>
        </div>
        -->

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

          <!-- Hide crop box -->
          <div class="settings-content-wrapper settings-content-wrapper-last">
            <div class="content-wrapper">
              <div class="content-aligned two-items">
                <p style="text-align: start">
                  {{ $t('tools.crop.settings.general.hideCropBoxButton.text') }}
                </p>
                <ToggleHoldButton :scale="0.6" :style="{ transform: 'translateX(16px)' }"
                  :tip="$t('tools.crop.settings.general.hideCropBoxButton.tip')" position="top-left"
                  :defaultValue=!editorStore.toolsConfig.crop.isVisibleCropBox :startFunction="hideCropBox"
                  :endFunction="showCropBox" />
              </div>
            </div>
          </div>
        </div>

        <div class="sticky-bottom-settings">
          <!-- Apply crop -->
          <div class="settings-content-wrapper settings-content-wrapper-last">
            <div class="content-wrapper">
              <DefaultButton :text="$t('tools.crop.settings.general.applyCropButton.text')" @click="applyCrop" main />
            </div>
          </div>
        </div>

        <!-- Empty space -->
        <!-- <div class="settings-content-wrapper" style="border: none">
        </div> -->
      </div>
    </div>
  </div>
</template>

<style scoped>
.manual-adjustment-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
}

.grid-3-3 {
  display: grid;
  gap: 5px;
  position: relative;
}

.dpad {
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 6px;
  color: var(--text-c);
  font-weight: bold;
}

.top {
  grid-column: 2;
  grid-row: 1;
}

.left {
  grid-column: 1;
  grid-row: 2;
}

.right {
  grid-column: 3;
  grid-row: 2;
}

.bottom {
  grid-column: 2;
  grid-row: 3;
}

.center {
  grid-column: 2;
  grid-row: 2;
}
</style>
