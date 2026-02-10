<script setup>
import ToolsSettingsTabs from './ToolsSettingsTabs.vue'
import DefaultButton from '../common/DefaultButton.vue'
import ExplainItem from '../common/ExplainItem.vue'
import { useImageAnalysis } from '@/composables/tools/useImageAnalysis';
import { useImageStore } from '@/stores/imageStore';
import { useUiStore } from '@/stores/uiStore';
import { useI18n } from 'vue-i18n'
import { useViewportStore } from '@/stores/viewportStore';
import { useHistoryStore } from '@/stores/historyStore';
import DefaultSlider from '../common/DefaultSlider.vue';
import { editorConfig } from '@/config/editorConfig';
import { useEditorStore } from '@/stores/editorStore';
import { useWorkspaceStore } from '@/stores/workspaceStore';

const { t } = useI18n()

/**
 * Logic of the image analysis tool settings panel
 */
const {
  analyzeNoise,
  removeNoise,
  noiseCanBeRemoved,
  noiseSensitivity
} = useImageAnalysis(useImageStore(), useViewportStore(), useUiStore(), useHistoryStore(), useEditorStore(), useWorkspaceStore(), t)

</script>

<template>
  <div class="tool-settings">
    <ToolsSettingsTabs :tabs="[]" />
    <div class="settings-wrapper">
      <div class="specific-settings">
        <!-- Noise detection -->
        <div class="settings-content-wrapper">
          <ExplainItem :text="$t('tools.imageAnalysis.explain')" :title="$t('tools.imageAnalysis.label')"
            position="left" />
          <div class="content-title">
            <p> {{ $t('tools.imageAnalysis.settings.noiseDetection.sensitivity.label') }}</p>
          </div>

          <!-- Noise sensitivity -->
          <div class="content-wrapper">
            <DefaultSlider :min="0.1" :tip="$t('tools.imageAnalysis.settings.noiseDetection.sensitivity.tip')"
              :max="editorConfig.maxNoiseSensitivity" :step="0.1" v-model="noiseSensitivity" showValue valueUnit="x"
              :onReset="() => noiseSensitivity = 1" position="bottom-left" />
          </div>
        </div>

        <!-- Noise detection -->
        <div class="settings-content-wrapper">
          <div class="content-wrapper">
            <DefaultButton :text="$t('tools.imageAnalysis.settings.noiseDetection.noiseDetectionButton.text')"
              :tip="$t('tools.imageAnalysis.settings.noiseDetection.noiseDetectionButton.tip')" @click="analyzeNoise"
              main position="bottom-left" />
          </div>
        </div>

        <!-- Noise removal -->
        <div class="settings-content-wrapper">
          <div class="content-wrapper">
            <DefaultButton :text="$t('tools.imageAnalysis.settings.noiseDetection.removeNoiseButton.text')"
              :tip="$t('tools.imageAnalysis.settings.noiseDetection.removeNoiseButton.tip')" @click="removeNoise"
              :disabled="!noiseCanBeRemoved" main position="bottom-left" />
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
