<script setup>
import ToolsSettingsTabs from './ToolsSettingsTabs.vue';

const tabs = ['draw', 'erase', 'text', 'shape'];

</script>

<template>
  <div class="tool-settings">
    <ToolsSettingsTabs :tabs="tabs"/>

    <div class="settings-content">
    </div>
  </div>

</template>

<style scoped>
</style>
