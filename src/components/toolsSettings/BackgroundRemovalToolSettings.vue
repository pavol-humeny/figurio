<script setup>
import ToolsSettingsTabs from './ToolsSettingsTabs.vue'
import DefaultButton from '../common/DefaultButton.vue'
import { useImageStore } from '@/stores/imageStore'
import { useHistoryStore } from '@/stores/historyStore'
import { useI18n } from 'vue-i18n'
import ExplainItem from '../common/ExplainItem.vue'
import { useBackgroundRemovalTool } from '@/composables/tools/useBackgroundRemovalTool'
import ColorPicker from '../common/ColorPicker.vue'
import NumberDropdownInput from '../common/NumberDropdownInput.vue'
import { useWorkspaceStore } from '@/stores/workspaceStore'
import { useEditorStore } from '@/stores/editorStore'
import BaseIcon from '@/components/icons/BaseIcon.vue'
import NumberInput from '../common/NumberInput.vue'
import ItemTip from '../common/ItemTip.vue'
import ToggleButton from '../common/ToggleButton.vue'

const { t } = useI18n()
const editorStore = useEditorStore()

/**
 * Logic for background removal
 */
const {
  applyBackgroundRemoval,
  colorRemovalThresholdOptions,
  colorRemovalThreshold,
  colorBackgroundColor,
  manualSelectedTool,
  manualToolSize,
  manualSelectTool,
  manualMaxToolSize,
  clearAllSelections,
  invertSelection,
  useBaseImage,
  detectObjectsClick,
  replaceSelectionWithObjectDetection,
} = useBackgroundRemovalTool(
  useImageStore(),
  useHistoryStore(),
  useWorkspaceStore(),
  useEditorStore(),
  t,
)

/**
 * Tabs for the background removal tool settings
 */
const tabs = ['color', 'manual', 'objectDetection']
</script>

