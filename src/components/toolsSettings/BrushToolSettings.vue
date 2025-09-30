<script setup>
import ToolsSettingsTabs from './ToolsSettingsTabs.vue'
import DefaultButton from '../common/DefaultButton.vue'
import { useImageStore } from '@/stores/imageStore'
import { useHistoryStore } from '@/stores/historyStore'
import { useI18n } from 'vue-i18n'
import ExplainItem from '../common/ExplainItem.vue'
import { useBrushTool } from '@/composables/tools/useBrushTool'
import { useEditorStore } from '@/stores/editorStore'
import NumberInput from '../common/NumberInput.vue'
import ColorPicker from '../common/ColorPicker.vue'


const { t } = useI18n()
const editorStore = useEditorStore()
const imageStore = useImageStore()

const {
  brushToolSize,
  changeBrushToolSize,
  brushMaxToolSize,
  brushMinToolSize,
  brushColor,
  saveColorToStore,
  rasterizeImage,
} = useBrushTool(
  useImageStore(),
  useHistoryStore(),
  useEditorStore(),
  t,
)

const tabs = ['brush', 'eraser']

</script>

<template>
  <div class="tool-settings">
    <ToolsSettingsTabs :tabs="tabs" />
    <div class="settings-wrapper">
      <div v-if="editorStore.selectedTabPerTool[editorStore.selectedToolKey] === 'brush'" class="specific-settings">
        <!-- Rasterize button -->
        <div class="settings-content-wrapper">
          <ExplainItem :text="$t('tools.brush.subTools.brush.explain')"
            :title="$t('tools.brush.subTools.brush.label')" />
          <div class="content-wrapper" :class="{ disabled: !imageStore.needRasterization }">
            <DefaultButton :text="$t('tools.brush.settings.brush.rasterizeButton.text')" position="bottom-left"
              :tip="$t('tools.brush.settings.brush.rasterizeButton.tip')" @click="rasterizeImage" />

          </div>
        </div>
        <!-- Tool size -->
        <div class="settings-content-wrapper">
          <div class="content-wrapper" :class="{ disabled: imageStore.needRasterization }">
            <div class="content-title">
              <p>
                {{ $t('tools.brush.settings.brush.toolSize.label') }}
              </p>
            </div>
            <NumberInput v-model="brushToolSize" :min="brushMinToolSize" :max="brushMaxToolSize" :step="1" unit="px"
              @update="changeBrushToolSize(brushToolSize)" :tip="$t('tools.brush.settings.brush.toolSize.tip')"
              position="bottom-left" />
          </div>
        </div>

        <!-- Color -->
        <div class="settings-content-wrapper">
          <div class="content-wrapper" :class="{ disabled: imageStore.needRasterization }">
            <div class="content-title">
              <p>
                {{ $t('tools.brush.settings.brush.brushColor.label') }}
              </p>
            </div>
            <ColorPicker v-model="brushColor" @update="saveColorToStore(brushColor)"
              :tip="$t('tools.brush.settings.brush.brushColor.tip')" position="bottom-left" />
          </div>
        </div>

        <!-- Empty space -->
        <div class="settings-content-wrapper" style="border: none">
          <!-- Empty space -->
        </div>
      </div>

      <div v-if="editorStore.selectedTabPerTool[editorStore.selectedToolKey] === 'eraser'" class="specific-settings">
        <!-- Rasterize button -->
        <div class="settings-content-wrapper" :class="{ disabled: !imageStore.needRasterization }">
          <ExplainItem :text="$t('tools.brush.subTools.eraser.explain')"
            :title="$t('tools.brush.subTools.eraser.label')" />
          <div class="content-wrapper">
            <DefaultButton :text="$t('tools.brush.settings.eraser.rasterizeButton.text')"
              :tip="$t('tools.brush.settings.eraser.rasterizeButton.tip')" position="bottom-left"
              @click="rasterizeImage" />

          </div>
        </div>
        <!-- Tool size -->
        <div class="settings-content-wrapper">
          <div class="content-wrapper" :class="{ disabled: imageStore.needRasterization }">
            <div class="content-title">
              <p>
                {{ $t('tools.brush.settings.eraser.toolSize.label') }}
              </p>
            </div>
            <NumberInput v-model="brushToolSize" :min="brushMinToolSize" :max="brushMaxToolSize" :step="1" unit="px"
              @update="changeBrushToolSize(brushToolSize)" :tip="$t('tools.brush.settings.eraser.toolSize.tip')"
              position="bottom-left" />
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
