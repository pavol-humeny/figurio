import { defineStore } from 'pinia'
import { useToastModal } from '@/composables/modals/useToastModal'

const { showToastModal } = useToastModal()

export const usePresetsStore = defineStore('presetsStore', {
  state: () => ({
    presets: [],
    selectedPresetName: null,
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
    createPreset(name) {
      if (!name || typeof name !== 'string' || name.trim() === '') {
        return false
      }

      // check if preset with this name already exists
      if (this.allPresetNames.includes(name.trim())) {
        return false
      }

      this.presets.push({
        name: name.trim(),
        imageOperations: {
          transformations: {},
          frame: {},
          smartCrop: {},
        },
      })

      this.selectedPresetName = name.trim()

      return true
    },

    updatePreset(originalName, newName, newImageOperations = {}) {
      //Print all preset names for debugging
      console.log('All preset names:', this.allPresetNames)

      if (!newName || typeof newName !== 'string' || newName.trim() === '') {
        return false
      }

      // check if preset with this name exists
      if (!this.allPresetNames.includes(newName)) {
        return false
      }

      console.log('Updating preset:', originalName, newName, newImageOperations)

      const preset = this.presets.find((p) => p.name === originalName)
      if (!preset) return false

      preset.name = newName
      preset.imageOperations = {
        ...preset.imageOperations,
        ...newImageOperations,
      }

      return true
    },

    selectPreset(name) {
      const found = this.presets.find((p) => p.name === name)
      this.selectedPresetName = found ? name : null
    },

    deletePreset(name) {
      this.presets = this.presets.filter((p) => p.name !== name)
      if (this.selectedPresetName === name) {
        this.selectedPresetName = null
      }
    },

    // --- TRANSFORMATIONS ---
    updateTransformation(presetName, newTransformation) {
      const preset = this.presets.find((p) => p.name === presetName)
      if (!preset) return
      preset.imageOperations.transformations = {
        ...preset.imageOperations.transformations,
        ...newTransformation,
      }
    },

    // --- FRAME ---
    updateFrame(presetName, newFrameSettings) {
      const preset = this.presets.find((p) => p.name === presetName)
      if (!preset) return
      preset.imageOperations.frame = {
        ...preset.imageOperations.frame,
        ...newFrameSettings,
      }
    },

    // --- SMART CROP ---
    updateSmartCrop(presetName, newSmartCropSettings) {
      const preset = this.presets.find((p) => p.name === presetName)
      if (!preset) return
      preset.imageOperations.smartCrop = {
        ...preset.imageOperations.smartCrop,
        ...newSmartCropSettings,
      }
    },
  },
})
