<script setup>
import ToolsSettingsTabs from './ToolsSettingsTabs.vue'
import { useEditorStore } from '@/stores/editorStore'
import TextInput from '../common/TextInput.vue'
import DefaultButton from '../common/DefaultButton.vue'
import { usePresetTool } from '@/composables/tools/usePresetTool'
import { useImageStore } from '@/stores/imageStore'
import { useHistoryStore } from '@/stores/historyStore'
import { usePresetsStore } from '@/stores/presetsStore'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const editorStore = useEditorStore()

const { newPresetName, createPreset } = usePresetTool(
  useImageStore(),
  useHistoryStore(),
  useEditorStore(),
  usePresetsStore(),
  t,
)

const tabs = ['myPresets', 'createPreset']
</script>

<template>
  <div class="tool-settings">
    <ToolsSettingsTabs :tabs="tabs" />

    <div class="settings-wrapper">
      <div
        v-if="editorStore.selectedTabPerTool[editorStore.selectedToolKey] === 'createPreset'"
        class="specific-settings"
      >
        <div class="settings-content-wrapper">
          <div class="content-wrapper">
            <div class="content-title">
              <p>
                {{ $t('tools.preset.settings.createPreset.label') }}
              </p>
            </div>
            <TextInput v-model="newPresetName" />
            <div class="content-button">
              <DefaultButton
                :text="$t('tools.preset.settings.createPreset.createPresetButton.text')"
                @click="createPreset"
                :disabled="newPresetName === ''"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
