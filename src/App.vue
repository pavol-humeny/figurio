<script setup>
import { onMounted, onBeforeUnmount } from 'vue'
import { RouterView } from 'vue-router'
import TopPanel from './components/topPanel/TopPanel.vue'
import ToastModal from './components/modals/ToastModal.vue'
import ConfirmModal from './components/modals/ConfirmModal.vue'
import SettingsPanel from './components/topPanel/SettingsPanel.vue'
import PrivacyAndDataModal from './components/modals/PrivacyAndDataModal.vue'
import ImportModal from './components/modals/ImportModal.vue'
import ExportToolSettings from './components/toolsSettings/ExportToolSettings.vue'
import HelpModal from './components/modals/HelpModal.vue'
import { useImageStore } from './stores/imageStore'
import InteractiveTutorial from './components/tutorial/InteractiveTutorial.vue'
import GeneralModal from './components/modals/GeneralModal.vue'
import { useRouter, useRoute } from 'vue-router'
import { globalConfig } from './config/globalConfig.js'
import ReleaseModal from './components/modals/ReleaseModal.vue'
import { useUiStore } from './stores/uiStore'
import CalibrationModal from './components/modals/CalibrationModal.vue'
import { useApi } from './composables/common/useApi'
import FeatureTourModal from './components/modals/FeatureTourModal.vue'

const { addUserVisit } = useApi()

// import { useConsole } from '@/composables/common/useConsole.js'
// const { log, warn, error } = useConsole()


const router = useRouter()
const route = useRoute()

const imageStore = useImageStore()
const uiStore = useUiStore()
const userUuid = uiStore.userUuid

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
 * Sets the user login state.
 * @param {string} userUuid - The unique identifier for the user.
 *
 */
// const setUserLogin = async (userUuid) => {
//   if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
//     return null
//   }

//   try {
//     const res = await fetch(`${globalConfig.API_BASE}/api/user-login`, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ user_id: userUuid }),
//     })
//     if (!res.ok) {
//       warn('Error during user-login:', await res.text())
//     } else {
//       log('User login recorded')
//     }
//   } catch (e) {
//     error('Error fetching user-login:', e)
//   }
// }

const APP_VERSION = import.meta.env.VITE_APP_VERSION

/**
 * Register unload warning on mount
 */
onMounted(async () => {
  window.addEventListener('beforeunload', handleBeforeUnload)

  // Reset localStorage (preferences) if app version has changed and in global config is set reset
  if (globalConfig.resetPreferencesOnVersionChange) {
    const savedVersion = localStorage.getItem(`${globalConfig.LOCAL_STORAGE_PREFIX}appVersion`)
    if (savedVersion !== APP_VERSION) {
      // Reset localStorage
      if (globalConfig.resetTutorialOnVersionChange) {
        localStorage.clear()
      } else {
        const tutorialStep = localStorage.getItem(`${globalConfig.LOCAL_STORAGE_PREFIX}tutorialStep`) || -1
        const tutorialCompleted = localStorage.getItem(`${globalConfig.LOCAL_STORAGE_PREFIX}tutorialCompleted`) === 'true'

        // Reset
        localStorage.clear()

        // Restore tutorial
        localStorage.setItem(`${globalConfig.LOCAL_STORAGE_PREFIX}tutorialStep`, tutorialStep)
        localStorage.setItem(`${globalConfig.LOCAL_STORAGE_PREFIX}tutorialCompleted`, tutorialCompleted)
      }

      localStorage.setItem(`${globalConfig.LOCAL_STORAGE_PREFIX}appVersion`, APP_VERSION)
      location.reload()
    }
  }

  await router.isReady() // wait until router is fully loaded

  // If the app is not running show MaintenanceView
  if (!globalConfig.isRunning) {
    router.replace({ name: 'maintenance' })
    return
  }

  // Redirect to home view on reload
  if (route.name !== 'home' && route.name !== 'statistics') {
    console.warn('App reloaded, redirecting to home view: ' + route.name)
    router.replace({ name: 'home' })
  }

  addUserVisit(userUuid)
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
    <GeneralModal />
    <PrivacyAndDataModal />
    <ImportModal />
    <HelpModal />
    <ReleaseModal />
    <SettingsPanel />
    <ExportToolSettings />
    <InteractiveTutorial />
    <CalibrationModal />
    <FeatureTourModal />

    <div class="top-panel" v-if="globalConfig.isRunning">
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
  height: 100%;
  background: var(--background-c);
}

.content {
  height: 100%;
  overflow: hidden;
}
</style>
