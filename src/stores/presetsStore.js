import { defineStore } from 'pinia'
import { editorConfig } from '@/config/editorConfig'

/**
 * Store for managing image presets
 */
export const usePresetsStore = defineStore('presetsStore', {
  state: () => ({
    /** Array of saved presets */
    presets: [],

    /** Name of the currently selected preset */
    selectedPresetName: '',
  }),

  getters: {
    /**
     * List of all preset names
     * @returns {string[]}
     */
    allPresetNames(state) {
      return state.presets.map((p) => p.name)
    },

    /**
     * Currently selected preset object
     * @returns {object|null}
     */
    selectedPreset(state) {
      return state.presets.find((p) => p.name === state.selectedPresetName) || null
    },
  },

  actions: {
    /**
     * Load presets and selected name from localStorage
     */
    loadFromStorage() {
      const raw = localStorage.getItem(editorConfig.localStoragePresetsKey)
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

    /**
     * Save current presets and selection to localStorage
     */
    saveToStorage() {
      const data = {
        presets: this.presets,
        selectedPresetName: this.selectedPresetName,
      }
      localStorage.setItem(editorConfig.localStoragePresetsKey, JSON.stringify(data))
    },

    /**
     * Create a new preset and set it as selected
     * @param {string} name - Name of the new preset
     * @param {array} imageOperations - List of image operations
     * @param {object} imageFrame - Frame settings for the preset
     * @returns {'invalid'|'alreadyExists'|true}
     */
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

    /**
     * Update an existing preset (name, operations, frame)
     * @param {string} originalName - Old preset name
     * @param {string} newName - New name for the preset
     * @param {array} newImageOperations - Updated image operations
     * @param {object} newImageFrame - Updated frame settings
     * @returns {boolean} Whether update was successful
     */
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

    /**
     * Select a preset by name
     * @param {string} name - Name of the preset to select
     */
    selectPreset(name) {
      const found = this.presets.find((p) => p.name === name)
      this.selectedPresetName = found ? name : ''
      this.saveToStorage()
    },

    /**
     * Delete a preset by name and reset selection if necessary
     * @param {string} name - Name of the preset to delete
     */
    deletePreset(name) {
      this.presets = this.presets.filter((p) => p.name !== name)
      if (this.selectedPresetName === name) {
        this.selectedPresetName = ''
      }
      this.saveToStorage()
    },
  },
})
