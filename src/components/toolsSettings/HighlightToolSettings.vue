<script setup>
import ToolsSettingsTabs from './ToolsSettingsTabs.vue';

/**
 * Available tabs for highlight tool settings
 */
const tabs = ['add', 'modify'];

</script>

<template>
  <div class="tool-settings">
    <ToolsSettingsTabs :tabs="tabs" />

    <div class="settings-content">
    </div>
  </div>

</template>

<style scoped></style>
