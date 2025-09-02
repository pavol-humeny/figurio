<script setup>
import ToolsSettingsTabs from './ToolsSettingsTabs.vue'
import DefaultButton from '../common/DefaultButton.vue'
import { useGrayscaleTool } from '@/composables/tools/useGrayscaleTool'
import { useImageStore } from '@/stores/imageStore'
import { useHistoryStore } from '@/stores/historyStore'
import { useI18n } from 'vue-i18n'
import ExplainItem from '../common/ExplainItem.vue'

const { t } = useI18n()

/**
 * Logic of the grayscale tool settings panel
 */
const { applyGrayscale, isGrayscaleApplied } = useGrayscaleTool(
  useImageStore(),
  useHistoryStore(),
  t,
)
</script>

<template>
  <div class="tool-settings">
    <ToolsSettingsTabs :tabs="[]" />
    <div class="settings-wrapper">
      <div class="specific-settings">
        <!-- Grayscale conversion button -->
        <div class="settings-content-wrapper">
          <ExplainItem :text="$t('tools.grayscale.explain')" :title="$t('tools.grayscale.label')" position="left" />
          <div class="content-wrapper">
            <DefaultButton :text="$t('tools.grayscale.settings.convertToGrayscaleButton.text')" @click="applyGrayscale"
              :disabled="isGrayscaleApplied" main />
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
