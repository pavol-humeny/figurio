<script setup>
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
import { useSvgObjects } from '@/composables/tools/useSvgObjects';
import { useViewportStore } from '@/stores/viewportStore';
import DefaultButton from '../common/DefaultButton.vue';

const editorStore = useEditorStore();
const imageStore = useImageStore();
const { t } = useI18n()

const {
  textSizeOptions,
  textFontOptions,
  localTextSettings,
  applyLocalTextSettings,
  resetRotationAngle,
  resetOpacity,
  resetLetterSpacing,
  setBoldStyle,
  setItalicStyle,
  setUnderlineStyle,
} = useTextTool(useImageStore(), useHistoryStore(), useEditorStore(), t)

const {
  moveSelectedSvgObjectForward,
  moveSelectedSvgObjectBackward,
  sendSelectedSvgObjectToBack,
  bringSelectedSvgObjectToFront,
} = useSvgObjects(useImageStore(), useHistoryStore(), useViewportStore(), useEditorStore(), t);
</script>

<template>
  <div class="tool-settings">
    <div class="settings-wrapper">
      <div class="specific-settings">
        <!-- Text -->
        <div class="settings-content-wrapper">
          <div class="content-title">
            <p>Text</p>
          </div>
          <div class="content-wrapper">
            <TextInput v-model="localTextSettings.text" placeholder="text" updateOnChange
              @update="applyLocalTextSettings" />
          </div>
        </div>

        <!-- Rotation -->
        <div v-if="!editorStore.isSvgObjectResizing" class="settings-content-wrapper">
          <div class="content-wrapper">
            <div class="content-title">
              <p>Rotation</p>
            </div>
            <div class="content-inputs">
              <NumberInput v-model="localTextSettings.rotation" :min="-180" :max="180" @update="applyLocalTextSettings"
                unit="°" icon="IconAngle" :color="'var(--primary-c)'" :iconTop="40" :onReset="resetRotationAngle" />
            </div>
          </div>
        </div>

        <!-- Size and letter spacing -->
        <div class="settings-content-wrapper">
          <div class="content-aligned two-items">
            <div class="content-wrapper">
              <p>Text size</p>
              <NumberDropdownInput v-model="localTextSettings.size" :options="textSizeOptions" :min="1" :max="100"
                @update="applyLocalTextSettings" />
            </div>
            <div class="content-wrapper">
              <p>Letter Spacing</p>
              <NumberInput v-model="localTextSettings.letterSpacing" :min="-10" :max="10" :step="0.1"
                @update="applyLocalTextSettings" icon="IconLetterSpacing" :color="'var(--primary-c)'" :size="20"
                tip="tip" position="bottom-left" :onReset="resetLetterSpacing" />
            </div>
          </div>
        </div>

        <!-- FontFamily -->
        <div class="settings-content-wrapper">
          <div class="content-title">
            <p>Text Font</p>
          </div>
          <div class="content-wrapper">
            <DropdownSelect v-model="localTextSettings.fontFamily" :options="textFontOptions"
              @update="applyLocalTextSettings" />
          </div>
        </div>

        <!-- Text color and opacity -->
        <div class="settings-content-wrapper">
          <div class="content-aligned two-items">
            <div class="content-wrapper">
              <p>Text color</p>
              <ColorPicker v-model="localTextSettings.color" @update="applyLocalTextSettings" />
            </div>
            <div class="content-wrapper">
              <p>Text opacity</p>
              <NumberInput v-model="localTextSettings.opacity" :min="0.1" :max="1" :step="0.1"
                @update="applyLocalTextSettings" icon="IconOpacity" :color="'var(--primary-c)'" :size="20"
                :onReset="resetOpacity" tip="tip" position="bottom-left" />
            </div>
          </div>
        </div>

        <!-- Style -->
        <div class="settings-content-wrapper">
          <div class="content-title">
            <p>Text Style</p>
          </div>
          <div class="content-wrapper">
            <div class="text-style-wrapper">
              <IconButton icon="IconBold" :size="30" :scale="0.9" :active="localTextSettings.bold"
                @click="setBoldStyle" />
              <IconButton icon="IconItalic" :size="30" :scale="0.9" :active="localTextSettings.italic"
                @click="setItalicStyle" />
              <IconButton icon="IconUnderline" :size="30" :scale="0.9" :active="localTextSettings.underline"
                @click="setUnderlineStyle" />
            </div>
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

<style scoped>
.text-style-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  /* width: 100%; */
  background: var(--secondary-c);
  padding: 2px;
  border-radius: 10px;
}
</style>
