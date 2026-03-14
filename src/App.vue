<script setup>
/**
 * @file: App.vue
 * @author: Pavol Humeny
 * @date: 15.5.2026
 * @description: Main application component. Sets up global event listeners for preventing default browser behaviors (like zooming and back navigation), tracks user activity for analytics, and manages modals and panels. Also handles version-based localStorage resets.
 */
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
import { uiConfig } from './config/uiConfig'
import { useConsole } from './composables/common/useConsole'
import ErrorModal from './components/modals/ErrorModal.vue'
import { usePresetsStore } from './stores/presetsStore'
import { useUserModeStore } from './stores/userModeStore'
import { useConfirmModal } from './composables/modals/useConfirmModal'
import { useI18n } from 'vue-i18n'
import { useEditorStore } from './stores/editorStore'

const { warn } = useConsole()
const { addUserVisit, sendVisitDuringMaintenanceEmail, sendSessionHeartbeat } = useApi()

const router = useRouter()
const route = useRoute()

const imageStore = useImageStore()
const editoStore = useEditorStore()
const uiStore = useUiStore()
const presetsStore = usePresetsStore()
const userUuid = uiStore.userUuid
const userModeStore = useUserModeStore()
const { showConfirmModal } = useConfirmModal()
const { t } = useI18n()

/**
 * Prevents default behavior of ctrl + wheel scrolling.
 * Useful to block unintended browser zooming.
 *
 * @param {WheelEvent} event
 */
const blockWheelZoom = (event) => {
  if (!globalConfig.blockZooming) return

  const wrapper = document.querySelector('.viewport-wrapper')
  if (!wrapper) return

  // Block only if mouse is inside viewport wrapper
  if ((event.ctrlKey || event.metaKey) && wrapper.contains(event.target)) {
    event.preventDefault()
  }
}

/**
 * Blocks browser back/forward swipe gesture on touchpad
 * (horizontal wheel gesture)
 *
 * @param {WheelEvent} event
 */
const blockSwipeBack = (event) => {
  // horizontal gesture dominates → browser history swipe
  if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) {
    event.preventDefault()
  }
}

/**
 * Block common shortcuts for opening DevTools
 *
 * @param {KeyboardEvent} event
 */
const blockDevToolsShortcuts = (event) => {
  if (!globalConfig.modalSettings.blockDeveloperTools) return

  if (userModeStore.hasUserAccessToFeature('notBlockDevTools')) {
    return
  }

  if (!event.key) return

  const key = event.key.toLowerCase()

  // F12
  if (key === 'f12') {
    event.preventDefault()
    console.warn('Blocked F12 DevTools shortcut')
    return
  }

  // Ctrl / Cmd + Shift + I / J / C
  if (
    (event.ctrlKey || event.metaKey) &&
    event.shiftKey &&
    ['i', 'j', 'c'].includes(key)
  ) {
    event.preventDefault()
    console.warn(`Blocked Ctrl/Cmd + Shift + ${key.toUpperCase()} DevTools shortcut`)
    return
  }

  // Ctrl / Cmd + U (view source)
  if ((event.ctrlKey || event.metaKey) && key === 'u') {
    event.preventDefault()
    console.warn('Blocked Ctrl/Cmd + U View Source shortcut')
    return
  }
}

/**
 * Block right click context menu
 *
 * @param {MouseEvent} event
 */
const blockContextMenu = (event) => {
  if (!globalConfig.modalSettings.blockDeveloperTools) return

  if (userModeStore.hasUserAccessToFeature('notBlockDevTools')) {
    return
  }

  event.preventDefault()
}


/**
 * Flag to track if window size warning has been shown
 */
let windowSizeWarningShown = false

/**
 * Check current window size against minimum requirements
 */
const checkWindowSize = () => {
  if (!globalConfig.modalSettings.showWarningWindowSize) return

  if (userModeStore.hasUserAccessToFeature('doNotShowInitialWarnings')) return

  const isWindowTooSmall =
    window.innerWidth < uiConfig.minWindowWidth ||
    window.innerHeight < uiConfig.minWindowHeight

  if (isWindowTooSmall && !windowSizeWarningShown) {
    windowSizeWarningShown = true

    showConfirmModal(
      t('general.windowIsTooSmall.title'),
      t('general.windowIsTooSmall.message'),
      t('general.windowIsTooSmall.cancel'),
      t('general.windowIsTooSmall.confirm'),
    )
  }

  if (!isWindowTooSmall) {
    windowSizeWarningShown = false
  }
}

/**
 * Detect Safari browser (excluding Chrome on iOS)
 *
 * @returns {boolean}
 */
const isSafariBrowser = () => {
  if (userModeStore.hasUserAccessToFeature('doNotShowInitialWarnings')) return

  const ua = navigator.userAgent
  return (
    /safari/i.test(ua) &&
    !/chrome|crios|android/i.test(ua)
  )
}

/**
 * Show Safari limited support warning (once per session)
 */
