<script setup>
import ToolsSettingsTabs from './ToolsSettingsTabs.vue';
import { useImageStore } from '@/stores/imageStore';
import { useBlurTool } from '@/composables/tools/useBlurTool';
import { useHistoryStore } from '@/stores/historyStore';
import { useI18n } from 'vue-i18n';
import { useEditorStore } from '@/stores/editorStore';
import { useSvgObjects } from '@/composables/tools/useSvgObjects';
import { useViewportStore } from '@/stores/viewportStore';
import NumberInput from '../common/NumberInput.vue';
import LinkValuesIcon from '../common/LinkValuesIcon.vue';
import DefaultButton from '../common/DefaultButton.vue';
import DefaultSlider from '../common/DefaultSlider.vue';
import { useUiStore } from '@/stores/uiStore';
import ExplainItem from '../common/ExplainItem.vue';
import { editorConfig } from '@/config/editorConfig'
import { useWorkspaceStore } from '@/stores/workspaceStore';

const { t } = useI18n();
const imageStore = useImageStore();
const editorStore = useEditorStore();

/**
 * Logic of blur tool
 */
const {
  localBlurSettings,
  applyLocalBlurSettings,
  // resetRotationAngle,
  maxBlurPositionX,
  maxBlurPositionY,
  hidePositionAndDimensions,
  maxBlurWidth,
  maxBlurHeight,
  widthInputRef,
  heightInputRef,
  tmpBlurWidth,
  tmpBlurHeight,
  isDimensionsLinked,
  updateDimension,
  maxBlurStrength,
  maxEdgeFade,
} = useBlurTool(useImageStore(), useHistoryStore(), useEditorStore(), t);


/**
 * Logic for moving selected SVG objects
 */
const {
  moveSelectedSvgObjectForward,
  moveSelectedSvgObjectBackward,
  sendSelectedSvgObjectToBack,
  bringSelectedSvgObjectToFront,
} = useSvgObjects(useImageStore(), useHistoryStore(), useViewportStore(), useEditorStore(), useUiStore(), useWorkspaceStore(), t);
</script>

