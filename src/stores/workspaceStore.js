import { defineStore } from 'pinia'
import { useImageStore } from './imageStore'
import { useHistoryStore } from './historyStore'
import { useViewportStore } from './viewportStore'
import { useConsole } from '@/composables/common/useConsole.js'
const { log } = useConsole()

/**
 * Store managing multiple workspace tabs
 * Each tab contains a separate imageStore, historyStore, and viewportStore state
 */
export const useWorkspaceStore = defineStore('workspaceStore', {
  state: () => ({
    /** Array of open tabs with snapshots and names */
    tabs: [], // Each tab: { id, name, imageSnapshot, historySnapshot, viewportSnapshot }

    /** Index of the currently active tab */
    activeTabIndex: -1,
  }),

  getters: {
    /**
     * Number of open tabs
     * @returns {number}
     */
    numberOfTabs: (state) => state.tabs.length,
  },
  actions: {
    /**
     * Add a new tab with current state snapshots.
     * @param {string} name - Name of the tab (default: 'Untitled')
     */
    addNewTab(name = 'Untitled', fileExtension, t) {
      const imageStore = useImageStore()
      const historyStore = useHistoryStore()
      const viewportStore = useViewportStore()

      const imageSnapshot = structuredClone(imageStore.getFullSnapshot(t))
      const historySnapshot = structuredClone(historyStore.getFullSnapshot())
      const viewportSnapshot = structuredClone(viewportStore.getFullSnapshot())

      const id = Date.now()

      log('!!!!!!! Adding new tab:', id, name)

      this.tabs.push({
        id,
        name,
        fileExtension,
        imageSnapshot,
        historySnapshot,
        viewportSnapshot,
      })

      this.activeTabIndex = this.tabs.length - 1
    },

    /**
     * Close a tab by index and restore the next available tab if any.
     * @param {number} index - Index of the tab to close (defaults to active)
     */
    closeTab(index = this.activeTabIndex) {
      if (index < 0 || index >= this.tabs.length) return

      this.tabs.splice(index, 1)

      if (this.activeTabIndex >= this.tabs.length) {
        this.activeTabIndex = this.tabs.length - 1
      }

      if (this.activeTabIndex >= 0) {
        this.restoreTab(this.activeTabIndex)
      } else {
        const imageStore = useImageStore()

        imageStore.closeFile()
      }
    },

    /**
     * Close all tabs and clear the workspace.
     */
    closeAllTabs() {
      while (this.tabs.length > 0) {
        this.closeTab(0)
      }
    },

    /**
     * Switch to a tab by its index and restore its state.
     * @param {number} index
     */
    switchToTab(index) {
      if (index < 0 || index >= this.tabs.length) return
      this.activeTabIndex = index

      const viewportEl = document.querySelector('.viewport-content-wrapper')

      if (viewportEl) {
        // Set opacity to 0
        viewportEl.style.opacity = 0
      }

      this.restoreTab(index)

      if (viewportEl) {
        // After 50ms set opacity back to 1
        setTimeout(() => {
          viewportEl.style.opacity = 1
        }, 50)
      }
    },

    /**
     * Restore the state from a tab snapshot to all stores.
     * @param {number} index
     */
    restoreTab(index) {
      const imageStore = useImageStore()
      const historyStore = useHistoryStore()
      const viewportStore = useViewportStore()

      const tab = this.tabs[index]
      if (!tab) return

      imageStore.applyFullSnapshot(tab.imageSnapshot)
      historyStore.applyFullSnapshot(tab.historySnapshot)
      viewportStore.applyFullSnapshot(tab.viewportSnapshot)
    },

    /**
     * Save current state to the active tab snapshot.
     */
    updateCurrentTabState(t) {
      if (this.activeTabIndex === -1) return

      const imageStore = useImageStore()
      const historyStore = useHistoryStore()
      const viewportStore = useViewportStore()

      this.tabs[this.activeTabIndex].imageSnapshot = imageStore.getFullSnapshot(t)
      this.tabs[this.activeTabIndex].historySnapshot = historyStore.getFullSnapshot()
      this.tabs[this.activeTabIndex].viewportSnapshot = viewportStore.getFullSnapshot()
    },

    /**
     * Rename the currently active tab.
     * @param {string} name
     */
    updateCurrentTabName(name) {
      if (this.activeTabIndex === -1) return
      this.tabs[this.activeTabIndex].name = name
    },

    /**
     * Switch to the next tab (cyclic). Saves the current tab first.
     */
    switchToNextTab(t) {
      if (this.tabs.length <= 1 || this.activeTabIndex === -1) return

      const nextIndex = (this.activeTabIndex + 1) % this.tabs.length

      this.updateCurrentTabState(t)
      this.switchToTab(nextIndex)
    },

    /**
     * Switch to the previous tab (cyclic). Saves the current tab first.
     */
    switchToPreviousTab(t) {
      if (this.tabs.length <= 1 || this.activeTabIndex === -1) return

      const prevIndex = (this.activeTabIndex - 1 + this.tabs.length) % this.tabs.length

      this.updateCurrentTabState(t)
      this.switchToTab(prevIndex)
    },
  },
})
