import { defineStore } from 'pinia'
import { viewportConfig } from '@/config/viewportConfig'

function getBoolean(key, fallback = true) {
  const value = localStorage.getItem(key)
  return value === 'false' ? false : fallback
}

function getNumber(key, fallback) {
  const value = parseInt(localStorage.getItem(key), 10)
  return isNaN(value) ? fallback : value
}

function getString(key, fallback) {
  const value = localStorage.getItem(key)
  return value !== null ? value : fallback
}

export const useUiStore = defineStore('ui', {
  state: () => ({
    theme: getString('theme', viewportConfig.theme),

    keyShortcutsEnabled: getBoolean('keyShortcutsEnabled', viewportConfig.keyShortcutsEnabled),

    rightPanelOpen: getBoolean('rightPanelOpen', viewportConfig.rightPanelOpen),
    rightPanelDefaultWidth: viewportConfig.rightPanelDefaultWidth,
    rightPanelWidth: getNumber('rightPanelWidth', viewportConfig.rightPanelWidth),
    rightPanelMinWidth: viewportConfig.rightPanelMinWidth,
    rightPanelMaxWidth: viewportConfig.rightPanelMaxWidth,
    collapseButtonWidth: viewportConfig.collapseButtonWidth,
  }),
  actions: {
    toggleTheme() {
      this.theme = this.theme === 'dark' ? 'light' : 'dark'
      localStorage.setItem('theme', this.theme)
      document.documentElement.className = this.theme
    },

    initApp() {
      // Init theme
      document.documentElement.className = this.theme
    },

    setKeyShortcuts(value) {
      this.keyShortcutsEnabled = value
      localStorage.setItem('keyShortcutsEnabled', this.keyShortcutsEnabled.toString())
    },

    toggleRightPanel() {
      this.rightPanelOpen = !this.rightPanelOpen
      localStorage.setItem('rightPanelOpen', this.rightPanelOpen.toString())
    },

    setRightPanelWidth(width) {
      this.rightPanelWidth = width
      localStorage.setItem('rightPanelWidth', this.rightPanelWidth.toString())
    },

    resetRightPanelWidth() {
      this.rightPanelWidth = this.rightPanelDefaultWidth
      localStorage.setItem('rightPanelWidth', this.rightPanelWidth.toString())
    },
  },
})
