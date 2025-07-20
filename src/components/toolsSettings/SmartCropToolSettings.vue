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

/**
 * Logic of the smart crop tool settings panel
 */
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

/**
 * Tabs for the smart crop tool settings
 */
const tabs = ['auto', 'manual']
</script>

<template>
  <div class="tool-settings">
    <ToolsSettingsTabs :tabs="tabs" />

    <div class="settings-wrapper">
      <!-- Auto smart crop -->
      <div v-if="editorStore.selectedTabPerTool[editorStore.selectedToolKey] === 'auto'" class="specific-settings">
        <!-- Smart crop color -->
        <div class="settings-content-wrapper">
          <div class="content-wrapper">
            <div class="content-title">
              <p>{{ $t('tools.smartCrop.settings.auto.selectColor.title') }}</p>
            </div>
            <ColorPicker v-model="selectedColor" />
          </div>
        </div>

        <!-- Show button auto smart crop -->
        <div class="settings-content-wrapper">
          <div class="content-wrapper">
            <div class="content-button">
              <DefaultButton :text="isCropShown
                ? $t('tools.smartCrop.settings.auto.showSmartCropAutoButton.text.hide')
                : $t('tools.smartCrop.settings.auto.showSmartCropAutoButton.text.show')
                " @click="showAutoSmartCrop" />
            </div>
          </div>
        </div>

        <!-- Apply auto smart crop button -->
        <div class="settings-content-wrapper">
          <div class="content-wrapper">
            <div class="content-button">
              <DefaultButton :text="$t('tools.smartCrop.settings.auto.applySmartCropAutoButton.text')"
                @click="applyAutoSmartCrop" :disabled="!isCropShown" />
            </div>
          </div>
        </div>

        <!-- Empty space -->
        <div class="settings-content-wrapper" style="border: none">
          <!-- Empty space -->
        </div>
      </div>

      <!-- Manual smart crop -->
      <div v-if="editorStore.selectedTabPerTool[editorStore.selectedToolKey] === 'manual'" class="specific-settings">
        <!-- Manual adjustment -->
        <div class="settings-content-wrapper">
          <div class="content-wrapper">
            <div class="content title">
              <p>{{ $t('tools.smartCrop.settings.manual.adjustment.title') }}</p>
            </div>
            <div class="content-title">
              <p>{{ $t('tools.smartCrop.settings.manual.adjustment.top') }}</p>
            </div>
            <StepperInput v-model="topIndent" :min="topIndentMin" :max="topIndentMax - 2" :step="1" />
            <div class="content-title">
              <p>{{ $t('tools.smartCrop.settings.manual.adjustment.right') }}</p>
            </div>
            <StepperInput v-model="rightIndent" :min="rightIndentMin" :max="rightIndentMax - 2" :step="1" />
            <div class="content-title">
              <p>{{ $t('tools.smartCrop.settings.manual.adjustment.bottom') }}</p>
            </div>
            <StepperInput v-model="bottomIndent" :min="bottomIndentMin" :max="bottomIndentMax - 2" :step="1" />
            <div class="content-title">
              <p>{{ $t('tools.smartCrop.settings.manual.adjustment.left') }}</p>
            </div>
            <StepperInput v-model="leftIndent" :min="leftIndentMin" :max="leftIndentMax - 2" :step="1" />
          </div>
        </div>

        <!-- Apply manual smart crop -->
        <div class="settings-content-wrapper">
          <div class="content-wrapper">
            <div class="content-button">
              <DefaultButton :text="$t('tools.smartCrop.settings.manual.applySmartCropManualButton.text')"
                @click="applyManualSmartCrop" />
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
