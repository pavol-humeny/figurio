<script setup>
import ColorPicker from '../common/ColorPicker.vue';
import DropdownSelect from '../common/DropdownSelect.vue';
import TextInput from '../common/TextInput.vue';
import NumberDropdownInput from '../common/NumberDropdownInput.vue';

const textSizeOptions = [10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48, 56, 64, 72];

const textFontOptions = [
  { label: 'Arial', value: 'Arial' },
  { label: 'Courier New', value: 'Courier New' },
  { label: 'Georgia', value: 'Georgia' },
  { label: 'Times New Roman', value: 'Times New Roman' },
  { label: 'Verdana', value: 'Verdana' },
];

const textSettings = {
  text: '',
  size: 16,
  color: '#000000',
  fontFamily: 'Arial',
};

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
            <TextInput v-model="textSettings.text" placeholder="text" />
          </div>
        </div>

        <!-- Size -->
        <div class="settings-content-wrapper">
          <div class="content-title">
            <p>Text size</p>
          </div>
          <div class="content-wrapper">
            <NumberDropdownInput v-model="textSettings.size" :options="textSizeOptions" :min="0" :max="100" />
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
