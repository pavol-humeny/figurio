<script setup>
import ColorPicker from '../common/ColorPicker.vue';
import DropdownSelect from '../common/DropdownSelect.vue';
import TextInput from '../common/TextInput.vue';
import NumberDropdownInput from '../common/NumberDropdownInput.vue';
import { useImageStore } from '@/stores/imageStore';
import { useTextTool } from '@/composables/tools/useTextTool';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const { textSizeOptions,
  textFontOptions,
  textSettings, } = useTextTool(useImageStore())
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
            <TextInput v-model="textSettings.text" placeholder="text" updateOnChange />
          </div>
        </div>

        <!-- Size -->
        <div class="settings-content-wrapper">
          <div class="content-title">
            <p>Text size</p>
          </div>
          <div class="content-wrapper">
            <NumberDropdownInput v-model="textSettings.size" :options="textSizeOptions" :min="1" :max="100" />
          </div>
        </div>

        <!-- FontFamily -->
        <div class="settings-content-wrapper">
          <div class="content-title">
            <p>Text Font</p>
          </div>
          <div class="content-wrapper">
            <DropdownSelect v-model="textSettings.fontFamily" :options="textFontOptions" />
          </div>
        </div>

        <!-- Text color -->
        <div class="settings-content-wrapper">
          <div class="content-title">
            <p>Text color</p>
          </div>
          <div class="content-wrapper">
            <ColorPicker v-model="textSettings.color" />
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
