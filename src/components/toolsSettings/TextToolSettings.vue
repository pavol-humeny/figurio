<script setup>
/**
 * @file: TextToolSettings.vue
 * @author: Pavol Humeny
 * @date: 15.5.2026
 */
import ToolsSettingsTabs from './ToolsSettingsTabs.vue'
import ColorPicker from '../common/ColorPicker.vue';
import DropdownSelect from '../common/DropdownSelect.vue';
import TextInput from '../common/TextInput.vue';
import NumberDropdownInput from '../common/NumberDropdownInput.vue';
import { useImageStore } from '@/stores/imageStore';
import { useTextTool } from '@/composables/tools/useTextTool';
import { useHistoryStore } from '@/stores/historyStore';
import { useI18n } from 'vue-i18n'
import { useEditorStore } from '@/stores/editorStore';
import NumberInput from '../common/NumberInput.vue';
import IconButton from '../common/IconButton.vue';
import ExplainItem from '../common/ExplainItem.vue';
import { editorConfig } from '@/config/editorConfig'
import SvgObjectsZIndexControl from './SvgObjectsZIndexControl.vue';
import { useUiStore } from '@/stores/uiStore';

const imageStore = useImageStore();
const { t } = useI18n()

/**
 * Logic for text editing in SVG
 */
const {
  textSizeOptions,
  textFontOptions,
  localTextSettings,
  applyLocalTextSettings,
  // resetRotationAngle,
  resetOpacity,
  resetLetterSpacing,
  setBoldStyle,
  setItalicStyle,
  setUnderlineStyle,
  maxTextPositionX,
  maxTextPositionY,
  minTextPositionY,
  hidePosition,
  addTextObjectOnEnterClick,
  addTextObjectOnBlur,
} = useTextTool(useImageStore(), useHistoryStore(), useEditorStore(), useUiStore(), t)

</script>

