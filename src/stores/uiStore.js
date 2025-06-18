import { defineStore } from 'pinia'

function getBoolean(key, fallback = true) {
  const value = localStorage.getItem(key)
  return value === 'false' ? false : fallback
}

function getNumber(key, fallback) {
  const value = parseInt(localStorage.getItem(key), 10)
  return isNaN(value) ? fallback : value
}

export const useUiStore = defineStore('ui', {
  state: () => ({
    theme: localStorage.getItem('theme') || 'dark',

    keyShortcutsEnabled: getBoolean('keyShortcutsEnabled', true),

    rightPanelOpen: getBoolean('rightPanelOpen', true),
    rightPanelDefaultWidth: 300,
    rightPanelWidth: getNumber('rightPanelWidth', 300),
    rightPanelMinWidth: 200,
    rightPanelMaxWidth: 600,
    collapseButtonWidth: 30,
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