<template>
  <div class="tool-settings">
    <ToolsSettingsTabs :tabs="[]" />

    <div class="settings-wrapper">
      <div class="specific-settings">
        <!-- Position -->
        <div v-if="!hidePositionAndDimensions" class="settings-content-wrapper">
          <ExplainItem :text="$t('tools.blur.explain')" :title="$t('tools.blur.label')" />
          <div class="content-wrapper">
            <div class="content-title">
              <p>
                {{ $t('tools.blur.settings.general.position.label') }}
              </p>
            </div>
            <div class="content-inputs">
              <div class="content-input">
                <label for="x-input">
                  {{ $t('tools.blur.settings.general.position.x') }}
                </label>
                <NumberInput ref="positionXInputRef" v-model="localBlurSettings.x"
                  :min="editorConfig.objectResizingOverflow ? -Infinity : 0"
                  :max="editorConfig.objectResizingOverflow ? Infinity : maxBlurPositionX" :step="1"
                  @update="applyLocalBlurSettings" unit="px" />
              </div>

              <div class="content-between-inputs-icon-wrapper disabled"></div>

              <div class="content-input">
                <label for="y-input">
                  {{ $t('tools.blur.settings.general.position.y') }}
                </label>
                <NumberInput ref="positionYInputRef" v-model="localBlurSettings.y"
                  :min="editorConfig.objectResizingOverflow ? -Infinity : 0"
                  :max="editorConfig.objectResizingOverflow ? Infinity : maxBlurPositionY" :step="1"
                  @update="applyLocalBlurSettings" unit="px" />
              </div>
            </div>
          </div>
        </div>

        <!-- Dimensions -->
        <div v-if="!hidePositionAndDimensions" class="settings-content-wrapper">
          <div class="content-wrapper">
            <div class="content-title">
              <p>
                {{ $t('tools.blur.settings.general.dimensions.label') }}
              </p>
            </div>
            <div class="content-inputs">
              <div class="content-input">
                <label for="width-input">
                  {{ $t('tools.blur.settings.general.dimensions.width') }}
                </label>
                <NumberInput ref="widthInputRef" v-model="tmpBlurWidth" :min="1"
                  :max="editorConfig.objectResizingOverflow ? Infinity : maxBlurWidth"
                  @update="(val) => updateDimension('width', val)" unit="px" />
              </div>

              <div class="content-between-inputs-icon-wrapper">
                <LinkValuesIcon v-model="isDimensionsLinked"
                  :tipLinked="$t('tools.blur.settings.general.dimensions.tipLinked')"
                  :tipUnlinked="$t('tools.blur.settings.general.dimensions.tipUnlinked')" size="30"
                  position="bottom-left" />
              </div>

              <div class="content-input">
                <label for="height-input">
                  {{ $t('tools.blur.settings.general.dimensions.height') }}
                </label>
                <NumberInput ref="heightInputRef" v-model="tmpBlurHeight" :min="1"
                  :max="editorConfig.objectResizingOverflow ? Infinity : maxBlurHeight"
                  @update="(val) => updateDimension('height', val)" unit="px" />
              </div>
            </div>
          </div>
        </div>

        <!-- Rotation -->
        <!-- <div v-if="!hidePositionAndDimensions" class="settings-content-wrapper">
          <div class="content-wrapper">
            <div class="content-title">
              <p>
                {{ $t('tools.blur.settings.general.rotation.label') }}
              </p>
            </div>
            <div class="content-inputs">
              <NumberInput v-model="localBlurSettings.rotation" :min="-180" :max="180" @update="applyLocalBlurSettings"
                unit="°" icon="IconAngle" :color="'var(--primary-c)'" :iconTop="40" :onReset="resetRotationAngle"
                :tip="$t('tools.blur.settings.general.rotation.tip')" position="bottom-left" />
            </div>
          </div>
        </div> -->

        <!-- Blur strength -->
        <div class="settings-content-wrapper">
          <ExplainItem v-if="hidePositionAndDimensions" :text="$t('tools.blur.explain')"
            :title="$t('tools.blur.label')" />
          <div class="content-title">
            <p>
              {{ $t('tools.blur.settings.general.blurStrength.label') }}
            </p>
          </div>
          <div class="content-wrapper">
            <DefaultSlider v-model="localBlurSettings.blurStrength" :min="1" :max="maxBlurStrength" :step="1"
              @update="applyLocalBlurSettings(false)" @commit="applyLocalBlurSettings(true)" showValue
              :tip="$t('tools.blur.settings.general.blurStrength.tip')" position="bottom-left" />
          </div>
        </div>

        <!-- Edge fade -->
        <div class="settings-content-wrapper">
          <div class="content-title">
            <p>
              {{ $t('tools.blur.settings.general.edgeFade.label') }}
            </p>
          </div>
          <div class="content-wrapper">
            <DefaultSlider v-model="localBlurSettings.edgeFade" :min="1" :max="maxEdgeFade" :step="1"
              @update="applyLocalBlurSettings(false)" @commit="applyLocalBlurSettings(true)" showValue
              :tip="$t('tools.blur.settings.general.edgeFade.tip')" position="bottom-left" />
          </div>
        </div>

        <!-- Z-index -->
        <div v-if="!hidePositionAndDimensions" class="settings-content-wrapper">
          <div class="content-wrapper">
            <div class="content-title">
              <p>
                {{ $t('tools.blur.settings.general.zIndex.label') }}
              </p>
            </div>
            <DefaultButton :text="$t('tools.blur.settings.general.zIndex.bringToFrontButton.text')"
              @click="bringSelectedSvgObjectToFront(t, true)"
              :disabled="imageStore.isMaxZIndexOfSelectedBlurObject()" />

            <DefaultButton :text="$t('tools.blur.settings.general.zIndex.moveForwardButton.text')"
              @click="moveSelectedSvgObjectForward(t, true)" :disabled="imageStore.isMaxZIndexOfSelectedBlurObject()" />

            <DefaultButton :text="$t('tools.blur.settings.general.zIndex.moveBackwardButton.text')"
              @click="moveSelectedSvgObjectBackward(t, true)"
              :disabled="imageStore.isMinZIndexOfSelectedBlurObject()" />

            <DefaultButton :text="$t('tools.blur.settings.general.zIndex.sendToBackButton.text')"
              @click="sendSelectedSvgObjectToBack(t, true)" :disabled="imageStore.isMinZIndexOfSelectedBlurObject()" />
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
