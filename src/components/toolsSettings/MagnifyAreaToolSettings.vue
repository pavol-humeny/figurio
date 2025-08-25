<script setup>
import ToolsSettingsTabs from './ToolsSettingsTabs.vue';
import NumberInput from '../common/NumberInput.vue';
import DropdownSelect from '../common/DropdownSelect.vue';
import ColorPicker from '../common/ColorPicker.vue';
import { useHistoryStore } from '@/stores/historyStore';
import { useI18n } from 'vue-i18n';
import { useEditorStore } from '@/stores/editorStore';
import { useSvgObjects } from '@/composables/tools/useSvgObjects';
import { useImageStore } from '@/stores/imageStore';
import { useMagnifyAreaTool } from '@/composables/tools/useMagnifyAreaTool';
import NumberDropdownInput from '../common/NumberDropdownInput.vue';
import { useViewportStore } from '@/stores/viewportStore';
import DefaultButton from '../common/DefaultButton.vue';
import { useUiStore } from '@/stores/uiStore';

const { t } = useI18n();

const imageStore = useImageStore();

const {
  applyLocalMagnifyAreaSettings,
  localMagnifyAreaSettings,
  maxMagnifyAreaRadius,
  magnifyAreaRadiusOptions,
  hidePositionAndDimensions,
  maxMagnifyAreaSourcePositionX,
  maxMagnifyAreaSourcePositionY,
  magnifyAreaZoomOptions,
  resultPositionOptions,
  maxOutlineWidth,
} = useMagnifyAreaTool(useImageStore(), useHistoryStore(), useEditorStore(), t);

/**
 * Logic for moving selected SVG objects
 */
const {
  moveSelectedSvgObjectForward,
  moveSelectedSvgObjectBackward,
  sendSelectedSvgObjectToBack,
  bringSelectedSvgObjectToFront,
} = useSvgObjects(useImageStore(), useHistoryStore(), useViewportStore(), useEditorStore(), useUiStore(), t);

</script>

<template>
  <div class="tool-settings">
    <ToolsSettingsTabs :tabs="[]" />

    <div class="settings-wrapper">
      <div class="specific-settings">
        <!-- Position -->
        <div v-if="!hidePositionAndDimensions" class="settings-content-wrapper">
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
                <NumberInput ref="sourcePositionXInputRef" v-model="localMagnifyAreaSettings.sourceX"
                  :min="localMagnifyAreaSettings.radius" :max="maxMagnifyAreaSourcePositionX" :step="1"
                  @update="applyLocalMagnifyAreaSettings" unit="px" />
              </div>

              <div class="content-between-inputs-icon-wrapper disabled"></div>

              <div class="content-input">
                <label for="y-input">
                  {{ $t('tools.magnifyArea.settings.general.sourcePosition.y') }}
                </label>
                <NumberInput ref="sourcePositionYInputRef" v-model="localMagnifyAreaSettings.sourceY"
                  :min="localMagnifyAreaSettings.radius" :max="maxMagnifyAreaSourcePositionY" :step="1"
                  @update="applyLocalMagnifyAreaSettings" unit="px" />
              </div>
            </div>
          </div>
        </div>

        <!-- Radius -->
        <div class="settings-content-wrapper">
          <div class="content-wrapper">
            <div class="content-title">
              <p>
                {{ $t('tools.magnifyArea.settings.general.radius.label') }}
              </p>
            </div>
            <NumberDropdownInput v-model="localMagnifyAreaSettings.radius" :min="1" :max="maxMagnifyAreaRadius"
              :step="1" @update="applyLocalMagnifyAreaSettings" :options="magnifyAreaRadiusOptions"
              :tip="$t('tools.magnifyArea.settings.general.radius.tip')" position="bottom-left" />
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

        <!-- Result position -->
        <div class="settings-content-wrapper">
          <div class="content-wrapper">
            <div class="content-title">
              <p>
                {{ $t('tools.magnifyArea.settings.general.resultPosition.label') }}
              </p>
            </div>
            <DropdownSelect v-model="localMagnifyAreaSettings.resultPosition" :options="resultPositionOptions"
              @update="applyLocalMagnifyAreaSettings" :tip="$t('tools.magnifyArea.settings.general.resultPosition.tip')"
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
              <ColorPicker v-model="localMagnifyAreaSettings.outlineColor" @update="applyLocalMagnifyAreaSettings"
                :tip="$t('tools.magnifyArea.settings.general.outlineColor.tip')" position="bottom-left" />
            </div>
          </div>
        </div>

        <!-- Z-index -->
        <div v-if="!hidePositionAndDimensions" class="settings-content-wrapper">
          <div class="content-wrapper">
            <div class="content-title">
              <p>
                {{ $t('tools.magnifyArea.settings.general.zIndex.label') }}
              </p>
            </div>
            <DefaultButton :text="$t('tools.magnifyArea.settings.general.zIndex.bringToFrontButton.text')"
              @click="bringSelectedSvgObjectToFront" :disabled="imageStore.isMaxZIndexOfSelectedSvgObject()" />

            <DefaultButton :text="$t('tools.magnifyArea.settings.general.zIndex.moveForwardButton.text')"
              @click="moveSelectedSvgObjectForward" :disabled="imageStore.isMaxZIndexOfSelectedSvgObject()" />

            <DefaultButton :text="$t('tools.magnifyArea.settings.general.zIndex.moveBackwardButton.text')"
              @click="moveSelectedSvgObjectBackward" :disabled="imageStore.isMinZIndexOfSelectedSvgObject()" />

            <DefaultButton :text="$t('tools.magnifyArea.settings.general.zIndex.sendToBackButton.text')"
              @click="sendSelectedSvgObjectToBack" :disabled="imageStore.isMinZIndexOfSelectedSvgObject()" />
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
