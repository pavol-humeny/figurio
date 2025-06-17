<script setup>
import { RouterLink, RouterView } from 'vue-router'
import TopPanel from './components/topPanel/TopPanel.vue';
import ToastModal from './components/modals/ToastModal.vue';
import ConfirmModal from './components/modals/ConfirmModal.vue';
import SettingsPanel from './components/topPanel/SettingsPanel.vue';
import PrivacyAndDataModal from './components/modals/PrivacyAndDataModal.vue';
</script>

<template>
  <div class="main">
    <ToastModal />
    <ConfirmModal />
    <PrivacyAndDataModal />

    <SettingsPanel />
    <TopPanel />
    <!-- <RouterView /> -->
  </div>

</template>

<style scoped>
.main {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100vh;
  background: var(--background-c);
}
</style>
