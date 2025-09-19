<script setup>
import { useShapeTool } from '@/composables/tools/useShapeTool';
import { useEditorStore } from '@/stores/editorStore';
import { useImageStore } from '@/stores/imageStore';
import ToolsSettingsTabs from './ToolsSettingsTabs.vue';
import ColorPicker from '../common/ColorPicker.vue';
import NumberInput from '../common/NumberInput.vue';
import NumberDropdownInput from '../common/NumberDropdownInput.vue';
import LinkValuesIcon from '../common/LinkValuesIcon.vue';
import ToggleButton from '../common/ToggleButton.vue';
import { useHistoryStore } from '@/stores/historyStore';
import { useI18n } from 'vue-i18n'
import DefaultButton from '../common/DefaultButton.vue';
import { useSvgObjects } from '@/composables/tools/useSvgObjects';
import { useViewportStore } from '@/stores/viewportStore';
import DropdownSelect from '../common/DropdownSelect.vue';
import { useUiStore } from '@/stores/uiStore';
import ExplainItem from '../common/ExplainItem.vue';
import { editorConfig } from '@/config/editorConfig'
import { useWorkspaceStore } from '@/stores/workspaceStore';

const { t } = useI18n()
const imageStore = useImageStore();

/**
 * Available tabs for blur tool settings
 */
const tabs = ['rectangle', 'ellipse', 'line'];

/**
 * Logic for shape editing in SVG
 */
