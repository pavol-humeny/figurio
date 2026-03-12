<script setup>
/**
 * @file: BrushToolSettings.vue
 * @author: Pavol Humeny
 * @date: 15.5.2026
 */
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
import { useUiStore } from '@/stores/uiStore'
import ItemTip from '../common/ItemTip.vue'
import BaseIcon from '../icons/BaseIcon.vue'

const { t } = useI18n()
const editorStore = useEditorStore()

const {
  brushSize,
  setBrushSize,
  brushMaxToolSize,
  brushMinToolSize,
  brushColor,
  saveColorToStore,
  clearAllCanvas,
  setIsEraserMode,
  isEraserMode,
  hasBrushOverlay
} = useBrushTool(
  useImageStore(),
  useHistoryStore(),
  useEditorStore(),
  useUiStore(),
  t,
)

const tabs = ['brush', 'pencil']

</script>

<template>
  <div class="tool-settings">
    <ToolsSettingsTabs :tabs="tabs" />
    <div class="settings-wrapper">
      <div v-if="editorStore.selectedTabPerTool[editorStore.selectedToolKey] === 'brush'" class="specific-settings">
        <!-- Rasterize button -->
        <!-- <div class="settings-content-wrapper">
          <ExplainItem :text="$t('tools.brush.subTools.brush.explain')"
            :title="$t('tools.brush.subTools.brush.label')" />
          <div class="content-wrapper" :class="{ disabled: !imageStore.needRasterization }">
            <DefaultButton :text="$t('tools.brush.settings.brush.rasterizeButton.text')" position="bottom-left"
              :tip="$t('tools.brush.settings.brush.rasterizeButton.tip')" @click="rasterizeImage" />
          </div>
        </div> -->

        <!-- Selected tool -->
        <div class="settings-content-wrapper">
          <ExplainItem :text="$t('tools.brush.subTools.brush.explain')"
            :title="$t('tools.brush.subTools.brush.label')" />
          <div class="content-wrapper">
            <div class="content-title">
              <p>
                {{ $t('tools.brush.settings.brush.selectedTool.label') }}
              </p>
            </div>
            <div class="eraser-select-wrapper">
              <ItemTip :text="$t('tools.brush.settings.brush.selectedTool.options.tipBrush')" position="bottom">
                <button @click="setIsEraserMode(false)" class="button button-control button-circle"
                  :class="{ selected: !isEraserMode }">
                  <BaseIcon name="IconBrush" size="24" />
                </button>
              </ItemTip>

              <ItemTip :text="$t('tools.brush.settings.brush.selectedTool.options.tipEraser')" position="bottom">
                <button @click="setIsEraserMode(true)" class="button button-control button-circle"
                  :class="{ selected: isEraserMode }">
                  <BaseIcon name="IconEraser" size="24" />
                </button>
              </ItemTip>
            </div>
          </div>
        </div>

        <!-- Tool size -->
        <div class="settings-content-wrapper">
          <div class="content-wrapper">
            <div class="content-title">
              <p>
                {{ $t('tools.brush.settings.brush.toolSize.label') }}
              </p>
            </div>
            <NumberInput v-model="brushSize" :min="brushMinToolSize" :max="brushMaxToolSize" :step="1" unit="px"
              @update="setBrushSize(brushSize)" :tip="$t('tools.brush.settings.brush.toolSize.tip')"
              position="bottom-left" />
          </div>
        </div>

        <!-- Color -->
        <div class="settings-content-wrapper">
          <div class="content-wrapper">
            <div class="content-title">
              <p>
                {{ $t('tools.brush.settings.brush.brushColor.label') }}
              </p>
            </div>
            <ColorPicker v-model="brushColor" @update="saveColorToStore(brushColor)"
              :tip="$t('tools.brush.settings.brush.brushColor.tip')" position="bottom-left" />
          </div>
        </div>

        <!-- Clear all button -->
        <div class="settings-content-wrapper">
          <div class="content-wrapper">
            <DefaultButton :text="$t('tools.brush.settings.eraser.clearAllButton.text')" position="bottom-left"
              :tip="$t('tools.brush.settings.eraser.clearAllButton.tip')" @click="clearAllCanvas"
              :disabled="!hasBrushOverlay" />
          </div>
        </div>

        <!-- Empty space -->
        <div class="settings-content-wrapper" style="border: none">
          <!-- Empty space -->
        </div>
      </div>

      <div v-if="editorStore.selectedTabPerTool[editorStore.selectedToolKey] === 'pencil'" class="specific-settings">
        <!-- Rasterize button -->
        <!-- <div class="settings-content-wrapper">
          <ExplainItem :text="$t('tools.brush.subTools.pencil.explain')"
            :title="$t('tools.brush.subTools.pencil.label')" />
          <div class="content-wrapper" :class="{ disabled: !imageStore.needRasterization }">
            <DefaultButton :text="$t('tools.brush.settings.pencil.rasterizeButton.text')" position="bottom-left"
              :tip="$t('tools.brush.settings.pencil.rasterizeButton.tip')" @click="rasterizeImage" />
          </div>
        </div> -->

        <!-- Selected tool -->
        <div class="settings-content-wrapper">
          <ExplainItem :text="$t('tools.brush.subTools.pencil.explain')"
            :title="$t('tools.brush.subTools.pencil.label')" />
          <div class="content-wrapper">
            <div class="content-title">
              <p>
                {{ $t('tools.brush.settings.pencil.selectedTool.label') }}
              </p>
            </div>
            <div class="eraser-select-wrapper">
              <ItemTip :text="$t('tools.brush.settings.pencil.selectedTool.options.tipPencil')" position="bottom">
                <button @click="setIsEraserMode(false)" class="button button-control button-circle"
                  :class="{ selected: !isEraserMode }">
                  <BaseIcon name="IconPencil" size="24" />
                </button>
              </ItemTip>

              <ItemTip :text="$t('tools.brush.settings.pencil.selectedTool.options.tipEraser')" position="bottom">
                <button @click="setIsEraserMode(true)" class="button button-control button-circle"
                  :class="{ selected: isEraserMode }">
                  <BaseIcon name="IconEraser" size="24" />
                </button>
              </ItemTip>
            </div>
          </div>
        </div>

        <!-- Tool size -->
        <div class="settings-content-wrapper">
          <div class="content-wrapper">
            <div class="content-title">
              <p>
                {{ $t('tools.brush.settings.pencil.toolSize.label') }}
              </p>
            </div>
            <NumberInput v-model="brushSize" :min="brushMinToolSize" :max="brushMaxToolSize" :step="1" unit="px"
              @update="setBrushSize(brushSize)" :tip="$t('tools.brush.settings.pencil.toolSize.tip')"
              position="bottom-left" />
          </div>
        </div>

        <!-- Color -->
        <div class="settings-content-wrapper">
          <div class="content-wrapper">
            <div class="content-title">
              <p>
                {{ $t('tools.brush.settings.pencil.pencilColor.label') }}
              </p>
            </div>
            <ColorPicker v-model="brushColor" @update="saveColorToStore(brushColor)"
              :tip="$t('tools.brush.settings.pencil.pencilColor.tip')" position="bottom-left" />
          </div>
        </div>

        <!-- Clear all button -->
        <div class="settings-content-wrapper">
          <div class="content-wrapper">
            <DefaultButton :text="$t('tools.brush.settings.eraser.clearAllButton.text')" position="bottom-left"
              :tip="$t('tools.brush.settings.eraser.clearAllButton.tip')" @click="clearAllCanvas"
              :disabled="!hasBrushOverlay" />
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
.eraser-select-wrapper {
  display: flex;
  flex-direction: row;
  gap: 15px;
}

.selected {
  background: var(--primary-c);
  color: var(--secondary-c);
}
</style>
