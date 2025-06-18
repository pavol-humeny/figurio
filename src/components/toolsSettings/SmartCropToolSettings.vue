<script setup>
// import { ref } from 'vue';
import ToolsSettingsTabs from './ToolsSettingsTabs.vue';

const tabs = ['auto', 'manual', 'advanced', 'about', 'help', 'feedback', 'donate'];
// const activeTab = ref('auto');

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
