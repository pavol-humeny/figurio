<script setup>
import ToolsSettingsTabs from './ToolsSettingsTabs.vue';
import NumberInput from '../common/NumberInput.vue';
import DropdownSelect from '../common/DropdownSelect.vue';
import ColorPicker from '../common/ColorPicker.vue';
import { useHistoryStore } from '@/stores/historyStore';
import { useI18n } from 'vue-i18n';
import { useEditorStore } from '@/stores/editorStore';
import { useImageStore } from '@/stores/imageStore';
import { useMagnifyAreaTool } from '@/composables/tools/useMagnifyAreaTool';
import ExplainItem from '../common/ExplainItem.vue';
import DefaultSlider from '../common/DefaultSlider.vue';
import { useUiStore } from '@/stores/uiStore';
// import SvgObjectsZIndexControl from './SvgObjectsZIndexControl.vue';

const { t } = useI18n();

const {
  applyLocalMagnifyAreaSettings,
  localMagnifyAreaSettings,
  maxMagnifyAreaRadius,
  hidePositionAndDimensions,
  maxMagnifyAreaSourcePositionX,
  maxMagnifyAreaSourcePositionY,
  magnifyAreaZoomOptions,
  maxOutlineWidth,
} = useMagnifyAreaTool(useImageStore(), useHistoryStore(), useEditorStore(), useUiStore(), t);

</script>

<template>
  <div class="tool-settings">
    <ToolsSettingsTabs :tabs="[]" />

    <div class="settings-wrapper">
      <div class="specific-settings">
        <!-- Position -->
        <div v-if="!hidePositionAndDimensions" class="settings-content-wrapper">
          <ExplainItem :text="$t('tools.magnifyArea.explain')" :title="$t('tools.magnifyArea.label')" />
          <div class="content-wrapper">
            <div class="content-title">
              <p>
                {{ $t('tools.magnifyArea.settings.general.sourcePosition.label') }}
              </p>
            </div>
            <div class="content-inputs">
              <div class="content-input">
                <label for="x-input">
                  {{ $t('tools.magnifyArea.settings.general.sourcePosition.x') }}
                </label>
                <NumberInput ref="sourcePositionXInputRef" v-model="localMagnifyAreaSettings.positionX"
                  :min="localMagnifyAreaSettings.radius" :max="maxMagnifyAreaSourcePositionX" :step="1"
                  @update="applyLocalMagnifyAreaSettings" unit="px" />
              </div>

              <div class="content-between-inputs-icon-wrapper disabled"></div>

              <div class="content-input">
                <label for="y-input">
                  {{ $t('tools.magnifyArea.settings.general.sourcePosition.y') }}
                </label>
                <NumberInput ref="sourcePositionYInputRef" v-model="localMagnifyAreaSettings.positionY"
                  :min="localMagnifyAreaSettings.radius" :max="maxMagnifyAreaSourcePositionY" :step="1"
                  @update="applyLocalMagnifyAreaSettings" unit="px" />
              </div>
            </div>
          </div>
        </div>

        <!-- Radius -->
        <div class="settings-content-wrapper">
          <ExplainItem v-if="hidePositionAndDimensions" :text="$t('tools.magnifyArea.explain')"
            :title="$t('tools.magnifyArea.label')" />
          <div class="content-wrapper">
            <div class="content-title">
              <p>
                {{ $t('tools.magnifyArea.settings.general.radius.label') }}
              </p>
            </div>
            <DefaultSlider :min="10" :max="maxMagnifyAreaRadius" :step="1" v-model="localMagnifyAreaSettings.radius"
              showValue valueUnit="px" @update="applyLocalMagnifyAreaSettings(false)"
              @commit="applyLocalMagnifyAreaSettings(true)" :tip="$t('tools.magnifyArea.settings.general.radius.tip')"
              position="bottom-left" />
          </div>
        </div>

        <!-- Zoom -->
        <div class="settings-content-wrapper">
          <div class="content-wrapper">
            <div class="content-title">
              <p>
                {{ $t('tools.magnifyArea.settings.general.zoom.label') }}
              </p>
            </div>
            <DropdownSelect v-model="localMagnifyAreaSettings.zoom" :options="magnifyAreaZoomOptions"
              @update="applyLocalMagnifyAreaSettings" :tip="$t('tools.magnifyArea.settings.general.zoom.tip')"
              position="bottom-left" />
          </div>
        </div>

        <!-- Outline width and color -->
        <div class="settings-content-wrapper">
          <div class="content-aligned two-items">
            <div class="content-wrapper">
              <p>
                {{ $t('tools.magnifyArea.settings.general.outlineWidth.label') }}
              </p>
              <NumberInput v-model="localMagnifyAreaSettings.outlineWidth" :min="1" :max="maxOutlineWidth" :step="1"
                @update="applyLocalMagnifyAreaSettings" :tip="$t('tools.magnifyArea.settings.general.outlineWidth.tip')"
                position="bottom-left" unit="px" />
            </div>
            <div class="content-wrapper">
              <p>
                {{ $t('tools.magnifyArea.settings.general.outlineColor.label') }}
              </p>
              <ColorPicker v-model="localMagnifyAreaSettings.outlineColor"
                @update="applyLocalMagnifyAreaSettings(false)" @commit="applyLocalMagnifyAreaSettings(true)"
                :tip="$t('tools.magnifyArea.settings.general.outlineColor.tip')" position="bottom-left" />
            </div>
          </div>
        </div>

        <!-- Z-index -->
        <!-- <SvgObjectsZIndexControl :isVisible="!hidePositionAndDimensions" /> -->

        <!-- Empty space -->
        <div class="settings-content-wrapper" style="border: none">
          <!-- Empty space -->
        </div>
      </div>
    </div>
  </div>

</template>

<style scoped></style>
