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

const { t } = useI18n()

const editorStore = useEditorStore()

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
} = usePresetTool(useImageStore(), useHistoryStore(), useEditorStore(), usePresetsStore(), t)

const tabs = ['myPresets', 'createPreset']
</script>

<template>
  <div class="tool-settings">
    <ToolsSettingsTabs :tabs="tabs" />
    <div class="settings-wrapper">
      <!-- My Presets -->
      <div
        v-if="editorStore.selectedTabPerTool[editorStore.selectedToolKey] === 'myPresets'"
        class="specific-settings"
      >
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
        <div class="settings-content-wrapper" v-if="presetsOptions.length > 0">
          <div class="content-wrapper">
            <div class="content-title">
              <p>
                {{ $t('tools.preset.settings.myPresets.presetName.text') }}
              </p>
            </div>
            <TextInput
              ref="presetNameInputRef"
              v-model="localPresetName"
              :placeholder="$t('tools.preset.settings.myPresets.presetName.placeholder')"
              updateOnChange
            />
          </div>
        </div>
        <div class="settings-content-wrapper" v-if="presetsOptions.length > 0">
          <div class="content-wrapper">
            <div class="content-title">
              <p>Operations</p>
            </div>
            <OperationsList
              :localImageOperations="localImageOperations"
              :modificationEnabled="isModifyingPreset"
              @update:localImageOperations="(newList) => (localImageOperations = newList)"
            />
          </div>
        </div>
        <div class="settings-content-wrapper" v-if="presetsOptions.length > 0">
          <div class="content-wrapper">
            <div class="content-title">
              <p>Frame</p>
            </div>
            <p>
              {{ localImageFrame }}
            </p>
          </div>
        </div>
        <div class="settings-content-wrapper" v-if="isModifyingPreset && presetsOptions.length > 0">
          <div class="content-wrapper">
            <DefaultButton
              :text="t('tools.preset.settings.myPresets.deletePresetButton.text')"
              @click="deletePreset()"
            />
          </div>
        </div>
        <div class="settings-content-wrapper" v-if="presetsOptions.length > 0">
          <div class="content-wrapper">
            <DefaultButton
              v-if="isModifyingPreset && isPresetModified"
              :text="t('tools.preset.settings.myPresets.savePresetButton.text')"
              @click="savePresetChanges()"
            />
            <DefaultButton
              v-else-if="isModifyingPreset && !isPresetModified"
              :text="t('tools.preset.settings.myPresets.closeModifyingButton.text')"
              @click="closeModifyPreset()"
            />
            <DefaultButton
              v-else-if="!isModifyingPreset"
              :text="t('tools.preset.settings.myPresets.modifyPresetButton.text')"
              @click="modifyPreset()"
            />
          </div>
        </div>
        <div class="settings-content-wrapper" style="border: none">
          <!-- Empty space -->
        </div>
      </div>

      <!-- Create Preset -->
      <div
        v-if="editorStore.selectedTabPerTool[editorStore.selectedToolKey] === 'createPreset'"
        class="specific-settings"
      >
        <div class="settings-content-wrapper" v-if="!isShowManualPresetSetting">
          <div class="content-wrapper">
            <div class="content-title">
              <p>
                {{ t('tools.preset.settings.createPreset.presetName.text') }}
              </p>
            </div>
            <div class="content-aligned one-item">
              <TextInput
                ref="presetNameRef"
                v-model="newPreset.presetName"
                :placeholder="t('tools.preset.settings.createPreset.presetName.placeholder')"
                updateOnChange
              />
            </div>
            <div class="content-button">
              <DefaultButton
                :text="t('tools.preset.settings.createPreset.manualPresetSetting.text')"
                @click="showManualPresetSetting()"
                :disabled="newPreset.presetName === ''"
              />
            </div>
            <div class="content-button">
              <DefaultButton
                :text="t('tools.preset.settings.createPreset.useCurrentModifications.text')"
                @click="useCurrentModifications()"
                :disabled="newPreset.presetName === ''"
              />
            </div>
          </div>
        </div>
        <div v-if="isShowManualPresetSetting" class="settings-content-wrapper">
          <div class="content-wrapper">
            <div class="content-title">
              <p>
                {{ t('tools.preset.settings.createPreset.presetName.text') }}
              </p>
            </div>
            <div class="content-aligned one-item">
              <TextInput
                v-model="newPreset.presetName"
                :placeholder="t('tools.preset.settings.createPreset.presetName.placeholder')"
                updateOnChange
              />
            </div>
          </div>
        </div>
        <div v-if="isShowManualPresetSetting" class="settings-content-wrapper">
          <div class="content-wrapper">
            <div class="content-button">
              <DefaultButton
                :text="t('tools.preset.settings.createPreset.useCurrentModifications.text')"
                :tip="t('tools.preset.settings.createPreset.useCurrentModifications.tip')"
                @click="useCurrentValues()"
              />
            </div>
          </div>
        </div>
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
              <DropdownSelect
                v-model="newPreset.transformations.rotationAngle"
                :options="presetRotationOptions"
              />
            </div>
            <div class="content-aligned two-items">
              <p>
                {{
                  t(
                    'tools.preset.settings.createPreset.presetValues.transformations.horizontalFlip',
                  )
                }}
              </p>
              <ToggleButton
                v-model="newPreset.transformations.horizontalFlip"
                :scale="0.6"
                :style="{ transform: 'translateX(16px)' }"
              />
            </div>
            <div class="content-aligned two-items">
              <p>
                {{
                  t('tools.preset.settings.createPreset.presetValues.transformations.verticalFlip')
                }}
              </p>
              <ToggleButton
                v-model="newPreset.transformations.verticalFlip"
                :scale="0.6"
                :style="{ transform: 'translateX(16px)' }"
              />
            </div>
          </div>
        </div>
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
              <ToggleButton
                v-model="newPreset.smartCrop.enabled"
                :scale="0.6"
                :style="{ transform: 'translateX(16px)' }"
              />
            </div>
            <div
              class="content-aligned two-items"
              :class="newPreset.smartCrop.enabled ? '' : 'disabled'"
            >
              <p>
                {{ t('tools.preset.settings.createPreset.presetValues.smartCrop.color') }}
              </p>
              <ColorPicker v-model="newPreset.smartCrop.color" />
            </div>
          </div>
        </div>
        <div v-if="isShowManualPresetSetting" class="settings-content-wrapper">
          <div class="content-wrapper">
            <div class="content-title">
              <p>
                {{ t('tools.preset.settings.createPreset.presetValues.grayScale.label') }}
              </p>
            </div>
            <div class="content-aligned two-items">
              <p>
                {{ t('tools.preset.settings.createPreset.presetValues.grayScale.enabled') }}
              </p>
              <ToggleButton
                v-model="newPreset.grayscale.enabled"
                :scale="0.6"
                :style="{ transform: 'translateX(16px)' }"
              />
            </div>
          </div>
        </div>
        <div v-if="isShowManualPresetSetting" class="settings-content-wrapper">
          <div class="content-wrapper">
            <div class="content-title">
              <p>
                <!-- frame -->
                {{ t('tools.preset.settings.createPreset.presetValues.frame.label') }}
              </p>
            </div>
            <div class="content-aligned two-items">
              <p>
                {{ t('tools.preset.settings.createPreset.presetValues.frame.enabled') }}
              </p>
              <ToggleButton
                v-model="newPreset.frame.enabled"
                :scale="0.6"
                :style="{ transform: 'translateX(16px)' }"
              />
            </div>
            <div
              class="content-aligned two-items"
              :class="newPreset.frame.enabled ? '' : 'disabled'"
            >
              <p>
                {{ t('tools.preset.settings.createPreset.presetValues.frame.type') }}
              </p>
              <DropdownSelect v-model="newPreset.frame.type" :options="presetFrameOptions" />
            </div>
            <div
              class="content-aligned two-items"
              :class="newPreset.frame.enabled ? '' : 'disabled'"
            >
              <p>
                {{ t('tools.preset.settings.createPreset.presetValues.frame.color') }}
              </p>
              <ColorPicker v-model="newPreset.frame.color" />
            </div>
            <div
              class="content-aligned two-items"
              :class="newPreset.frame.enabled ? '' : 'disabled'"
            >
              <p>
                {{ t('tools.preset.settings.createPreset.presetValues.frame.width') }}
              </p>
              <NumberInput
                ref="frameWidthRef"
                v-model="newPreset.frame.width"
                :min="0"
                :max="100"
                :step="1"
                unit="px"
                icon="IconArrowWidth"
                :iconTop="45"
                :onReset="() => resetFrameWidth()"
              />
            </div>
          </div>
        </div>
        <div v-if="isShowManualPresetSetting" class="settings-content-wrapper">
          <div class="content-wrapper">
            <div class="content-button">
              <DefaultButton
                :text="t('tools.preset.settings.createPreset.createPresetButton.text')"
                @click="createPreset()"
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
.content-aligned {
  width: 80%;
  display: flex;
  align-items: center;
  padding: 5px 0;
}
.one-item {
  justify-content: center;
}

.two-items {
  flex-direction: row;
  justify-content: space-between;
}
</style>