const checkSafariSupport = () => {
  if (!globalConfig.showWarningSafariBrowser) return

  if (!isSafariBrowser()) return

  if (localStorage.getItem(`${globalConfig.LOCAL_STORAGE_PREFIX}safariSupportWarningShown`) === 'true') {
    return
  }

  showConfirmModal(
    t('general.safariLimitedSupport.title'),
    t('general.safariLimitedSupport.message'),
    t('general.safariLimitedSupport.cancel'),
    t('general.safariLimitedSupport.confirm'),
  )

  localStorage.setItem(`${globalConfig.LOCAL_STORAGE_PREFIX}safariSupportWarningShown`, 'true')
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

// --------------------------------
// Session duration tracking for analytics
// --------------------------------
let heartbeatTimer = null
let lastActivity = Date.now()

/**
 * Updates last user activity timestamp
 */
const updateActivity = () => {
  lastActivity = Date.now()
}

/**
 * Registers event listeners to track user activity and update lastActivity timestamp
 */
const registerActivityListeners = () => {
  window.addEventListener('mousemove', updateActivity)
  window.addEventListener('keydown', updateActivity)
  window.addEventListener('mousedown', updateActivity)
  window.addEventListener('touchstart', updateActivity)
  window.addEventListener('scroll', updateActivity)
}

/**
 * Removes event listeners for user activity tracking
 */
const removeActivityListeners = () => {
  window.removeEventListener('mousemove', updateActivity)
  window.removeEventListener('keydown', updateActivity)
  window.removeEventListener('mousedown', updateActivity)
  window.removeEventListener('touchstart', updateActivity)
  window.removeEventListener('scroll', updateActivity)
}

/**
 * Checks if the app is running on localhost
 * @returns {boolean} True if running on localhost, false otherwise
 */
const isLocalhost = () => {
  return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
}

/**
 * Sends heartbeat if user is active
 */
const startSessionHeartbeat = () => {
  if (!globalConfig.usageStatsSettings.sendUsageStats) return

  if (isLocalhost() && !globalConfig.usageStatsSettings.sendUsageStatsOnLocalhost) return

  heartbeatTimer = setInterval(() => {
    const now = Date.now()
    const isUserActive = now - lastActivity < globalConfig.usageStatsSettings.maxInactivityTime

    if (!isUserActive) return

    sendSessionHeartbeat(userUuid, uiStore.sessionId, globalConfig.usageStatsSettings.heartbeatInterval)

  }, globalConfig.usageStatsSettings.heartbeatInterval)

}

/**
 * Application version from environment variable
 */
const APP_VERSION = import.meta.env.VITE_APP_VERSION

/**
 * Register unload warning on mount
 */
onMounted(async () => {
  // Set click effect scale based on uiConfig
  document.documentElement.style.setProperty(
    '--click-scale',
    uiConfig.enableClickEffects ? uiConfig.clickEffectScale : '1'
  )

  window.addEventListener('wheel', blockSwipeBack, {
    passive: false,
  })
  window.addEventListener('wheel', blockWheelZoom, {
    passive: false,
  })
  window.addEventListener('beforeunload', handleBeforeUnload)

  window.addEventListener('keydown', blockDevToolsShortcuts)
  window.addEventListener('contextmenu', blockContextMenu)
  window.addEventListener('resize', checkWindowSize)

  checkWindowSize()
  checkSafariSupport()

  editoStore.retrieveUserSettingsFromLocalStorage()

  // Reset localStorage (preferences) if app version has changed and in global config is set reset
  const savedVersion = localStorage.getItem(`${globalConfig.LOCAL_STORAGE_PREFIX}appVersion`)
  if (savedVersion !== APP_VERSION) {
    // Reset preferences if in global config is set reset
    if (globalConfig.resetOnVersionChange.resetPreferences) {
      // Reset localStorage
      if (globalConfig.resetOnVersionChange.resetTutorialProgress === false) {
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

    // Reset user presets if in global config is set reset
    if (globalConfig.resetOnVersionChange.resetPresets) {
      // Reset user presets
      presetsStore.resetAllPresets()
    }

    // Update seen feature tour videos based on global config
    if (globalConfig.updateFeatureTourVideos) {
      // Load seen videos from localStorage
      const seen = JSON.parse(localStorage.getItem(`${globalConfig.LOCAL_STORAGE_PREFIX}seenFeatureTour`) || '[]')

      // Keep only videos that are in the current list and not in the "to remove" list
      const updatedSeen = seen.filter(
        videoKey =>
          globalConfig.listOfFeatureTourVideos.includes(videoKey) &&
          !globalConfig.listOfFeatureTourVideosToRemoveFromSeen.includes(videoKey)
      )

      // Save back to localStorage
      localStorage.setItem(
        `${globalConfig.LOCAL_STORAGE_PREFIX}seenFeatureTour`,
        JSON.stringify(updatedSeen)
      )
    }
  }

  await router.isReady() // wait until router is fully loaded

  // Redirect to home view on reload
  if (route.name !== 'home' && route.name !== 'statistics') {
    warn('App reloaded, redirecting to home view: ' + route.name)
    router.replace({ name: 'home' })
  }

  // Set primary color CSS variable if in localStorage
  const primaryColor = localStorage.getItem(`${globalConfig.LOCAL_STORAGE_PREFIX}primaryColor`)
  if (primaryColor) {
    document.documentElement.style.setProperty('--primary-c', primaryColor)
  }

  // Send visit during maintenance email if app is not running
  if (!globalConfig.isRunning) {
    sendVisitDuringMaintenanceEmail(userUuid)
  } else {
    // Log user visit only if not on statistics page
    if (route.name !== 'statistics') {
      addUserVisit(userUuid)

      registerActivityListeners()
      startSessionHeartbeat()
    }
  }
})

/**
 * Clean up the event listener when component is unmounted
 */
onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload)
  window.removeEventListener('wheel', blockSwipeBack)
  window.removeEventListener('wheel', blockWheelZoom)
  window.removeEventListener('keydown', blockDevToolsShortcuts)
  window.removeEventListener('contextmenu', blockContextMenu)
  window.removeEventListener('resize', checkWindowSize)

  if (heartbeatTimer) {
    clearInterval(heartbeatTimer)
  }

  removeActivityListeners()
})

</script>

<template>
  <div class="main">
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
    <ErrorModal />

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
