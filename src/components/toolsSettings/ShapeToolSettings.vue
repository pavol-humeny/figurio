<script setup>
import { useShapeTool } from '@/composables/tools/useShapeTool';
import { useEditorStore } from '@/stores/editorStore';
import { useImageStore } from '@/stores/imageStore';
import ToolsSettingsTabs from './ToolsSettingsTabs.vue';
import ColorPicker from '../common/ColorPicker.vue';
import NumberInput from '../common/NumberInput.vue';
import NumberDropdownInput from '../common/NumberDropdownInput.vue';
import LinkValuesIcon from '../common/LinkValuesIcon.vue';

const editorStore = useEditorStore();

/**
 * Available tabs for blur tool settings
 */
const tabs = ['rectangle', 'ellipse', 'line'];



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
} = useShapeTool(useEditorStore(), useImageStore())

</script>

<template>
  <div class="tool-settings">
    <ToolsSettingsTabs :tabs="tabs" />


    <div class="settings-wrapper">
      <!-- rectangle -->
      <div v-if="editorStore.selectedTabPerTool[editorStore.selectedToolKey] === 'rectangle'" class="specific-settings">
        <!-- Position -->
        <div class="settings-content-wrapper">
          <div class="content-wrapper">
            <div class="content-title">
              <p>Rectangle position</p>
            </div>
            <div class="content-inputs">
              <div class="content-input">
                <label for="x-input">
                  X
                </label>
                <NumberInput ref="positionXInputRef" v-model="localObjectSettings.x" :min="0" :max="maxShapePositionX"
                  @update="applyLocalSettings" unit="px" />
              </div>

              <div class="content-between-inputs-icon-wrapper disabled"></div>

              <div class="content-input">
                <label for="y-input">
                  Y
                </label>
                <NumberInput ref="positionYInputRef" v-model="localObjectSettings.y" :min="0" :max="maxShapePositionY"
                  @update="applyLocalSettings" unit="px" />
              </div>
            </div>
          </div>
        </div>

        <!-- Dimensions -->
        <div class="settings-content-wrapper">
          <div class="content-wrapper">
            <div class="content-title">
              <p>
                Rectangle dimensions
              </p>
            </div>
            <div class="content-inputs">
              <div class="content-input">
                <label for="width-input">
                  Width
                </label>
                <NumberInput ref="widthInputRef" v-model="tmpShapeWidth" :min="1" :max="maxShapeWidth"
                  @update="(val) => updateDimension('width', val)" unit="px" />
              </div>

              <div class="content-between-inputs-icon-wrapper">
                <LinkValuesIcon v-model="isDimensionsLinked" :tipLinked="'tipLinked'" :tipUnlinked="'tipUnlinked'"
                  size="30" position="bottom-left" />
              </div>

              <div class="content-input">
                <label for="height-input">
                  {{ $t('tools.transform.settings.crop.cropDimensions.height') }}
                </label>
                <NumberInput ref="heightInputRef" v-model="tmpShapeHeight" :min="1" :max="maxShapeHeight"
                  @update="(val) => updateDimension('height', val)" unit="px" />
              </div>
            </div>
          </div>
        </div>

        <!-- Empty space -->
        <div class="settings-content-wrapper" style="border: none">
          <!-- Empty space -->
        </div>
      </div>


      <!-- ellipse -->
      <div v-if="editorStore.selectedTabPerTool[editorStore.selectedToolKey] === 'ellipse'" class="specific-settings">
        <!-- Position -->
        <div class="settings-content-wrapper">
          <div class="content-wrapper">
            <div class="content-title">
              <p>Ellipse position</p>
            </div>
            <div class="content-inputs">
              <div class="content-input">
                <label for="x-input">
                  X
                </label>
                <NumberInput ref="positionXInputRef" v-model="localObjectSettings.x" :min="0" :max="maxShapePositionX"
                  @update="applyLocalSettings" unit="px" />
              </div>

              <div class="content-between-inputs-icon-wrapper disabled"></div>

              <div class="content-input">
                <label for="y-input">
                  Y
                </label>
                <NumberInput ref="positionYInputRef" v-model="localObjectSettings.y" :min="0" :max="maxShapePositionY"
                  @update="applyLocalSettings" unit="px" />
              </div>
            </div>
          </div>
        </div>
        <!-- Empty space -->
        <div class="settings-content-wrapper" style="border: none">
          <!-- Empty space -->
        </div>
      </div>

      <!-- line -->
      <div v-if="editorStore.selectedTabPerTool[editorStore.selectedToolKey] === 'line'" class="specific-settings">
        <!-- Position -->
        <div class="settings-content-wrapper">
          <div class="content-wrapper">
            <div class="content-title">
              <p>Rectangle position</p>
            </div>
            <div class="content-inputs">
              <div class="content-input">
                <label for="x-input">
                  X
                </label>
                <NumberInput ref="positionXInputRef" v-model="localObjectSettings.x" :min="0" :max="maxShapePositionX"
                  @update="applyLocalSettings" unit="px" />
              </div>

              <div class="content-between-inputs-icon-wrapper disabled"></div>

              <div class="content-input">
                <label for="y-input">
                  Y
                </label>
                <NumberInput ref="positionYInputRef" v-model="localObjectSettings.y" :min="0" :max="maxShapePositionY"
                  @update="applyLocalSettings" unit="px" />
              </div>
            </div>
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
