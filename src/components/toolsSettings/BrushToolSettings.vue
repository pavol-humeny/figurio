<script setup>
import ToolsSettingsTabs from './ToolsSettingsTabs.vue'
import DefaultButton from '../common/DefaultButton.vue'
import { useImageStore } from '@/stores/imageStore'
import { useHistoryStore } from '@/stores/historyStore'
import { useI18n } from 'vue-i18n'
import ExplainItem from '../common/ExplainItem.vue'
import { useBrushTool } from '@/composables/tools/useBrushTool'

const { t } = useI18n()

const {
  brushToolType,
  brushToolSize,
} = useBrushTool(
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
        <!-- Brush settings -->
        <div class="settings-content-wrapper">
          <ExplainItem :text="$t('tools.brush.explain')" :title="$t('tools.brush.label')" position="left" />
          <div class="content-wrapper">
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
