<script setup>
import ToolsSettingsTabs from './ToolsSettingsTabs.vue'
import DefaultButton from '../common/DefaultButton.vue'
import { useDarkLightConvertorTool } from '@/composables/tools/useDarkLightConvertorTool'
import { useImageStore } from '@/stores/imageStore'
import { useHistoryStore } from '@/stores/historyStore'
import { useI18n } from 'vue-i18n'
// import ExplainItem from '../common/ExplainItem.vue'
// import DropdownSelect from '../common/DropdownSelect.vue'
import { useEditorStore } from '@/stores/editorStore'
import { useUiStore } from '@/stores/uiStore'
const { t } = useI18n()

/**
 * Logic of the grayscale tool settings panel
 */
const {
  applyDarkLightConvertor,
} = useDarkLightConvertorTool(
  useImageStore(),
  useEditorStore(),
  useUiStore(),
  useHistoryStore(),
  t,
)

</script>

<template>
  <div class="tool-settings">
    <ToolsSettingsTabs :tabs="[]" />
    <div class="settings-wrapper">
      <div class="specific-settings">

        <!-- Dark/Light conversion button -->
        <div class="settings-content-wrapper">
          <div class="content-wrapper">
            <DefaultButton :text="$t('tools.darkLightConvertor.settings.convertToDarkLightButton.text')"
              @click="applyDarkLightConvertor" main />
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
