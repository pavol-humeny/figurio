<script setup>
import ToolsSettingsTabs from './ToolsSettingsTabs.vue'
import { useEditorStore } from '@/stores/editorStore'
import ColorPicker from '../common/ColorPicker.vue'
import DefaultButton from '../common/DefaultButton.vue'
import StepperInput from '../common/StepperInput.vue'
import { useSmartCropTool } from '@/composables/tools/useSmartCropTool'
import { useImageStore } from '@/stores/imageStore'
import { useHistoryStore } from '@/stores/historyStore'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const editorStore = useEditorStore()

const {
  isCropShown,
  selectedColor,
  topIndentMin,
  topIndentMax,
  rightIndentMin,
  rightIndentMax,
  bottomIndentMin,
  bottomIndentMax,
  leftIndentMin,
  leftIndentMax,
  topIndent,
  bottomIndent,
  leftIndent,
  rightIndent,
  showAutoSmartCrop,
  applyAutoSmartCrop,
  applyManualSmartCrop,
} = useSmartCropTool(useImageStore(), useHistoryStore(), useEditorStore(), t)

const tabs = ['auto', 'manual']
</script>

<template>
  <div class="tool-settings">
    <ToolsSettingsTabs :tabs="tabs" />

    <div class="settings-wrapper">
      <div
        v-if="editorStore.selectedTabPerTool[editorStore.selectedToolKey] === 'auto'"
        class="specific-settings"
      >
        <div class="settings-content-wrapper">
          <div class="content-wrapper">
            <div class="content-title">
              <p>{{ $t('tools.smartCrop.settings.auto.selectColor.title') }}</p>
            </div>
            <ColorPicker v-model="selectedColor" />
          </div>
        </div>
        <div class="settings-content-wrapper">
          <div class="content-wrapper">
            <div class="content-button">
              <DefaultButton
                :text="
                  isCropShown
                    ? $t('tools.smartCrop.settings.auto.showSmartCropAutoButton.text.hide')
                    : $t('tools.smartCrop.settings.auto.showSmartCropAutoButton.text.show')
                "
                @click="showAutoSmartCrop"
              />
            </div>
          </div>
        </div>
        <div class="settings-content-wrapper">
          <div class="content-wrapper">
            <div class="content-button">
              <DefaultButton
                :text="$t('tools.smartCrop.settings.auto.applySmartCropAutoButton.text')"
                @click="applyAutoSmartCrop"
              />
            </div>
          </div>
        </div>
        <div class="settings-content-wrapper" style="border: none">
          <!-- Empty space -->
        </div>
      </div>
      <div
        v-if="editorStore.selectedTabPerTool[editorStore.selectedToolKey] === 'manual'"
        class="specific-settings"
      >
        <div class="settings-content-wrapper">
          <div class="content-wrapper">
            <div class="content title">
              <p>{{ $t('tools.smartCrop.settings.manual.adjustment.title') }}</p>
            </div>
            <div class="content-title">
              <p>{{ $t('tools.smartCrop.settings.manual.adjustment.top') }}</p>
            </div>
            <StepperInput
              v-model="topIndent"
              :min="topIndentMin"
              :max="topIndentMax - 2"
              :step="1"
            />
            <div class="content-title">
              <p>{{ $t('tools.smartCrop.settings.manual.adjustment.right') }}</p>
            </div>
            <StepperInput
              v-model="rightIndent"
              :min="rightIndentMin"
              :max="rightIndentMax - 2"
              :step="1"
            />
            <div class="content-title">
              <p>{{ $t('tools.smartCrop.settings.manual.adjustment.bottom') }}</p>
            </div>
            <StepperInput
              v-model="bottomIndent"
              :min="bottomIndentMin"
              :max="bottomIndentMax - 2"
              :step="1"
            />
            <div class="content-title">
              <p>{{ $t('tools.smartCrop.settings.manual.adjustment.left') }}</p>
            </div>
            <StepperInput
              v-model="leftIndent"
              :min="leftIndentMin"
              :max="leftIndentMax - 2"
              :step="1"
            />
          </div>
        </div>
        <div class="settings-content-wrapper">
          <div class="content-wrapper">
            <div class="content-button">
              <DefaultButton
                :text="$t('tools.smartCrop.settings.manual.applySmartCropManualButton.text')"
                @click="applyManualSmartCrop"
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
