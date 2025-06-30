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

const { t } = useI18n()

const editorStore = useEditorStore()

const {
  presetNameInputRef,
  presetFrameWidthRef,
  newPresetName,
  createPreset,
  savePreset,
  setFrameWidth,
  applyPreset,
  modifyPreset,
  closeModifying,
  deletePreset,
  useCurrentModifications,
  presetModifying,
  presetRotationOptions,
  presetFrameOptions,
  newPresetRotation,
  newPresetHorizontalFlip,
  newPresetVerticalFlip,
  newPresetSmartCrop,
  newPresetFrame,
  presetIsModified,
  presetsOptions,
  localPresetName,
  localImageOperations,
  selectedPresetName,
} = usePresetTool(useImageStore(), useHistoryStore(), useEditorStore(), usePresetsStore(), t)

const tabs = ['myPresets', 'createPreset']
</script>

<template>
  <div class="tool-settings">
    <ToolsSettingsTabs :tabs="tabs" />

    <div class="settings-wrapper">
      <div
        v-if="editorStore.selectedTabPerTool[editorStore.selectedToolKey] === 'createPreset'"
        class="specific-settings"
      >
        <div class="settings-content-wrapper">
          <div class="content-wrapper">
            <div class="content-title">
              <p>Preset name</p>
            </div>
            <TextInput
              ref="presetNameInputRef"
              v-model="newPresetName"
              :placeholder="$t('tools.preset.settings.createPreset.presetNamePlaceholder')"
              updateOnChange
            />
          </div>
        </div>
        <div class="settings-content-wrapper" :class="{ disabled: newPresetName === '' }">
          <div class="content-wrapper">
            <div class="content-button">
              <DefaultButton
                text="use current modifications as preset"
                @click="useCurrentModifications()"
              />
            </div>
          </div>
        </div>
        <div class="settings-content-wrapper" :class="{ disabled: newPresetName === '' }">
          <div class="content-wrapper">
            <div class="content-title">
              <p>Transformations</p>
            </div>
            <div class="content-text-input">
              <p>Rotation</p>
              <DropdownSelect
                v-model="newPresetRotation"
                :options="presetRotationOptions"
                :style="{ margin: '6px 0' }"
              />
            </div>
            <div class="content-text-input">
              <p>Horizontal flip</p>
              <ToggleButton v-model="newPresetHorizontalFlip" :scale="0.6" />
            </div>
            <div class="content-text-input">
              <p>Vertical flip</p>
              <ToggleButton v-model="newPresetVerticalFlip" :scale="0.6" />
            </div>
          </div>
        </div>
        <div class="settings-content-wrapper" :class="{ disabled: newPresetName === '' }">
          <div class="content-wrapper">
            <div class="content-text-input">
              <p>Smart Crop</p>
              <ToggleButton v-model="newPresetSmartCrop" :scale="0.6" />
            </div>
          </div>
        </div>
        <div class="settings-content-wrapper" :class="{ disabled: newPresetName === '' }">
          <div class="content-wrapper">
            <div class="content-title">
              <p>Frame</p>
            </div>
            <div class="content-text-input">
              <p>Enabled</p>
              <ToggleButton v-model="newPresetFrame.enabled" :scale="0.6" />
            </div>
            <div class="content-text-input" :class="{ disabled: !newPresetFrame.enabled }">
              <p>Color</p>
              <ColorPicker v-model="newPresetFrame.color" />
            </div>
            <div class="content-text-input" :class="{ disabled: !newPresetFrame.enabled }">
              <p>Width</p>
              <NumberInput
                ref="presetFrameWidthRef"
                v-model="newPresetFrame.width"
                :min="0"
                :max="100"
                :step="1"
                unit="px"
                @update="setFrameWidth(newPresetFrame.width)"
                icon="IconArrowWidth"
                :color="'var(--primary-c)'"
                size="22"
                :onReset="() => setFrameWidth(0)"
              />
            </div>
            <div class="content-text-input" :class="{ disabled: !newPresetFrame.enabled }">
              <p>Type</p>
              <DropdownSelect
                :style="{ padding: '6px 0' }"
                v-model="newPresetFrame.type"
                :options="presetFrameOptions"
              />
            </div>
          </div>
        </div>
        <div class="settings-content-wrapper">
          <div class="content-wrapper">
            <div class="content-button">
              <DefaultButton
                :text="$t('tools.preset.settings.createPreset.createPresetButton.text')"
                @click="createPreset()"
                :disabled="newPresetName === ''"
              />
            </div>
          </div>
        </div>
        <div class="settings-content-wrapper" style="border: none">
          <!-- Empty space -->
        </div>
      </div>

      <div
        v-if="editorStore.selectedTabPerTool[editorStore.selectedToolKey] === 'myPresets'"
        class="specific-settings"
      >
        <div class="settings-content-wrapper" v-if="!presetModifying">
          <div v-if="presetsOptions.length > 0" class="content-wrapper">
            <div class="content-title">
              <p>Select Preset</p>
            </div>
            <DropdownSelect v-model="selectedPresetName" :options="presetsOptions" />
          </div>
          <div v-else class="content-wrapper">
            <div class="content-title">
              <p>No presets</p>
            </div>
          </div>
        </div>
        <div v-if="selectedPresetName !== ''" class="settings-content-wrapper">
          <div class="content-wrapper">
            <div class="content-title">
              <p>Preset name</p>
            </div>
            <TextInput
              ref="presetNameInputRef"
              v-model="localPresetName"
              :placeholder="$t('tools.preset.settings.createPreset.presetNamePlaceholder')"
              updateOnChange
            />
          </div>
        </div>
        <div v-if="selectedPresetName !== '' && !presetModifying" class="settings-content-wrapper">
          <div class="content-wrapper">
            <div class="content-button">
              <DefaultButton text="Apply preset" @click="applyPreset()" />
            </div>
          </div>
        </div>
        <div
          v-if="selectedPresetName !== ''"
          class="settings-content-wrapper"
          :class="{ disabled: !presetModifying }"
        >
          <div class="content-wrapper">
            <div class="content-title">
              <p>Transformations</p>
            </div>
            <div class="content-text-input">
              <p>Rotation</p>
              <DropdownSelect
                v-model="localImageOperations.transformations.rotationAngle"
                :options="presetRotationOptions"
                :style="{ margin: '6px 0' }"
              />
            </div>
            <div class="content-text-input">
              <p>Horizontal flip</p>
              <ToggleButton
                v-model="localImageOperations.transformations.flipHorizontal"
                :scale="0.6"
              />
            </div>
            <div class="content-text-input">
              <p>Vertical flip</p>
              <ToggleButton
                v-model="localImageOperations.transformations.flipVertical"
                :scale="0.6"
              />
            </div>
          </div>
        </div>
        <div
          v-if="selectedPresetName !== ''"
          class="settings-content-wrapper"
          :class="{ disabled: !presetModifying }"
        >
          <div class="content-wrapper">
            <div class="content-text-input">
              <p>Smart Crop</p>
              <ToggleButton v-model="localImageOperations.smartCrop.enabled" :scale="0.6" />
            </div>
          </div>
        </div>
        <div
          v-if="selectedPresetName !== ''"
          class="settings-content-wrapper"
          :class="{ disabled: !presetModifying }"
        >
          <div class="content-wrapper">
            <div class="content-title">
              <p>Frame</p>
            </div>
            <div class="content-text-input">
              <p>Enabled</p>
              <ToggleButton v-model="localImageOperations.frame.enabled" :scale="0.6" />
            </div>
            <div
              class="content-text-input"
              :class="{ disabled: !localImageOperations.frame.enabled }"
            >
              <p>Color</p>
              <ColorPicker v-model="localImageOperations.frame.color" />
            </div>
            <div
              class="content-text-input"
              :class="{ disabled: !localImageOperations.frame.enabled }"
            >
              <p>Width</p>
              <NumberInput
                ref="presetFrameWidthRef"
                v-model="localImageOperations.frame.width"
                :min="0"
                :max="100"
                :step="1"
                unit="px"
                @update="setFrameWidth(localImageOperations.frame.width)"
                icon="IconArrowWidth"
                :color="'var(--primary-c)'"
                size="22"
                :onReset="() => setFrameWidth(0)"
              />
            </div>
            <div
              class="content-text-input"
              :class="{ disabled: !localImageOperations.frame.enabled }"
            >
              <p>Type</p>
              <DropdownSelect
                :style="{ padding: '6px 0' }"
                v-model="localImageOperations.frame.type"
                :options="presetFrameOptions"
              />
            </div>
          </div>
        </div>

        <div v-if="selectedPresetName !== '' && presetModifying" class="settings-content-wrapper">
          <div class="content-wrapper">
            <div class="content-button">
              <DefaultButton text="Delete" @click="deletePreset()" />
            </div>
          </div>
        </div>
        <div
          v-if="selectedPresetName !== '' && presetModifying && presetIsModified"
          class="settings-content-wrapper"
        >
          <div class="content-wrapper">
            <div class="content-button">
              <DefaultButton
                :text="$t('tools.preset.settings.createPreset.savePresetButton.text')"
                @click="savePreset()"
              />
            </div>
          </div>
        </div>
        <div
          v-if="selectedPresetName !== '' && presetModifying && !presetIsModified"
          class="settings-content-wrapper"
        >
          <div class="content-wrapper">
            <div class="content-button">
              <DefaultButton text="Close" @click="closeModifying()" />
            </div>
          </div>
        </div>
        <div v-if="selectedPresetName !== '' && !presetModifying" class="settings-content-wrapper">
          <div class="content-wrapper">
            <div class="content-button">
              <DefaultButton text="Modify Preset" @click="modifyPreset()" />
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

<style scoped></style>