<template>
  <div class="tool-settings">
    <ToolsSettingsTabs :tabs="tabs" />
    <div class="settings-wrapper">
      <!-- Color removal -->
      <div v-if="editorStore.selectedTabPerTool[editorStore.selectedToolKey] === 'color'" class="specific-settings">
        <!-- Color-->
        <div class="settings-content-wrapper">
          <ExplainItem :text="$t('tools.backgroundRemoval.subTools.color.explain')"
            :title="$t('tools.backgroundRemoval.subTools.color.label')" position="left" />
          <div class="content-wrapper">
            <div class="content-title">
              <p>
                {{ $t('tools.backgroundRemoval.settings.color.backgroundColor.label') }}
              </p>
            </div>
            <ColorPicker v-model="colorBackgroundColor"
              :tip="$t('tools.backgroundRemoval.settings.color.backgroundColor.tip')" position="bottom-left" />
          </div>
        </div>

        <!-- Sensitivity -->
        <div class="settings-content-wrapper">
          <div class="content-wrapper">
            <div class="content-title">
              <p>
                {{ $t('tools.backgroundRemoval.settings.color.removalSensitivity.label') }}
              </p>
            </div>
            <NumberDropdownInput v-model="colorRemovalThreshold" :min="0" :max="0.9" :step="0.01"
              :options="colorRemovalThresholdOptions"
              :tip="$t('tools.backgroundRemoval.settings.color.removalSensitivity.tip')" position="bottom-left" />
          </div>
        </div>

        <!-- Remove background button -->
        <div class="settings-content-wrapper">
          <div class="content-wrapper">
            <DefaultButton :text="$t('tools.backgroundRemoval.settings.color.removeButton.text')"
              @click="applyBackgroundRemoval('color')" main />
          </div>
        </div>

        <!-- Empty space -->
        <div class="settings-content-wrapper" style="border: none">
          <!-- Empty space -->
        </div>
      </div>

      <!-- Manual removal -->
      <div v-if="editorStore.selectedTabPerTool[editorStore.selectedToolKey] === 'manual'" class="specific-settings">
        <!-- Selected tool -->
        <div class="settings-content-wrapper">
          <ExplainItem :text="$t('tools.backgroundRemoval.subTools.manual.explain')"
            :title="$t('tools.backgroundRemoval.subTools.manual.label')" position="left" />
          <div class="content-wrapper">
            <div class="content-title">
              <p>
                {{ $t('tools.backgroundRemoval.settings.manual.selectedTool.label') }}
              </p>
            </div>
            <div class="manual-tool-select-wrapper">
              <ItemTip :text="$t('tools.backgroundRemoval.settings.manual.selectedTool.options.tipBrush')"
                position="bottom">
                <button @click="manualSelectTool('brush')" class="button button-control button-circle"
                  :class="{ selected: manualSelectedTool === 'brush' }">
                  <BaseIcon name="IconBrush" size="24" />
                </button>
              </ItemTip>

              <ItemTip :text="$t('tools.backgroundRemoval.settings.manual.selectedTool.options.tipEraser')"
                position="bottom">
                <button @click="manualSelectTool('eraser')" class="button button-control button-circle"
                  :class="{ selected: manualSelectedTool === 'eraser' }">
                  <BaseIcon name="IconEraser" size="24" />
                </button>
              </ItemTip>
            </div>
          </div>
        </div>

        <!-- Tool size -->
        <div class="settings-content-wrapper">
          <div class="content-wrapper">
            <div class="content-title">
              <p>
                {{ $t('tools.backgroundRemoval.settings.manual.toolSize.label') }}
              </p>
            </div>
            <NumberInput v-model="manualToolSize" :min="1" :max="manualMaxToolSize" :step="1" unit="px"
              :tip="$t('tools.backgroundRemoval.settings.manual.toolSize.tip')" position="bottom-left" />
          </div>
        </div>

        <!-- Clear all button -->
        <div class="settings-content-wrapper">
          <div class="content-wrapper">
            <DefaultButton :text="$t('tools.backgroundRemoval.settings.manual.clearAllButton.text')"
              :tip="$t('tools.backgroundRemoval.settings.manual.clearAllButton.tip')" position="bottom-left"
              @click="clearAllSelections" />
          </div>
        </div>

        <!-- Invert selection button -->
        <div class="settings-content-wrapper">
          <div class="content-wrapper">
            <DefaultButton :text="$t('tools.backgroundRemoval.settings.manual.invertSelectionButton.text')"
              :tip="$t('tools.backgroundRemoval.settings.manual.invertSelectionButton.tip')" position="bottom-left"
              @click="invertSelection" />
          </div>
        </div>

        <!-- Use base image -->
        <div class="settings-content-wrapper">
          <div class="content-wrapper">
            <div class="content-aligned two-items">
              <p style="text-align: start">
                {{ $t('tools.backgroundRemoval.settings.manual.useBaseImage.label') }}
              </p>
              <ToggleButton v-model="useBaseImage" :scale="0.6" :style="{ transform: 'translateX(16px)' }"
                :tip="$t('tools.backgroundRemoval.settings.manual.useBaseImage.tip')" position="bottom-left" />
            </div>
          </div>
        </div>

        <!-- Remove background button -->
        <div class="settings-content-wrapper">
          <div class="content-wrapper">
            <DefaultButton :text="$t('tools.backgroundRemoval.settings.manual.removeButton.text')"
              @click="applyBackgroundRemoval('manual')" main />
          </div>
        </div>

        <!-- Empty space -->
        <div class="settings-content-wrapper" style="border: none">
          <!-- Empty space -->
        </div>
      </div>

      <!-- Object detection removal -->
      <div v-if="editorStore.selectedTabPerTool[editorStore.selectedToolKey] === 'objectDetection'"
        class="specific-settings">
        <!-- Add selection or replace -->
        <div class="settings-content-wrapper">
          <ExplainItem :text="$t('tools.backgroundRemoval.subTools.objectDetection.explain')"
            :title="$t('tools.backgroundRemoval.subTools.objectDetection.label')" position="left" />
          <div class="content-wrapper">
            <div class="content-aligned two-items">
              <p style="text-align: start">
                {{ $t('tools.backgroundRemoval.settings.objectDetection.replaceSelection.label') }}
              </p>
              <ToggleButton v-model="replaceSelectionWithObjectDetection" :scale="0.6"
                :style="{ transform: 'translateX(16px)' }"
                :tip="$t('tools.backgroundRemoval.settings.objectDetection.replaceSelection.tip')"
                position="bottom-left" />
            </div>
          </div>
        </div>

        <!-- Detect objects -->
        <div class="settings-content-wrapper">
          <div class="content-wrapper">
            <DefaultButton :text="$t('tools.backgroundRemoval.settings.objectDetection.detectButton.text')"
              :tip="$t('tools.backgroundRemoval.settings.objectDetection.detectButton.tip')" position="bottom-left"
              @click="detectObjectsClick" />
          </div>
        </div>

        <!-- Clear all button -->
        <div class="settings-content-wrapper">
          <div class="content-wrapper">
            <DefaultButton :text="$t('tools.backgroundRemoval.settings.objectDetection.clearAllButton.text')"
              :tip="$t('tools.backgroundRemoval.settings.objectDetection.clearAllButton.tip')" position="bottom-left"
              @click="clearAllSelections" />
          </div>
        </div>

        <!-- Invert selection button -->
        <div class="settings-content-wrapper">
          <div class="content-wrapper">
            <DefaultButton :text="$t('tools.backgroundRemoval.settings.manual.invertSelectionButton.text')"
              :tip="$t('tools.backgroundRemoval.settings.objectDetection.invertSelectionButton.tip')"
              position="bottom-left" @click="invertSelection" />
          </div>
        </div>

        <!-- Remove background button -->
        <div class="settings-content-wrapper">
          <div class="content-wrapper">
            <DefaultButton :text="$t('tools.backgroundRemoval.settings.objectDetection.removeButton.text')"
              @click="applyBackgroundRemoval('objectDetection')" main />
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

<style scoped>
.manual-tool-select-wrapper {
  display: flex;
  flex-direction: row;
  gap: 15px;
}

.selected {
  background: var(--primary-c);
  color: var(--secondary-c);
}
</style>
