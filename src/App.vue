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
import InteractiveTutorial from './components/tutorial/InteractiveTutorial.vue'
import GeneralModal from './components/modals/GeneralModal.vue'
import SelectPdfPageModal from './components/modals/SelectPdfPageModal.vue'


const imageStore = useImageStore()

/**
 * Prevents default behavior of ctrl + wheel scrolling.
 * Useful to block unintended browser zooming.
 *
 * @param {WheelEvent} event
 */
const check = (event) => {
  if (event.ctrlKey) {
    event.preventDefault()
  }
}

/**
 * Warns user before closing the tab if a file is loaded.
 * Prevents accidental data loss.
 *
 * @param {BeforeUnloadEvent} event
 */
const handleBeforeUnload = (event) => {
  if (imageStore.file !== null) {
    event.preventDefault()
    event.returnValue = ''
  }
}

/**
 * Register unload warning on mount
 */
onMounted(() => {
  window.addEventListener('beforeunload', handleBeforeUnload)
})

/**
 * Clean up the event listener when component is unmounted
 */
onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload)
})
</script>

<template>
  <div class="main" @wheel="check">
    <ToastModal />
    <ConfirmModal />
    <GeneralModal>
      <SelectPdfPageModal />
    </GeneralModal>
    <PrivacyAndDataModal />
    <HelpModal />
    <SettingsPanel />
    <ExportToolSettings />
    <InteractiveTutorial />

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