<template>
  <div class="tool-settings">
    <ToolsSettingsTabs :tabs="[]" />
    <div class="settings-wrapper">
      <div class="specific-settings">
        <!-- Text -->
        <div class="settings-content-wrapper">
          <ExplainItem :text="$t('tools.text.explain')" :title="$t('tools.text.label')" />
          <div class="content-title">
            <p>
              {{ $t('tools.text.settings.general.textContent.label') }}
            </p>
          </div>
          <div class="content-wrapper">
            <TextInput v-model="localTextSettings.text"
              :placeholder="$t('tools.text.settings.general.textContent.placeholder')" updateOnChange
              :maxLength="editorConfig.maxTextLength" @update="applyLocalTextSettings(false)"
              :onEnter="() => addTextObjectOnEnterClick()" :onBlur="() => addTextObjectOnBlur()" />
          </div>
        </div>

        <!-- Position -->
        <div v-if="!hidePosition" class="settings-content-wrapper">
          <div class="content-wrapper">
            <div class="content-title">
              <p>
                {{ $t('tools.text.settings.general.position.label') }}
              </p>
            </div>
            <div class="content-inputs">
              <div class="content-input">
                <label for="x-input">
                  {{ $t('tools.text.settings.general.position.x') }}
                </label>
                <NumberInput ref="positionXInputRef" v-model="localTextSettings.x"
                  :min="editorConfig.objectResizingOverflow ? -Infinity : 0"
                  :max="editorConfig.objectResizingOverflow ? Infinity : maxTextPositionX" :step="1"
                  @update="applyLocalTextSettings" unit="px" />
              </div>

              <div class="content-between-inputs-icon-wrapper disabled"></div>

              <div class="content-input">
                <label for="y-input">
                  {{ $t('tools.text.settings.general.position.y') }}
                </label>
                <NumberInput ref="positionYInputRef" v-model="localTextSettings.y"
                  :min="editorConfig.objectResizingOverflow ? -Infinity : minTextPositionY"
                  :max="editorConfig.objectResizingOverflow ? Infinity : maxTextPositionY" :step="1"
                  @update="applyLocalTextSettings" unit="px" />
              </div>
            </div>
          </div>
        </div>

        <!-- Rotation -->
        <!-- <div v-if="!hidePosition" class="settings-content-wrapper">
          <div class="content-wrapper">
            <div class="content-title">
              <p>
                {{ $t('tools.text.settings.general.rotation.label') }}
              </p>
            </div>
            <div class="content-inputs">
              <NumberInput v-model="localTextSettings.rotation" :min="-180" :max="180" @update="applyLocalTextSettings"
                unit="°" icon="IconAngle" :color="'var(--primary-c)'" :iconTop="40" :onReset="resetRotationAngle"
                :tip="$t('tools.text.settings.general.rotation.tip')" position="bottom-left" />
            </div>
          </div>
        </div> -->

        <!-- Size and letter spacing -->
        <div class="settings-content-wrapper">
          <div class="content-aligned two-items">
            <div class="content-wrapper">
              <div class="content-title">
                <p>
                  {{ $t('tools.text.settings.general.textSize.label') }}
                </p>
              </div>
              <NumberDropdownInput v-model="localTextSettings.size" :options="textSizeOptions" :min="1"
                :max="imageStore.fileDimensions.height" @update="applyLocalTextSettings"
                :tip="$t('tools.text.settings.general.textSize.tip')" position="bottom-left" />
            </div>
            <div class="content-wrapper">
              <div class="content-title">
                <p>
                  {{ $t('tools.text.settings.general.letterSpacing.label') }}
                </p>
              </div>
              <NumberInput v-model="localTextSettings.letterSpacing" :min="Math.min(-localTextSettings.size, -10)"
                :max="Math.max(localTextSettings.size, 10)" :step="0.1" @update="applyLocalTextSettings"
                icon="IconLetterSpacing" :color="'var(--primary-c)'" :size="20"
                :tip="$t('tools.text.settings.general.letterSpacing.tip')" position="bottom-left"
                :onReset="resetLetterSpacing" />
            </div>
          </div>
        </div>

        <!-- FontFamily -->
        <div class="settings-content-wrapper">
          <div class="content-title">
            <p>
              {{ $t('tools.text.settings.general.fontFamily.label') }}
            </p>
          </div>
          <div class="content-wrapper">
            <DropdownSelect v-model="localTextSettings.fontFamily" :options="textFontOptions"
              @update="applyLocalTextSettings" :tip="$t('tools.text.settings.general.fontFamily.tip')"
              position="bottom-left" />
          </div>
        </div>

        <!-- Text color and opacity -->
        <div class="settings-content-wrapper">
          <div class="content-aligned two-items">
            <div class="content-wrapper">
              <div class="content-title">
                <p>
                  {{ $t('tools.text.settings.general.textColor.label') }}
                </p>
              </div>
              <ColorPicker v-model="localTextSettings.color" @update="applyLocalTextSettings(false)"
                @commit="applyLocalTextSettings(true)" :tip="$t('tools.text.settings.general.textColor.tip')"
                position="bottom-left" />
            </div>
            <div class="content-wrapper">
              <div class="content-title">
                <p>
                  {{ $t('tools.text.settings.general.textOpacity.label') }}
                </p>
              </div>
              <NumberInput v-model="localTextSettings.opacity" :min="0.1" :max="1" :step="0.1"
                @update="applyLocalTextSettings" icon="IconOpacity" :color="'var(--primary-c)'" :size="20"
                :onReset="resetOpacity" :tip="$t('tools.text.settings.general.textOpacity.tip')"
                position="bottom-left" />
            </div>
          </div>
        </div>

        <!-- Style -->
        <div class="settings-content-wrapper">
          <div class="content-title">
            <p>
              {{ $t('tools.text.settings.general.textStyle.label') }}
            </p>
          </div>
          <div class="content-wrapper">
            <div class="text-style-wrapper">
              <IconButton icon="IconBold" :size="25" :scale="0.9" :active="localTextSettings.bold" @click="setBoldStyle"
                :tip="$t('tools.text.settings.general.textStyle.bold')" position="bottom-left" />
              <IconButton icon="IconItalic" :size="25" :scale="0.9" :active="localTextSettings.italic"
                @click="setItalicStyle" :tip="$t('tools.text.settings.general.textStyle.italic')"
                position="bottom-left" />
              <IconButton icon="IconUnderline" :size="25" :scale="0.9" :active="localTextSettings.underline"
                @click="setUnderlineStyle" :tip="$t('tools.text.settings.general.textStyle.underline')"
                position="bottom-left" />
            </div>
          </div>
        </div>

        <!-- Z-index -->
        <SvgObjectsZIndexControl :isVisible="!hidePosition" type="svg" />

        <!-- Empty space -->
        <div class="settings-content-wrapper" style="border: none">
          <!-- Empty space -->
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.text-style-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  /* width: 100%; */
  background: var(--secondary-c);
  padding: 1px;
  border-radius: 8px;
}
</style>
