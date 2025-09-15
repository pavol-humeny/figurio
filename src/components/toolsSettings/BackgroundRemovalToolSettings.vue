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

const { t } = useI18n()

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
</script>

<template>
  <div class="tool-settings">
    <ToolsSettingsTabs :tabs="[]" />
    <div class="settings-wrapper">
      <div class="specific-settings">
        <!-- Background removal -->
        <div class="settings-content-wrapper">
          <ExplainItem :text="$t('tools.backgroundRemoval.explain')" :title="$t('tools.backgroundRemoval.label')"
            position="left" />
          <div class="content-wrapper">
            <div class="content-title">
              <p>
                {{ $t('tools.backgroundRemoval.settings.general.backgroundColor.label') }}
              </p>
            </div>
            <ColorPicker v-model="backgroundColor"
              :tip="$t('tools.backgroundRemoval.settings.general.backgroundColor.tip')" position="bottom-left" />
          </div>
        </div>

        <div class="settings-content-wrapper">
          <div class="content-wrapper">
            <div class="content-title">
              <p>
                {{ $t('tools.backgroundRemoval.settings.general.removalSensitivity.label') }}
              </p>
            </div>
            <NumberDropdownInput v-model="removalThreshold" :min="0" :max="0.9" :step="0.01"
              :options="removalThresholdOptions"
              :tip="$t('tools.backgroundRemoval.settings.general.removalSensitivity.tip')" position="bottom-left" />
          </div>
        </div>

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
