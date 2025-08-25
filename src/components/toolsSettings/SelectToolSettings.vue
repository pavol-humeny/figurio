<script setup>
import ToolsSettingsTabs from './ToolsSettingsTabs.vue'
import DefaultButton from '../common/DefaultButton.vue';
import { useImageStore } from '@/stores/imageStore';
import { useSvgObjects } from '@/composables/tools/useSvgObjects';
import { useI18n } from 'vue-i18n';
import { useHistoryStore } from '@/stores/historyStore';
import { useViewportStore } from '@/stores/viewportStore';
import { useEditorStore } from '@/stores/editorStore';
import { useUiStore } from '@/stores/uiStore';

const { t } = useI18n()
const imageStore = useImageStore()

/**
 * Logic for manipulating SVG objects
 */
const {
  selectAllSvgObjects,
  deselectAllSvgObjects,
  deleteSelectedSvgObjects
} = useSvgObjects(useImageStore(), useHistoryStore(), useViewportStore(), useEditorStore(), useUiStore(), t);


</script>

<template>
  <div class="tool-settings">
    <ToolsSettingsTabs :tabs="[]" />
    <div class="settings-wrapper">
      <div class="specific-settings">
        <!-- Select all -->
        <div class="settings-content-wrapper">
          <div class="content-wrapper">
            <DefaultButton :text="$t('tools.select.settings.general.selectAllButton.text')" @click="selectAllSvgObjects"
              :disabled="imageStore.selectedSvgObjectIds.length === imageStore.svgObjects.length" />
          </div>
        </div>

        <!-- Deselect all -->
        <div class="settings-content-wrapper">
          <div class="content-wrapper">
            <DefaultButton :text="$t('tools.select.settings.general.deselectAllButton.text')"
              @click="deselectAllSvgObjects" :disabled="imageStore.selectedSvgObjectIds.length === 0" />
          </div>
        </div>

        <!-- Delete selected -->
        <div class="settings-content-wrapper">
          <div class="content-wrapper">
            <DefaultButton :text="$t('tools.select.settings.general.deleteSelectedButton.text')"
              @click="deleteSelectedSvgObjects" :disabled="imageStore.selectedSvgObjectIds.length === 0" />
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
