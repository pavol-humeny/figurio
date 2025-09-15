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

const { t } = useI18n()
const editorStore = useEditorStore()

/**
 * Logic for background removal
 */
const {
  applyBackgroundRemoval,
  removalThresholdOptions,
  removalThreshold,
  backgroundColor,
} = useBackgroundRemovalTool(
  useImageStore(),
  useHistoryStore(),
  useWorkspaceStore(),
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
            <ColorPicker v-model="backgroundColor"
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
            <NumberDropdownInput v-model="removalThreshold" :min="0" :max="0.9" :step="0.01"
              :options="removalThresholdOptions"
              :tip="$t('tools.backgroundRemoval.settings.color.removalSensitivity.tip')" position="bottom-left" />
          </div>
        </div>

        <!-- Remove background button -->
        <div class="settings-content-wrapper">
          <div class="content-wrapper">
            <DefaultButton :text="$t('tools.backgroundRemoval.settings.general.removeBackgroundButton.text')"
              @click="applyBackgroundRemoval" main />
          </div>
        </div>

        <!-- Empty space -->
        <div class="settings-content-wrapper" style="border: none">
          <!-- Empty space -->
        </div>
      </div>

      <!-- Manual removal -->
      <div v-if="editorStore.selectedTabPerTool[editorStore.selectedToolKey] === 'manual'" class="specific-settings">
        <!-- -->
        <div class="settings-content-wrapper">
          <ExplainItem :text="$t('tools.backgroundRemoval.subTools.manual.explain')"
            :title="$t('tools.backgroundRemoval.subTools.manual.label')" position="left" />
          <div class="content-wrapper">
            <div class="content-title">
              <p>
                {{ $t('tools.backgroundRemoval.settings.color.backgroundColor.label') }}
              </p>
            </div>
            <!--  -->
          </div>
        </div>

        <!-- Remove background button -->
        <div class="settings-content-wrapper">
          <div class="content-wrapper">
            <DefaultButton :text="$t('tools.backgroundRemoval.settings.general.removeBackgroundButton.text')"
              @click="applyBackgroundRemoval" main />
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
        <!-- -->
        <div class="settings-content-wrapper">
          <ExplainItem :text="$t('tools.backgroundRemoval.subTools.objectDetection.explain')"
            :title="$t('tools.backgroundRemoval.subTools.objectDetection.label')" position="left" />
          <div class="content-wrapper">
            <div class="content-title">
              <p>
                {{ $t('tools.backgroundRemoval.settings.color.backgroundColor.label') }}
              </p>
            </div>
            <!--  -->
          </div>
        </div>

        <!-- Remove background button -->
        <div class="settings-content-wrapper">
          <div class="content-wrapper">
            <DefaultButton :text="$t('tools.backgroundRemoval.settings.general.removeBackgroundButton.text')"
              @click="applyBackgroundRemoval" main />
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
