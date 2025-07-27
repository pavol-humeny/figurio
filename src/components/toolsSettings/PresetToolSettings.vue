<script setup>
import ToolsSettingsTabs from './ToolsSettingsTabs.vue'
import { useEditorStore } from '@/stores/editorStore'
import TextInput from '../common/TextInput.vue'
import DefaultButton from '../common/DefaultButton.vue'
import { usePresetTool } from '@/composables/tools/usePresetTool'
import { useImageStore } from '@/stores/imageStore'
import { useHistoryStore } from '@/stores/historyStore'
import { usePresetsStore } from '@/stores/presetsStore'
import { useI18n } from 'vue-i18n'
import NumberInput from '../common/NumberInput.vue'
import DropdownSelect from '../common/DropdownSelect.vue'
import ToggleButton from '../common/ToggleButton.vue'
import ColorPicker from '../common/ColorPicker.vue'
import OperationsList from '../common/PresetOperationsList.vue'
import PresetOperationDetails from '../common/PresetOperationDetails.vue'
import BaseIcon from '../icons/BaseIcon.vue'
import PresetNewOperation from '../common/PresetNewOperation.vue'
import { useViewportStore } from '@/stores/viewportStore'
import { editorConfig } from '@/config/editorConfig'
import TimeInput from '../common/TimeInput.vue'
import DefaultSlider from '../common/DefaultSlider.vue'
import { useFrameTool } from '@/composables/tools/useFrameTool'

const { t } = useI18n()

const editorStore = useEditorStore()

/**
 * Logic of the preset tool settings panel
 */
const {
  newPreset,
  createPreset,
  isShowManualPresetSetting,
  presetRotationOptions,
  presetFrameOptions,
  frameWidthRef,
  resetFrameWidth,
  showManualPresetSetting,
  useCurrentModifications,
  presetNameRef,
  selectedPresetName,
  localPresetName,
  localImageOperations,
  savePresetChanges,
  isPresetModified,
  presetsOptions,
  isModifyingPreset,
  modifyPreset,
  deletePreset,
  closeModifyPreset,
  localImageFrame,
  selectedOperation,
  createNewOperation,
  addNewOperation,
  creatingNewOperation,
  newOperation,
  applyPreset,
  clearSelected,
  maxCropBoxPositionX,
  maxCropBoxPositionY,
  maxCropBoxWidth,
  maxCropBoxHeight,
} = usePresetTool(
  useImageStore(),
  useHistoryStore(),
  useEditorStore(),
  usePresetsStore(),
  useViewportStore(),
  t,
)

/**
 * Logic of the frame tool
 */
const {
  isPhoneFrame,
  isFrameWithOutline,
  isFrameWithMultiplier,
} = useFrameTool(
  useImageStore(),
  useHistoryStore(),
  useEditorStore(),
  t,
)

/**
 * Available tabs for the preset tool settings
 */
const tabs = ['myPresets', 'createPreset']
</script>

