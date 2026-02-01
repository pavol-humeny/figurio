<script setup>
import ToolsSettingsTabs from './ToolsSettingsTabs.vue'
import DefaultButton from '../common/DefaultButton.vue'
import ExplainItem from '../common/ExplainItem.vue'
import { useImageAnalysis } from '@/composables/tools/useImageAnalysis';
import { useImageStore } from '@/stores/imageStore';
import { useUiStore } from '@/stores/uiStore';
import { useI18n } from 'vue-i18n'
import { useViewportStore } from '@/stores/viewportStore';

const { t } = useI18n()

/**
 * Logic of the image analysis tool settings panel
 */
const {
  analyzeNoise,
} = useImageAnalysis(useImageStore(), useViewportStore(), useUiStore(), t)

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
            <p> {{ $t('tools.imageAnalysis.settings.noiseDetection.title') }}</p>
          </div>
          <div class="content-wrapper">
            <DefaultButton :text="$t('tools.imageAnalysis.settings.noiseDetection.noiseDetectionButton.text')"
              :tip="$t('tools.imageAnalysis.settings.noiseDetection.noiseDetectionButton.tip')" @click="analyzeNoise"
              main />
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
