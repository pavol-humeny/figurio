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
  changeManualToolSize,
  manualSelectTool,
  manualMaxToolSize,
  manualMinToolSize,
  clearAllSelections,
  invertSelection,
  useBaseImage,
  detectObjectsClick,
  replaceSelection,
  selectColorClick,
  highlightRemovedPixels,
  backgroundReplacementColor,
  replaceWithBackgroundColor,
  softEdgesRadius,
  boundaryOffset,
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
        <!-- Add selection or replace -->
        <div class="settings-content-wrapper">
          <ExplainItem :text="$t('tools.backgroundRemoval.subTools.color.explain')"
            :title="$t('tools.backgroundRemoval.subTools.color.label')" position="left" />
          <div class="content-wrapper">
            <div class="content-aligned two-items">
              <p style="text-align: start">
                {{ $t('tools.backgroundRemoval.settings.color.replaceSelection.label') }}
              </p>
              <ToggleButton v-model="replaceSelection" :scale="0.6" :style="{ transform: 'translateX(16px)' }"
                :tip="$t('tools.backgroundRemoval.settings.objectDetection.replaceSelection.tip')"
                position="bottom-left" />
            </div>
          </div>
        </div>

        <!-- Color-->
        <div class="settings-content-wrapper">
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

        <!-- Soft edge radius -->
        <div class="settings-content-wrapper">
          <div class="content-wrapper">
            <div class="content-title">
              {{ $t('tools.backgroundRemoval.settings.manual.edgeSoftness.label') }}
            </div>
            <NumberDropdownInput v-model="softEdgesRadius" :min="0" :max="1" :step="0.1"
              :options="[0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1]"
              :tip="$t('tools.backgroundRemoval.settings.manual.edgeSoftness.tip')" position="bottom-left" />
          </div>
        </div>

        <!-- Mask boundary offset -->
        <div class="settings-content-wrapper">
          <div class="content-wrapper">
            <div class="content-title">
              {{ $t('tools.backgroundRemoval.settings.manual.boundaryOffset.label') }}
            </div>
            <NumberDropdownInput v-model="boundaryOffset" :min="-5" :max="5" :step="1"
              :options="[-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5]"
              :tip="$t('tools.backgroundRemoval.settings.manual.boundaryOffset.tip')" position="bottom-left" />
          </div>
        </div>

        <!-- Select color -->
        <div class="settings-content-wrapper">
          <div class="content-wrapper">
            <DefaultButton :text="$t('tools.backgroundRemoval.settings.color.selectColorButton.text')"
              @click="selectColorClick()" main />
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

        <!-- Select removed part -->
        <div class="settings-content-wrapper">
          <div class="content-wrapper">
            <DefaultButton :text="$t('tools.backgroundRemoval.settings.manual.selectRemovedButton.text')"
              :tip="$t('tools.backgroundRemoval.settings.manual.selectRemovedButton.tip')" position="bottom-left"
              @click="highlightRemovedPixels" />
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

        <!-- Replace background with color -->
        <div class="settings-content-wrapper">
          <div class="content-wrapper">
            <div class="content-aligned two-items">
              <p style="text-align: start">
                {{ $t('tools.backgroundRemoval.settings.manual.replaceBackgroundColor.label') }}
              </p>
              <ToggleButton v-model="replaceWithBackgroundColor" :scale="0.6" :style="{ transform: 'translateX(16px)' }"
                :tip="$t('tools.backgroundRemoval.settings.manual.replaceBackgroundColor.tip')"
                position="bottom-left" />
            </div>

            <!-- Replacement color -->
            <div v-if="replaceWithBackgroundColor" class="content-aligned two-items">
              <p style="text-align: start">
                {{ $t('tools.backgroundRemoval.settings.manual.backgroundReplacementColor.label') }}
              </p>
              <ColorPicker v-model="backgroundReplacementColor"
                :tip="$t('tools.backgroundRemoval.settings.manual.backgroundReplacementColor.tip')"
                position="bottom-left" />
            </div>
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
            <NumberInput v-model="manualToolSize" :min="manualMinToolSize" :max="manualMaxToolSize" :step="1" unit="px"
              @update="changeManualToolSize(manualToolSize)"
              :tip="$t('tools.backgroundRemoval.settings.manual.toolSize.tip')" position="bottom-left" />
          </div>
        </div>

        <!-- Soft edge radius -->
        <div class="settings-content-wrapper">
          <div class="content-wrapper">
            <div class="content-title">
              {{ $t('tools.backgroundRemoval.settings.manual.edgeSoftness.label') }}
            </div>
            <NumberDropdownInput v-model="softEdgesRadius" :min="0" :max="1" :step="0.1"
              :options="[0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1]"
              :tip="$t('tools.backgroundRemoval.settings.manual.edgeSoftness.tip')" position="bottom-left" />
          </div>
        </div>

        <!-- Mask boundary offset -->
        <div class="settings-content-wrapper">
          <div class="content-wrapper">
            <div class="content-title">
              {{ $t('tools.backgroundRemoval.settings.manual.boundaryOffset.label') }}
            </div>
            <NumberDropdownInput v-model="boundaryOffset" :min="-5" :max="5" :step="1"
              :options="[-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5]"
              :tip="$t('tools.backgroundRemoval.settings.manual.boundaryOffset.tip')" position="bottom-left" />
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

        <!-- Select removed part -->
        <div class="settings-content-wrapper">
          <div class="content-wrapper">
            <DefaultButton :text="$t('tools.backgroundRemoval.settings.manual.selectRemovedButton.text')"
              :tip="$t('tools.backgroundRemoval.settings.manual.selectRemovedButton.tip')" position="bottom-left"
              @click="highlightRemovedPixels" />
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

        <!-- Replace background with color -->
        <div class="settings-content-wrapper">
          <div class="content-wrapper">
            <div class="content-aligned two-items">
              <p style="text-align: start">
                {{ $t('tools.backgroundRemoval.settings.manual.replaceBackgroundColor.label') }}
              </p>
              <ToggleButton v-model="replaceWithBackgroundColor" :scale="0.6" :style="{ transform: 'translateX(16px)' }"
                :tip="$t('tools.backgroundRemoval.settings.manual.replaceBackgroundColor.tip')"
                position="bottom-left" />
            </div>

            <!-- Replacement color -->
            <div v-if="replaceWithBackgroundColor" class="content-aligned two-items">
              <p style="text-align: start">
                {{ $t('tools.backgroundRemoval.settings.manual.backgroundReplacementColor.label') }}
              </p>
              <ColorPicker v-model="backgroundReplacementColor"
                :tip="$t('tools.backgroundRemoval.settings.manual.backgroundReplacementColor.tip')"
                position="bottom-left" />
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
              <ToggleButton v-model="replaceSelection" :scale="0.6" :style="{ transform: 'translateX(16px)' }"
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
              @click="detectObjectsClick" main />
          </div>
        </div>

        <!-- Soft edge radius -->
        <div class="settings-content-wrapper">
          <div class="content-wrapper">
            <div class="content-title">
              {{ $t('tools.backgroundRemoval.settings.manual.edgeSoftness.label') }}
            </div>
            <NumberDropdownInput v-model="softEdgesRadius" :min="0" :max="1" :step="0.1"
              :options="[0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1]"
              :tip="$t('tools.backgroundRemoval.settings.manual.edgeSoftness.tip')" position="bottom-left" />
          </div>
        </div>

        <!-- Mask boundary offset -->
        <div class="settings-content-wrapper">
          <div class="content-wrapper">
            <div class="content-title">
              {{ $t('tools.backgroundRemoval.settings.manual.boundaryOffset.label') }}
            </div>
            <NumberDropdownInput v-model="boundaryOffset" :min="-5" :max="5" :step="1"
              :options="[-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5]"
              :tip="$t('tools.backgroundRemoval.settings.manual.boundaryOffset.tip')" position="bottom-left" />
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

        <!-- Select removed part -->
        <div class="settings-content-wrapper">
          <div class="content-wrapper">
            <DefaultButton :text="$t('tools.backgroundRemoval.settings.manual.selectRemovedButton.text')"
              :tip="$t('tools.backgroundRemoval.settings.manual.selectRemovedButton.tip')" position="bottom-left"
              @click="highlightRemovedPixels" />
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

        <!-- Replace background with color -->
        <div class="settings-content-wrapper">
          <div class="content-wrapper">
            <div class="content-aligned two-items">
              <p style="text-align: start">
                {{ $t('tools.backgroundRemoval.settings.manual.replaceBackgroundColor.label') }}
              </p>
              <ToggleButton v-model="replaceWithBackgroundColor" :scale="0.6" :style="{ transform: 'translateX(16px)' }"
                :tip="$t('tools.backgroundRemoval.settings.manual.replaceBackgroundColor.tip')"
                position="bottom-left" />
            </div>

            <!-- Replacement color -->
            <div v-if="replaceWithBackgroundColor" class="content-aligned two-items">
              <p style="text-align: start">
                {{ $t('tools.backgroundRemoval.settings.manual.backgroundReplacementColor.label') }}
              </p>
              <ColorPicker v-model="backgroundReplacementColor"
                :tip="$t('tools.backgroundRemoval.settings.manual.backgroundReplacementColor.tip')"
                position="bottom-left" />
            </div>
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