const {
  localObjectSettings,
  maxShapePositionX,
  maxShapePositionY,
  applyLocalSettings,
  maxShapeWidth,
  maxShapeHeight,
  widthInputRef,
  heightInputRef,
  updateDimension,
  isDimensionsLinked,
  tmpShapeHeight,
  tmpShapeWidth,
  hidePositionAndDimensions,
  resetRotationAngle,
  resetOpacity,
  resetCornerRadius,
  lineTypeOptions,
  lineArrowOptions,
} = useShapeTool(useEditorStore(), useImageStore(), useHistoryStore(), t)

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
    <ToolsSettingsTabs :tabs="tabs" />

    <div class="settings-wrapper">

      <div class="specific-settings">
        <!-- Position -->
        <div v-if="!hidePositionAndDimensions" class="settings-content-wrapper">
          <ExplainItem :text="$t('tools.shape.explain')" :title="$t('tools.shape.label')" />
          <div class="content-wrapper">
            <div class="content-title">
              <p>
                {{ $t('tools.shape.settings.general.position.label') }}
              </p>
            </div>
            <div class="content-inputs">
              <div class="content-input">
                <label for="x-input">
                  {{ $t('tools.shape.settings.general.position.x') }}
                </label>
                <NumberInput ref="positionXInputRef" v-model="localObjectSettings.x"
                  :min="editorConfig.objectResizingOverflow ? -Infinity : 0"
                  :max="editorConfig.objectResizingOverflow ? Infinity : maxShapePositionX" @update="applyLocalSettings"
                  unit="px" />
              </div>

              <div class="content-between-inputs-icon-wrapper disabled"></div>

              <div class="content-input">
                <label for="y-input">
                  {{ $t('tools.shape.settings.general.position.y') }}
                </label>
                <NumberInput ref="positionYInputRef" v-model="localObjectSettings.y"
                  :min="editorConfig.objectResizingOverflow ? -Infinity : 0"
                  :max="editorConfig.objectResizingOverflow ? Infinity : maxShapePositionY" @update="applyLocalSettings"
                  unit="px" />
              </div>
            </div>
          </div>
        </div>

        <!-- Dimensions -->
        <div v-if="!hidePositionAndDimensions" class="settings-content-wrapper">
          <div class="content-wrapper">
            <div class="content-title">
              <p>
                {{ $t('tools.shape.settings.dimensions.label') }}
              </p>
            </div>
            <div class="content-inputs">
              <div class="content-input">
                <label for="width-input">
                  {{ $t('tools.shape.settings.dimensions.width') }}
                </label>
                <NumberInput ref="widthInputRef" v-model="tmpShapeWidth" :min="1"
                  :max="editorConfig.objectResizingOverflow ? Infinity : maxShapeWidth"
                  @update="(val) => updateDimension('width', val)" unit="px" />
              </div>

              <div class="content-between-inputs-icon-wrapper">
                <LinkValuesIcon v-model="isDimensionsLinked"
                  :tipLinked="$t('tools.shape.settings.dimensions.tipLinked')"
                  :tipUnlinked="$t('tools.shape.settings.dimensions.tipUnlinked')" size="30" position="bottom-left" />
              </div>

              <div class="content-input">
                <label for="height-input">
                  {{ $t('tools.shape.settings.dimensions.height') }}
                </label>
                <NumberInput ref="heightInputRef" v-model="tmpShapeHeight" :min="1"
                  :max="editorConfig.objectResizingOverflow ? Infinity : maxShapeHeight"
                  @update="(val) => updateDimension('height', val)" unit="px" />
              </div>
            </div>
          </div>
        </div>

        <!-- Rotation -->
        <div v-if="!hidePositionAndDimensions && localObjectSettings.type !== 'line'" class="settings-content-wrapper">
          <div class="content-wrapper">
            <div class="content-title">
              <p>
                {{ $t('tools.shape.settings.rotation.label') }}
              </p>
            </div>
            <div class="content-inputs">
              <NumberInput v-model="localObjectSettings.rotation" :min="-180" :max="180" @update="applyLocalSettings"
                unit="°" icon="IconAngle" :color="'var(--primary-c)'" :iconTop="40" :onReset="resetRotationAngle"
                :tip="$t('tools.shape.settings.rotation.tip')" position="bottom-left" />
            </div>
          </div>
        </div>

        <!-- Fill color -->
        <div v-if="localObjectSettings.type !== 'line'" class="settings-content-wrapper">
          <ExplainItem v-if="hidePositionAndDimensions" :text="$t('tools.shape.explain')"
            :title="$t('tools.shape.label')" />
          <div class="content-aligned two-items">
            <div class="content-wrapper">
              <p :class="{ disabled: localObjectSettings.strokeWidth === 0 }">
                {{ $t('tools.shape.settings.enableFillColor.label') }}
              </p>
              <ToggleButton v-model="localObjectSettings.fillEnabled" :scale="0.6" @update="applyLocalSettings"
                :disabled="localObjectSettings.strokeWidth === 0" :tip="$t('tools.shape.settings.enableFillColor.tip')"
                position="bottom-left" />
            </div>

            <div class="content-wrapper">
              <div class="content-title">
                <p>
                  {{ $t('tools.shape.settings.fillColor.label') }}
                </p>
              </div>
              <div class="content-inputs">
                <ColorPicker v-model="localObjectSettings.fillColor" @update="applyLocalSettings(false)"
                  @commit="applyLocalSettings(true)" :disabled="!localObjectSettings.fillEnabled"
                  :tip="$t('tools.shape.settings.fillColor.tip')" position="bottom-left" />
              </div>
            </div>
          </div>
        </div>

        <!-- Line fill color (fill color is stroke color) -->
        <div v-if="localObjectSettings.type === 'line'" class="settings-content-wrapper">
          <ExplainItem v-if="hidePositionAndDimensions" :text="$t('tools.shape.explain')"
            :title="$t('tools.shape.label')" />
          <div class="content-aligned two-items">
            <div class="content-wrapper">
              <div class="content-title">
                <p>
                  {{ $t('tools.shape.settings.fillColor.label') }}
                </p>
              </div>
              <div class="content-inputs">
                <ColorPicker v-model="localObjectSettings.strokeColor" @update="applyLocalSettings(false)"
                  @commit="applyLocalSettings(true)" :tip="$t('tools.shape.settings.fillColor.tip')"
                  position="bottom-left" />
              </div>
            </div>
            <div class="content-wrapper">
              <div class="content-title">
                <p>
                  {{ $t('tools.shape.settings.lineWidth.label') }}
                </p>
              </div>
              <div class="content-inputs">
                <NumberDropdownInput v-model="localObjectSettings.strokeWidth" :min="1" :max="100"
                  @update="applyLocalSettings" :options="[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]" unit="px"
                  :tip="$t('tools.shape.settings.lineWidth.tip')" position="bottom-left" />
              </div>
            </div>
          </div>
        </div>

        <!-- Stroke color -->
        <div v-if="localObjectSettings.type !== 'line'" class="settings-content-wrapper">
          <div class="content-aligned two-items">
            <div class="content-wrapper">
              <div class="content-title">
                <p :class="{ disabled: localObjectSettings.strokeWidth === 0 }">
                  {{ $t('tools.shape.settings.strokeColor.label') }}
                </p>
              </div>
              <div class="content-inputs">
                <ColorPicker v-model="localObjectSettings.strokeColor" @update="applyLocalSettings(false)"
                  @commit="applyLocalSettings(true)" :disabled="localObjectSettings.strokeWidth === 0"
                  :tip="$t('tools.shape.settings.strokeColor.tip')" position="bottom-left" />
              </div>
            </div>
            <div class="content-wrapper">
              <div class="content-title">
                <p>
                  {{ $t('tools.shape.settings.strokeWidth.label') }}
                </p>
              </div>
              <div class="content-inputs">
                <NumberDropdownInput v-model="localObjectSettings.strokeWidth"
                  :min="localObjectSettings.fillEnabled ? 0 : 1" :max="100" @update="applyLocalSettings"
                  :options="[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]" unit="px"
                  :tip="$t('tools.shape.settings.strokeWidth.tip')" position="bottom-left" />
              </div>
            </div>
          </div>

        </div>

        <!-- Opacity -->
        <div class="settings-content-wrapper">
          <div class="content-wrapper">
            <div class="content-title">
              <p>
                {{ $t('tools.shape.settings.opacity.label') }}
              </p>
            </div>
            <NumberInput v-model="localObjectSettings.opacity" :min="0.1" :max="1" :step="0.1"
              @update="applyLocalSettings" icon="IconOpacity" :color="'var(--primary-c)'" :size="20"
              :onReset="resetOpacity" :tip="$t('tools.shape.settings.opacity.tip')" position="bottom-left" />
          </div>
        </div>

        <!-- Corner radius -->
        <div
          v-if="(localObjectSettings.type === 'rectangle' || localObjectSettings.type === 'rect') && imageStore.fileType === 'image'"
          class="settings-content-wrapper">
          <div class="content-wrapper">
            <div class="content-title">
              <p :class="{ disabled: localObjectSettings.strokeWidth === 0 }">
                {{ $t('tools.shape.settings.cornerRadius.label') }}
              </p>
            </div>
            <NumberInput v-model="localObjectSettings.cornerRadius" :min="0" :step="1" @update="applyLocalSettings"
              icon="IconCornerRadius" :color="'var(--primary-c)'" :size="20" :onReset="resetCornerRadius"
              :tip="$t('tools.shape.settings.cornerRadius.tip')" position="bottom-left" />
          </div>
        </div>

        <!-- Line type -->
        <div v-if="localObjectSettings.type === 'line'" class=" settings-content-wrapper">
          <div class="content-wrapper">
            <div class="content-title">
              <p :class="{ disabled: localObjectSettings.strokeWidth === 0 }">
                {{ $t('tools.shape.settings.lineType.label') }}
              </p>
            </div>
            <DropdownSelect v-model="localObjectSettings.lineType" :options="lineTypeOptions"
              @update="applyLocalSettings" :tip="$t('tools.shape.settings.lineType.tip')" position="bottom-left" />
          </div>
        </div>

        <!-- Line arrow -->
        <div v-if="localObjectSettings.type === 'line'" class=" settings-content-wrapper">
          <div class="content-wrapper">
            <div class="content-title">
              <p :class="{ disabled: localObjectSettings.strokeWidth === 0 }">
                {{ $t('tools.shape.settings.lineArrow.end.label') }}
              </p>
            </div>
            <DropdownSelect v-model="localObjectSettings.lineArrowEnd" :options="lineArrowOptions"
              @update="applyLocalSettings" :tip="$t('tools.shape.settings.lineArrow.end.tip')" position="bottom-left" />
          </div>
        </div>


        <!-- Z-index -->
        <div v-if="!hidePositionAndDimensions" class="settings-content-wrapper">
          <div class="content-wrapper">
            <div class="content-title">
              <p>
                {{ $t('tools.shape.settings.zIndex.label') }}
              </p>
            </div>
            <DefaultButton :text="$t('tools.shape.settings.zIndex.bringToFrontButton.text')"
              @click="bringSelectedSvgObjectToFront" :disabled="imageStore.isMaxZIndexOfSelectedSvgObject()" />

            <DefaultButton :text="$t('tools.shape.settings.zIndex.moveForwardButton.text')"
              @click="moveSelectedSvgObjectForward" :disabled="imageStore.isMaxZIndexOfSelectedSvgObject()" />

            <DefaultButton :text="$t('tools.shape.settings.zIndex.moveBackwardButton.text')"
              @click="moveSelectedSvgObjectBackward" :disabled="imageStore.isMinZIndexOfSelectedSvgObject()" />

            <DefaultButton :text="$t('tools.shape.settings.zIndex.sendToBackButton.text')"
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
