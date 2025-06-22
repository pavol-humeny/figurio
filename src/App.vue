<script setup>
import { onMounted, onBeforeUnmount } from 'vue'
import { RouterView } from 'vue-router'
import TopPanel from './components/topPanel/TopPanel.vue'
import ToastModal from './components/modals/ToastModal.vue'
import ConfirmModal from './components/modals/ConfirmModal.vue'
import SettingsPanel from './components/topPanel/SettingsPanel.vue'
import PrivacyAndDataModal from './components/modals/PrivacyAndDataModal.vue'
import ExportToolSettings from './components/toolsSettings/ExportToolSettings.vue'
import HelpModal from './components/modals/HelpModal.vue'
import { useImageStore } from './stores/imageStore'

const imageStore = useImageStore()

const check = (event) => {
  if (event.ctrlKey) {
    event.preventDefault()
  }
}

const handleBeforeUnload = (event) => {
  if (imageStore.file !== null) {
    event.preventDefault()
    event.returnValue = ''
  }
}

onMounted(() => {
  window.addEventListener('beforeunload', handleBeforeUnload)
})

onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload)
})
</script>

<template>
  <div class="main" @wheel="check">
    <ToastModal />
    <ConfirmModal />
    <PrivacyAndDataModal />
    <HelpModal />
    <SettingsPanel />
    <ExportToolSettings />

    <div class="top-panel">
      <TopPanel />
    </div>
    <div class="content">
      <RouterView />
    </div>
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

.content {
  height: 100%;
  overflow: hidden;
}
</style>
