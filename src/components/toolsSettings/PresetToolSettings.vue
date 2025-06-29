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
  newPresetName,
  createPreset,
  savePreset,
  setFrameWidth,
  newPresetCreated,
  presetRotationOptions,
  presetFrameOptions,
  newPresetRotation,
  newPresetHorizontalFlip,
  newPresetVerticalFlip,
  newPresetSmartCrop,
  newPresetFrame,
  presetFrameWidthRef,
  newPresetIsModified,
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
              <p>
                {{ $t('tools.preset.settings.createPreset.label') }}
              </p>
            </div>
            <TextInput
              ref="presetNameInputRef"
              v-model="newPresetName"
              :placeholder="$t('tools.preset.settings.createPreset.presetNamePlaceholder')"
              updateOnChange
            />
            <div class="content-button">
              <DefaultButton
                v-if="!newPresetCreated"
                :text="$t('tools.preset.settings.createPreset.createPresetButton.text')"
                @click="createPreset()"
                :disabled="newPresetName === ''"
              />
            </div>
          </div>
        </div>
        <div v-if="newPresetCreated" class="settings-content-wrapper">
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
        <div v-if="newPresetCreated" class="settings-content-wrapper">
          <div class="content-wrapper">
            <div class="content-text-input">
              <p>Smart Crop</p>
              <ToggleButton v-model="newPresetSmartCrop" :scale="0.6" />
            </div>
          </div>
        </div>
        <div v-if="newPresetCreated" class="settings-content-wrapper">
          <div class="content-wrapper">
            <div class="content-title">
              <p>Frame</p>
            </div>
            <div class="content-text-input">
              <p>Color</p>
              <ColorPicker :style="{ margin: '6px 0' }" v-model="newPresetFrame.color" />
            </div>
            <div class="content-text-input">
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
            <div class="content-text-input">
              <p>Type</p>
              <DropdownSelect
                :style="{ padding: '6px 0' }"
                v-model="newPresetFrame.type"
                :options="presetFrameOptions"
              />
            </div>
          </div>
        </div>
        <div v-if="newPresetCreated" class="settings-content-wrapper">
          <div class="content-wrapper">
            <div class="content-button">
              <DefaultButton
                :text="$t('tools.preset.settings.createPreset.savePresetButton.text')"
                @click="savePreset()"
                :disabled="!newPresetIsModified"
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

<style scoped></style>
