import { defineStore } from 'pinia'

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
        console.warn('Invalid preset name provided.')
        return false
      }

      const exists = this.presets.some((p) => p.name === name)
      if (exists) {
        console.warn(`Preset with name "${name}" already exists.`)
        return false
      }

      this.presets.push({
        name: name.trim(),
        imageOperations: {
          transformations: [],
          frame: {},
          smartCrop: {},
        },
      })

      this.selectedPresetName = name.trim()
      return true
    },

    addPreset(preset) {
      if (!preset.name || typeof preset.imageOperations !== 'object') return false

      const exists = this.presets.some((p) => p.name === preset.name)
      if (exists) {
        console.warn(`Preset with name "${preset.name}" already exists.`)
        return false
      }

      this.presets.push({
        name: preset.name,
        imageOperations: JSON.parse(JSON.stringify(preset.imageOperations)),
      })

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
    addTransformation(presetName, transformation) {
      const preset = this.presets.find((p) => p.name === presetName)
      if (!preset) return
      preset.imageOperations.transformations ??= []
      preset.imageOperations.transformations.push({ ...transformation })
    },

    removeTransformation(presetName, index) {
      const preset = this.presets.find((p) => p.name === presetName)
      if (
        preset &&
        Array.isArray(preset.imageOperations.transformations) &&
        index >= 0 &&
        index < preset.imageOperations.transformations.length
      ) {
        preset.imageOperations.transformations.splice(index, 1)
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