<template>
  <div class="tool-settings">
    <ToolsSettingsTabs :tabs="tabs" />
    <div class="settings-wrapper">
      <!-- My Presets -->
      <div v-if="editorStore.selectedTabPerTool[editorStore.selectedToolKey] === 'myPresets'" class="specific-settings">
        <!-- Select preset -->
        <div class="settings-content-wrapper" v-if="!isModifyingPreset">
          <div v-if="presetsOptions.length > 0" class="content-wrapper">
            <div class="content-title">
              <p>
                {{ $t('tools.preset.settings.myPresets.selectPreset') }}
              </p>
            </div>
            <DropdownSelect v-model="selectedPresetName" :options="presetsOptions" />
          </div>
          <div v-else class="content-wrapper">
            <div class="content-title">
              <p>
                {{ $t('tools.preset.settings.myPresets.noPresets') }}
              </p>
            </div>
          </div>
        </div>

        <!-- Preset name -->
        <div class="settings-content-wrapper" v-if="selectedPresetName !== ''">
          <div class="content-wrapper">
            <div class="content-title">
              <p>
                {{ $t('tools.preset.settings.myPresets.presetName.text') }}
              </p>
            </div>
            <TextInput ref="presetNameInputRef" v-model="localPresetName"
              :placeholder="$t('tools.preset.settings.myPresets.presetName.placeholder')" updateOnChange
              :disabled="!isModifyingPreset" />
          </div>
        </div>

        <!-- Apply preset -->
        <div class="settings-content-wrapper" v-if="selectedPresetName !== '' && !isModifyingPreset">
          <div class="content-wrapper">
            <div class="content-title">
              <div class="content-button">
                <DefaultButton :text="$t('tools.preset.settings.myPresets.applyPresetButton.text')"
                  @click="applyPreset()" />
              </div>
            </div>
          </div>
        </div>

        <!-- Preset operations -->
        <div class="settings-content-wrapper" v-if="
          presetsOptions.length > 0 &&
          (localImageOperations.length > 0 || isModifyingPreset) &&
          selectedPresetName !== ''
        ">
          <div class="content-wrapper">
            <div class="content-title">
              <p>
                {{ t('tools.preset.settings.myPresets.presetValues.operationsTexts.label') }}
              </p>
            </div>
            <OperationsList :localImageOperations="localImageOperations" :modificationEnabled="isModifyingPreset"
              @update:localImageOperations="(newList) => (localImageOperations = newList)"
              @selectOperation="(op) => (selectedOperation = op)" :clearSelected="clearSelected"
              :disabled="!isModifyingPreset" />
            <button class="button button-circle button-control" @click="() => createNewOperation()"
              v-if="isModifyingPreset && !creatingNewOperation">
              <BaseIcon name="IconPlus" :size="23" />
            </button>

            <PresetOperationDetails v-if="selectedOperation && localImageOperations.length > 0"
              :operation="selectedOperation" @update:operation="(newOp) => Object.assign(selectedOperation, newOp)" />
          </div>
        </div>

        <!-- No operations -->
        <div v-else-if="
          presetsOptions.length > 0 &&
          (localImageOperations.length === 0 || !isModifyingPreset) &&
          selectedPresetName !== ''
        " class="settings-content-wrapper">
          <div class="content-wrapper">
            <div class="content-title">
              <p>
                {{ t('tools.preset.settings.myPresets.presetValues.operationsTexts.noOperations') }}
              </p>
            </div>
          </div>
        </div>

        <!-- Add new operation -->
        <div class="settings-content-wrapper" v-if="creatingNewOperation">
          <div class="content-wrapper">
            <div class="content-title">
              <p>
                {{
                  t('tools.preset.settings.myPresets.presetValues.operationsTexts.addNewOperation')
                }}
              </p>
            </div>
            <PresetNewOperation v-model:operation="newOperation" />
            <DefaultButton v-if="newOperation.type !== ''"
              :text="t('tools.preset.settings.myPresets.addNewOperationButton.text')" @click="addNewOperation()" />
          </div>
        </div>

        <!-- Frame -->
        <div class="settings-content-wrapper"
          v-if="(localImageFrame.enabled || isModifyingPreset) && selectedPresetName !== ''">
          <div class="content-wrapper">
            <div class="content-title">
              <p>
                {{ t('tools.preset.settings.myPresets.presetValues.frameTexts.label') }}
              </p>
            </div>
            <!-- Enabled -->
            <div class="content-aligned two-items" v-if="isModifyingPreset"
              :class="!isModifyingPreset ? 'disabled' : ''">
              <p>
                {{ t('tools.preset.settings.myPresets.presetValues.frame.enabled') }}
              </p>
              <ToggleButton v-model="localImageFrame.enabled" :scale="0.6" :style="{ transform: 'translateX(16px)' }" />
            </div>
            <!-- Type -->
            <div class="content-aligned two-items" v-if="localImageFrame.enabled"
              :class="!isModifyingPreset ? 'disabled' : ''">
              <p>
                {{ t('tools.preset.settings.myPresets.presetValues.frame.type') }}
              </p>
              <DropdownSelect v-model="localImageFrame.type" :options="presetFrameOptions" />
            </div>
            <!-- Color -->
            <div class="content-aligned two-items" v-if="localImageFrame.enabled"
              :class="!isModifyingPreset ? 'disabled' : ''">
              <p>
                {{ t('tools.preset.settings.myPresets.presetValues.frame.color') }}
              </p>
              <ColorPicker v-model="localImageFrame.color" />
            </div>
            <!-- Width -->
            <div class="content-aligned two-items"
              v-if="localImageFrame.enabled && (localImageFrame.outlineEnabled || localImageFrame.type === 'frameSolid')">
              <p
                :class="!isModifyingPreset || (localImageFrame.type !== 'frameSolid' && !localImageFrame.outlineEnabled) ? 'disabled' : ''">
                {{ t('tools.preset.settings.myPresets.presetValues.frame.width') }}
              </p>
              <NumberInput ref="frameWidthRef" v-model="localImageFrame.width" :min="0" :max="100" :step="1" unit="px"
                icon="IconArrowWidth" :iconTop="45" :onReset="() => resetFrameWidth()"
                :disabled="!isModifyingPreset || (localImageFrame.type !== 'frameSolid' && !localImageFrame.outlineEnabled)" />
            </div>
            <!-- Use outline -->
            <div
              v-if="localImageFrame.enabled && isFrameWithOutline(localImageFrame.type)"
              class="content-aligned two-items">
              <p :class="!isModifyingPreset ? 'disabled' : ''">
                {{ t('tools.preset.settings.myPresets.presetValues.frame.useFrameOutline') }}
              </p>
              <ToggleButton v-model="localImageFrame.outlineEnabled" :scale="0.6"
                :style="{ transform: 'translateX(16px)' }" :disabled="!isModifyingPreset" />
            </div>
            <!-- Phone header -->
            <!-- Enabled -->
            <div v-if="localImageFrame.enabled && isPhoneFrame(localImageFrame.type)"
              class="content-aligned two-items" :class="!isModifyingPreset ? 'disabled' : ''">
              <p>
                {{ t('tools.preset.settings.myPresets.presetValues.frame.phoneHeaderEnabled') }}
              </p>
              <ToggleButton v-model="localImageFrame.phoneHeaderEnabled" :scale="0.6"
                :style="{ transform: 'translateX(16px)' }" />
            </div>
            <!-- Background color -->
            <div v-if="localImageFrame.enabled && localImageFrame.phoneHeaderEnabled && isPhoneFrame(localImageFrame.type)"
              class="content-aligned two-items" :class="!isModifyingPreset ? 'disabled' : ''">
              <p>
                {{ t('tools.preset.settings.myPresets.presetValues.frame.phoneHeaderBackgroundColor') }}
              </p>
              <ColorPicker v-model="localImageFrame.phoneHeaderBackgroundColor" />
            </div>
            <!-- Text color -->
            <div v-if="localImageFrame.enabled && localImageFrame.phoneHeaderEnabled && isPhoneFrame(localImageFrame.type)"
              class="content-aligned two-items" :class="!isModifyingPreset ? 'disabled' : ''">
              <p>
                {{ t('tools.preset.settings.myPresets.presetValues.frame.phoneHeaderTextColor') }}
              </p>
              <ColorPicker v-model="localImageFrame.phoneHeaderTextColor" />
            </div>
            <!-- Time -->
            <div v-if="localImageFrame.enabled && localImageFrame.phoneHeaderEnabled && isPhoneFrame(localImageFrame.type)"
              class="content-aligned two-items" :class="!isModifyingPreset ? 'disabled' : ''">
              <p>
                {{ t('tools.preset.settings.myPresets.presetValues.frame.phoneHeaderTime') }}
              </p>
              <TimeInput v-model="localImageFrame.phoneHeaderTimeInMinutes" />
            </div>
            <!-- Header and footer frames multiplier -->
            <div v-if="localImageFrame.enabled && isFrameWithMultiplier(localImageFrame.type)"
              class="content-aligned two-items" :class="!isModifyingPreset ? 'disabled' : ''">
              <p>
                {{ t('tools.preset.settings.myPresets.presetValues.frame.headerFooterMultiplier') }}
              </p>
              <DefaultSlider v-model="localImageFrame.headerFooterMultiplier" :min="editorConfig.minHeaderFooterMultiplier" :max="editorConfig.maxHeaderFooterMultiplier" :step="editorConfig.stepHeaderFooterMultiplier"
              :onReset="() => { localImageFrame.headerFooterMultiplier = 1 }" showValue />
            </div>
          </div>
        </div>

        <!-- No frame -->
        <div v-else-if="!localImageFrame.enabled && !isModifyingPreset && selectedPresetName !== ''"
          class="settings-content-wrapper">
          <div class="content-wrapper">
            <div class="content-title">
              <p>
                {{ t('tools.preset.settings.myPresets.presetValues.frameTexts.noFrame') }}
              </p>
            </div>
          </div>
        </div>

        <!-- Delete preset -->
        <div class="settings-content-wrapper" v-if="isModifyingPreset && presetsOptions.length > 0">
          <div class="content-wrapper">
            <DefaultButton :text="t('tools.preset.settings.myPresets.deletePresetButton.text')"
              @click="deletePreset()" />
          </div>
        </div>

        <!-- Save, close, modify preset -->
        <div class="settings-content-wrapper" v-if="presetsOptions.length > 0 && selectedPresetName !== ''">
          <div class="content-wrapper">
            <DefaultButton v-if="isModifyingPreset && isPresetModified"
              :text="t('tools.preset.settings.myPresets.savePresetButton.text')" @click="savePresetChanges()" />
            <DefaultButton v-if="isModifyingPreset"
              :text="t('tools.preset.settings.myPresets.closeModifyingButton.text')" @click="closeModifyPreset()" />
            <DefaultButton v-else-if="!isModifyingPreset"
              :text="t('tools.preset.settings.myPresets.modifyPresetButton.text')" @click="modifyPreset()" />
          </div>
        </div>

        <!-- Empty space -->
        <div class="settings-content-wrapper" style="border: none">
          <!-- Empty space -->
        </div>
      </div>

      <!-- Create Preset -->
      <div v-if="editorStore.selectedTabPerTool[editorStore.selectedToolKey] === 'createPreset'"
        class="specific-settings">
        <!-- Preset name create and create buttons -->
        <div class="settings-content-wrapper" v-if="!isShowManualPresetSetting">
          <div class="content-wrapper">
            <div class="content-title">
              <p>
                {{ t('tools.preset.settings.createPreset.presetName.text') }}
              </p>
            </div>
            <div class="content-aligned one-item">
              <TextInput ref="presetNameRef" v-model="newPreset.presetName"
                :placeholder="t('tools.preset.settings.createPreset.presetName.placeholder')" updateOnChange />
            </div>
            <div class="content-button">
              <DefaultButton :text="t('tools.preset.settings.createPreset.manualPresetSetting.text')"
                @click="showManualPresetSetting()" :disabled="newPreset.presetName === ''" />
            </div>
            <div class="content-button">
              <DefaultButton :text="t('tools.preset.settings.createPreset.useCurrentModifications.text')"
                @click="useCurrentModifications()" :disabled="newPreset.presetName === ''" />
            </div>
          </div>
        </div>

        <!-- Preset name update -->
        <div v-if="isShowManualPresetSetting" class="settings-content-wrapper">
          <div class="content-wrapper">
            <div class="content-title">
              <p>
                {{ t('tools.preset.settings.createPreset.presetName.text') }}
              </p>
            </div>
            <div class="content-aligned one-item">
              <TextInput v-model="newPreset.presetName"
                :placeholder="t('tools.preset.settings.createPreset.presetName.placeholder')" updateOnChange />
            </div>
          </div>
        </div>

        <!-- Use current modifications -->
        <div v-if="isShowManualPresetSetting" class="settings-content-wrapper">
          <div class="content-wrapper">
            <div class="content-button">
              <DefaultButton :text="t('tools.preset.settings.createPreset.useCurrentModifications.text')"
                :tip="t('tools.preset.settings.createPreset.useCurrentModifications.tip')"
                @click="useCurrentValues()" />
            </div>
          </div>
        </div>

        <!-- Transformations -->
        <div v-if="isShowManualPresetSetting" class="settings-content-wrapper">
          <div class="content-wrapper">
            <div class="content-title">
              <p>
                {{ t('tools.preset.settings.createPreset.presetValues.transformations.label') }}
              </p>
            </div>
            <div class="content-aligned two-items">
              <p>
                {{ t('tools.preset.settings.createPreset.presetValues.transformations.rotation') }}
              </p>
              <DropdownSelect v-model="newPreset.transformations.rotationAngle" :options="presetRotationOptions" />
            </div>
            <div class="content-aligned two-items">
              <p>
                {{
                  t(
                    'tools.preset.settings.createPreset.presetValues.transformations.horizontalFlip',
                  )
                }}
              </p>
              <ToggleButton v-model="newPreset.transformations.horizontalFlip" :scale="0.6"
                :style="{ transform: 'translateX(16px)' }" />
            </div>
            <div class="content-aligned two-items">
              <p>
                {{
                  t('tools.preset.settings.createPreset.presetValues.transformations.verticalFlip')
                }}
              </p>
              <ToggleButton v-model="newPreset.transformations.verticalFlip" :scale="0.6"
                :style="{ transform: 'translateX(16px)' }" />
            </div>
          </div>
        </div>

        <!-- SmartCrop -->
        <div v-if="isShowManualPresetSetting" class="settings-content-wrapper">
          <div class="content-wrapper">
            <div class="content-title">
              <p>
                {{ t('tools.preset.settings.createPreset.presetValues.smartCrop.label') }}
              </p>
            </div>
            <div class="content-aligned two-items">
              <p>
                {{ t('tools.preset.settings.createPreset.presetValues.smartCrop.enabled') }}
              </p>
              <ToggleButton v-model="newPreset.smartCrop.enabled" :scale="0.6"
                :style="{ transform: 'translateX(16px)' }" />
            </div>
            <div class="content-aligned two-items" :class="newPreset.smartCrop.enabled ? '' : 'disabled'">
              <p>
                {{ t('tools.preset.settings.createPreset.presetValues.smartCrop.color') }}
              </p>
              <ColorPicker v-model="newPreset.smartCrop.color" />
            </div>
          </div>
        </div>

        <!-- Grayscale -->
        <div v-if="isShowManualPresetSetting" class="settings-content-wrapper">
          <div class="content-wrapper">
            <div class="content-title">
              <p>
                {{ t('tools.preset.settings.createPreset.presetValues.grayscale.label') }}
              </p>
            </div>
            <div class="content-aligned two-items">
              <p>
                {{ t('tools.preset.settings.createPreset.presetValues.grayscale.enabled') }}
              </p>
              <ToggleButton v-model="newPreset.grayscale.enabled" :scale="0.6"
                :style="{ transform: 'translateX(16px)' }" />
            </div>
          </div>
        </div>

        <!-- Crop -->
        <div v-if="isShowManualPresetSetting" class="settings-content-wrapper">
          <div class="content-wrapper">
            <div class="content-title">
              <p>
                {{ t('tools.preset.settings.createPreset.presetValues.crop.label') }}
              </p>
            </div>
            <div class="content-inputs">
              <div class="content-input" :class="newPreset.cropBox.x === 0 ? 'no-value' : ''">
                <label for="x-input">
                  {{ $t('tools.transform.settings.crop.cropPosition.x') }}
                </label>
                <NumberInput ref="cropPositionXInputRef" v-model="newPreset.cropBox.x" :min="0"
                  :max="maxCropBoxPositionX" unit="px" />
              </div>
              <div class="content-between-inputs-icon-wrapper disabled"></div>
              <div class="content-input" :class="newPreset.cropBox.y === 0 ? 'no-value' : ''">
                <label for="y-input">
                  {{ $t('tools.transform.settings.crop.cropPosition.y') }}
                </label>
                <NumberInput ref="cropPositionYInputRef" v-model="newPreset.cropBox.y" :min="0"
                  :max="maxCropBoxPositionY" unit="px" />
              </div>
            </div>
            <div class="content-inputs" :style="{ marginTop: '10px' }">
              <div class="content-input" :class="newPreset.cropBox.width === 0 ? 'no-value' : ''">
                <label for="width-input">
                  {{ $t('tools.transform.settings.crop.cropDimensions.width') }}
                </label>
                <NumberInput ref="cropWidthInputRef" v-model="newPreset.cropBox.width" :min="0" :max="maxCropBoxWidth"
                  unit="px" />
              </div>

              <div class="content-between-inputs-icon-wrapper disabled"></div>

              <div class="content-input" :class="newPreset.cropBox.height === 0 ? 'no-value' : ''">
                <label for="height-input">
                  {{ $t('tools.transform.settings.crop.cropDimensions.height') }}
                </label>
                <NumberInput ref="cropHeightInputRef" v-model="newPreset.cropBox.height" :min="0"
                  :max="maxCropBoxHeight" unit="px" />
              </div>
            </div>
          </div>
        </div>

        <!-- Resize -->
        <div v-if="isShowManualPresetSetting" class="settings-content-wrapper">
          <div class="content-wrapper">
            <div class="content-title">
              <p>
                {{ t('tools.preset.settings.createPreset.presetValues.resize.label') }}
              </p>
            </div>
            <div class="content-inputs">
              <div class="content-input" :class="newPreset.resizeDimensions.width === 0 ? 'no-value' : ''">
                <label for="width-input">
                  {{ $t('tools.transform.settings.resize.resizeDimensions.width') }}
                </label>
                <NumberInput ref="FileDimensionWidthInputRef" v-model="newPreset.resizeDimensions.width" :min="0"
                  :max="editorConfig.maxFileDimensionWidth" unit="px" />
              </div>

              <div class="content-between-inputs-icon-wrapper disabled"></div>

              <div class="content-input" :class="newPreset.resizeDimensions.height === 0 ? 'no-value' : ''">
                <label for="height-input">
                  {{ $t('tools.transform.settings.resize.resizeDimensions.height') }}
                </label>
                <NumberInput ref="FileDimensionHeightInputRef" v-model="newPreset.resizeDimensions.height" :min="0"
                  :max="editorConfig.maxFileDimensionHeight" unit="px" />
              </div>
            </div>
          </div>
        </div>

        <!-- Frame -->
        <div v-if="isShowManualPresetSetting" class="settings-content-wrapper">
          <div class="content-wrapper">
            <!-- Label -->
            <div class="content-title">
              <p>
                {{ t('tools.preset.settings.createPreset.presetValues.frame.label') }}
              </p>
            </div>
            <!-- Enabled -->
            <div class="content-aligned two-items">
              <p>
                {{ t('tools.preset.settings.createPreset.presetValues.frame.enabled') }}
              </p>
              <ToggleButton v-model="newPreset.frame.enabled" :scale="0.6" :style="{ transform: 'translateX(16px)' }" />
            </div>
            <!-- Type -->
            <div v-if="newPreset.frame.enabled" class="content-aligned two-items" :class="newPreset.frame.enabled ? '' : 'disabled'">
              <p>
                {{ t('tools.preset.settings.createPreset.presetValues.frame.type') }}
              </p>
              <DropdownSelect v-model="newPreset.frame.type" :options="presetFrameOptions" />
            </div>
            <!-- Color -->
            <div v-if="newPreset.frame.enabled" class="content-aligned two-items" :class="newPreset.frame.enabled ? '' : 'disabled'">
              <p>
                {{ t('tools.preset.settings.createPreset.presetValues.frame.color') }}
              </p>
              <ColorPicker v-model="newPreset.frame.color" />
            </div>
            <!-- Width -->
            <div v-if="(newPreset.frame.type === 'frameSolid' || newPreset.frame.outlineEnabled) && newPreset.frame.enabled"
              class="content-aligned two-items">
              <p :class="newPreset.frame.enabled ? '' : 'disabled'">
                {{ t('tools.preset.settings.createPreset.presetValues.frame.width') }}
              </p>
              <NumberInput ref="frameWidthRef" v-model="newPreset.frame.width" :min="0" :max="100" :step="1" unit="px"
                icon="IconArrowWidth" :iconTop="45" :onReset="() => resetFrameWidth()"
                :disabled="!newPreset.frame.enabled" />
            </div>
            <!-- Use outline -->
            <div
              v-if="isFrameWithOutline(newPreset.frame.type) && newPreset.frame.enabled"
              :class="newPreset.frame.enabled ? '' : 'disabled'" class="content-aligned two-items">
              <p>
                {{ t('tools.preset.settings.createPreset.presetValues.frame.useFrameOutline') }}
              </p>
              <ToggleButton v-model="newPreset.frame.outlineEnabled" :scale="0.6"
                :style="{ transform: 'translateX(16px)' }" />
            </div>
            <!-- Phone header -->
            <!-- Enabled -->
            <div v-if="isPhoneFrame(newPreset.frame.type) && newPreset.frame.enabled"
              class="content-aligned two-items"
              :class="newPreset.frame.enabled ? '' : 'disabled'">
              <p>
                {{ t('tools.preset.settings.createPreset.presetValues.frame.phoneHeaderEnabled') }}
              </p>
              <ToggleButton v-model="newPreset.frame.phoneHeaderEnabled" :scale="0.6"
                :style="{ transform: 'translateX(16px)' }" />
            </div>
            <!-- Background color -->
            <div v-if="newPreset.frame.phoneHeaderEnabled && isPhoneFrame(newPreset.frame.type) && newPreset.frame.enabled"
              class="content-aligned two-items"
              :class="newPreset.frame.enabled ? '' : 'disabled'">
              <p>
                {{ t('tools.preset.settings.createPreset.presetValues.frame.phoneHeaderBackgroundColor') }}
              </p>
              <ColorPicker v-model="newPreset.frame.phoneHeaderBackgroundColor" />
            </div>
            <!-- Text Color -->
            <div v-if="newPreset.frame.phoneHeaderEnabled && isPhoneFrame(newPreset.frame.type) && newPreset.frame.enabled"
              class="content-aligned two-items"
              :class="newPreset.frame.enabled ? '' : 'disabled'">
              <p>
                {{ t('tools.preset.settings.createPreset.presetValues.frame.phoneHeaderTextColor') }}
              </p>
              <ColorPicker v-model="newPreset.frame.phoneHeaderTextColor" />
            </div>
            <!-- Time -->
            <div v-if="newPreset.frame.phoneHeaderEnabled && isPhoneFrame(newPreset.frame.type) && newPreset.frame.enabled"
              class="content-aligned two-items"
              :class="newPreset.frame.enabled ? '' : 'disabled'">
              <p>
                {{ t('tools.preset.settings.createPreset.presetValues.frame.phoneHeaderTime') }}
              </p>
              <TimeInput v-model="newPreset.frame.phoneHeaderTimeInMinutes"/>
            </div>
            <!-- Header and footer frames multiplier -->
            <div v-if="isFrameWithMultiplier(newPreset.frame.type) && newPreset.frame.enabled"
              class="content-aligned two-items" :class="newPreset.frame.enabled ? '' : 'disabled'">
              <p>
                {{ t('tools.preset.settings.createPreset.presetValues.frame.headerFooterMultiplier') }}
              </p>
              <DefaultSlider v-model="newPreset.frame.headerFooterMultiplier" :min="editorConfig.minHeaderFooterMultiplier" :max="editorConfig.maxHeaderFooterMultiplier" :step="editorConfig.stepHeaderFooterMultiplier"
              :onReset="() => { newPreset.frame.headerFooterMultiplier = 1 }" showValue />
            </div>
          </div>
        </div>

        <!-- Create preset -->
        <div v-if="isShowManualPresetSetting" class="settings-content-wrapper">
          <div class="content-wrapper">
            <div class="content-button">
              <DefaultButton :text="t('tools.preset.settings.createPreset.createPresetButton.text')"
                @click="createPreset()" />
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
