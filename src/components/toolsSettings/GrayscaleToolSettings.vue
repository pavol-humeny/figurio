<script setup>
import ToolsSettingsTabs from './ToolsSettingsTabs.vue'
import DefaultButton from '../common/DefaultButton.vue'
import { useGrayscaleTool } from '@/composables/tools/useGrayscaleTool'
import { useImageStore } from '@/stores/imageStore'
import { useHistoryStore } from '@/stores/historyStore'
import { useI18n } from 'vue-i18n'
import ExplainItem from '../common/ExplainItem.vue'
import DropdownSelect from '../common/DropdownSelect.vue'
import { useEditorStore } from '@/stores/editorStore'
const { t } = useI18n()

/**
 * Logic of the grayscale tool settings panel
 */
const {
  applyGrayscale,
  grayscaleType,
  grayscaleOptions,
} = useGrayscaleTool(
  useImageStore(),
  useEditorStore(),
  useHistoryStore(),
  t,
)

</script>

<template>
  <div class="tool-settings">
    <ToolsSettingsTabs :tabs="[]" />
    <div class="settings-wrapper">
      <div class="specific-settings">
        <!-- Grayscale type -->
        <div class="settings-content-wrapper">
          <ExplainItem :text="$t('tools.grayscale.explain')" :title="$t('tools.grayscale.label')" position="left" />
          <div class="content-title">
            <p> {{ $t('tools.grayscale.settings.grayscaleType.label') }}</p>
          </div>
          <div class="content-wrapper">
            <DropdownSelect v-model="grayscaleType" :options="grayscaleOptions"
              :tip="$t('tools.grayscale.settings.grayscaleType.tip')" />
          </div>
          <p class="grayscale-explain">
            {{ $t(`tools.grayscale.settings.options.${grayscaleType}Explained`) }}
          </p>
        </div>

        <!-- Grayscale conversion button -->
        <div class="settings-content-wrapper">
          <div class="content-wrapper">
            <DefaultButton :text="$t('tools.grayscale.settings.convertToGrayscaleButton.text')" @click="applyGrayscale"
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

<style scoped>
.grayscale-explain {
  text-align: center;
  padding: 10px 30px;
  opacity: 0.75;
  height: 75px;
}
</style>
