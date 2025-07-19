import { defineStore } from 'pinia'
import { useImageStore } from './imageStore'
import { useHistoryStore } from './historyStore'
import { useViewportStore } from './viewportStore'

export const useWorkspaceStore = defineStore('workspaceStore', {
  state: () => ({
    tabs: [], // Each tab: { id, name, imageSnapshot, historySnapshot, viewportSnapshot }
    activeTabIndex: -1,
  }),

  actions: {
    addNewTab(name = 'Untitled') {
      const imageStore = useImageStore()
      const historyStore = useHistoryStore()
      const viewportStore = useViewportStore()

      const imageSnapshot = structuredClone(imageStore.getFullSnapshot())
      const historySnapshot = structuredClone(historyStore.getFullSnapshot())
      const viewportSnapshot = structuredClone(viewportStore.getFullSnapshot())

      const id = Date.now()

      console.log('!!!!!!! Adding new tab:', id, name)

      this.tabs.push({
        id,
        name,
        imageSnapshot,
        historySnapshot,
        viewportSnapshot,
      })

      this.activeTabIndex = this.tabs.length - 1

      // Print all tabs for debugging
      console.log('!!!!!!! Tabs after adding new tab:', this.tabs)
    },

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

    switchToTab(index) {
      if (index < 0 || index >= this.tabs.length) return
      this.activeTabIndex = index
      this.restoreTab(index)
    },

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

    updateCurrentTabState() {
      if (this.activeTabIndex === -1) return

      const imageStore = useImageStore()
      const historyStore = useHistoryStore()
      const viewportStore = useViewportStore()

      this.tabs[this.activeTabIndex].imageSnapshot = imageStore.getFullSnapshot()
      this.tabs[this.activeTabIndex].historySnapshot = historyStore.getFullSnapshot()
      this.tabs[this.activeTabIndex].viewportSnapshot = viewportStore.getFullSnapshot()
    },

    updateCurrentTabName(name) {
      console.log('--------------Renaming-------------------')
      if (this.activeTabIndex === -1) return
      this.tabs[this.activeTabIndex].name = name
    },
  },
})
