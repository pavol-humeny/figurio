<script setup>
import SettingsButton from './SettingsButton.vue';
import HelpButton from './HelpButton.vue';
import FileNameDisplay from './FileNameDisplay.vue';
import LanguageSwitch from './LanguageSwitch.vue';
</script>

<template>
  <div class="top-panel">
    <div class="top-panel__left">
      <FileNameDisplay />
    </div>
    <div class="top-panel__center">
      <!-- <UndoRedo /> -->
      <!-- <ZoomControl /> -->
    </div>
    <div class="top-panel__right">
      <HelpButton />
      <SettingsButton />
      <LanguageSwitch />
    </div>
  </div>
</template>

<style scoped>
.top-panel {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: 70px;
  background: var(--background-c);
  border: var(--border-ui);
  padding: 0 20px;
}

.top-panel__left,
.top-panel__center,
.top-panel__right {
  flex: 1;
  display: flex;
  align-items: center;
}

.top-panel__left {
  justify-content: flex-start;
}
.top-panel__center {
  justify-content: center;
}
.top-panel__right {
  justify-content: flex-end;
  gap: 10px;
}

</style>
