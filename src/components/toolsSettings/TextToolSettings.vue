<script setup>
import ColorPicker from '../common/ColorPicker.vue';
import DropdownSelect from '../common/DropdownSelect.vue';
import TextInput from '../common/TextInput.vue';
import NumberDropdownInput from '../common/NumberDropdownInput.vue';
import { useImageStore } from '@/stores/imageStore';
import { useTextTool } from '@/composables/tools/useTextTool';
import { useHistoryStore } from '@/stores/historyStore';
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const { textSizeOptions,
  textFontOptions,
  localTextSettings,
  applyLocalTextSettings
  } = useTextTool(useImageStore(), useHistoryStore(), t)
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
            <TextInput v-model="localTextSettings.text" placeholder="text" updateOnChange @update="applyLocalTextSettings"/>
          </div>
        </div>

        <!-- Size -->
        <div class="settings-content-wrapper">
          <div class="content-title">
            <p>Text size</p>
          </div>
          <div class="content-wrapper">
            <NumberDropdownInput v-model="localTextSettings.size" :options="textSizeOptions" :min="1" :max="100" @update="applyLocalTextSettings"/>
          </div>
        </div>

        <!-- FontFamily -->
        <div class="settings-content-wrapper">
          <div class="content-title">
            <p>Text Font</p>
          </div>
          <div class="content-wrapper">
            <DropdownSelect v-model="localTextSettings.fontFamily" :options="textFontOptions" @update="applyLocalTextSettings"/>
          </div>
        </div>

        <!-- Text color -->
        <div class="settings-content-wrapper">
          <div class="content-title">
            <p>Text color</p>
          </div>
          <div class="content-wrapper">
            <ColorPicker v-model="localTextSettings.color" @update="applyLocalTextSettings"/>
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
