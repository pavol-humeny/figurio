import { defineStore } from 'pinia'

const STORAGE_KEY = 'imageEditorPresets'

export const usePresetsStore = defineStore('presetsStore', {
  state: () => ({
    presets: [],
    selectedPresetName: '',
  }),

  getters: {
    allPresetNames(state) {
      return state.presets.map((p) => p.name)
    },
    selectedPreset(state) {
      return state.presets.find((p) => p.name === state.selectedPresetName) || null
    },
  },

  actions: {
    loadFromStorage() {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        try {
          const parsed = JSON.parse(raw)
          this.presets = parsed.presets || []
          this.selectedPresetName = parsed.selectedPresetName || ''
        } catch (e) {
          console.error('Failed to load presets from localStorage:', e)
        }
      }
    },

    saveToStorage() {
      const data = {
        presets: this.presets,
        selectedPresetName: this.selectedPresetName,
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    },

    createPreset(name, imageOperations = [], imageFrame = {}) {
      const trimmed = name.trim()
      if (!trimmed) return 'invalid'

      const exists = this.presets.some((p) => p.name === trimmed)
      if (exists) return 'alreadyExists'

      this.presets.push({
        name: trimmed,
        imageOperations: imageOperations,
        imageFrame: imageFrame,
      })

      this.selectedPresetName = trimmed

      this.saveToStorage()

      console

      return true
    },

    updatePreset(originalName, newName, newImageOperations = [], newImageFrame = {}) {
      const trimmedNewName = newName.trim()
      if (!trimmedNewName) return false

      const preset = this.presets.find((p) => p.name === originalName)
      if (!preset) return false

      // If name is changing, check for conflict
      if (originalName !== trimmedNewName) {
        const nameExists = this.presets.some((p) => p.name === trimmedNewName)
        if (nameExists) return false
        preset.name = trimmedNewName
      }

      preset.imageOperations = newImageOperations
      preset.imageFrame = newImageFrame

      // Update selected name if affected
      if (this.selectedPresetName === originalName) {
        this.selectedPresetName = preset.name
      }

      this.saveToStorage()
      return true
    },

    selectPreset(name) {
      const found = this.presets.find((p) => p.name === name)
      this.selectedPresetName = found ? name : ''
      this.saveToStorage()
    },

    deletePreset(name) {
      this.presets = this.presets.filter((p) => p.name !== name)
      if (this.selectedPresetName === name) {
        this.selectedPresetName = ''
      }
      this.saveToStorage()
    },
  },
})
