import { defineStore } from 'pinia'
import { useToastModal } from '@/composables/modals/useToastModal'
import { useI18n } from 'vue-i18n'

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
      return state.presets.find((p) => p.name === state.selectedPresetName) || ''
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

    createPreset(name) {
      const trimmed = name.trim()
      if (!trimmed) return false

      const exists = this.presets.some((p) => p.name === trimmed)
      if (exists) return false

      this.presets.push({
        name: trimmed,
        imageOperations: {
          transformations: {
            rotationAngle: 0,
            flipHorizontal: false,
            flipVertical: false,
            cropBox: null,
          },
          smartCrop: {
            enabled: false,
          },
          frame: {
            enabled: false,
            color: '#000000',
            width: 0,
            height: 0,
            type: 'frameSolid',
          },
        },
      })

      this.selectedPresetName = trimmed

      this.saveToStorage()

      return true
    },

    updatePreset(originalName, newName, newImageOperations = {}) {
      console.log('All presets:', this.presets)

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

      // Deep merge operation values
      const mergeDeep = (target, source) => {
        for (const key in source) {
          if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
            target[key] = mergeDeep({ ...(target[key] || {}) }, source[key])
          } else {
            target[key] = source[key]
          }
        }
        return target
      }

      preset.imageOperations = mergeDeep(preset.imageOperations, newImageOperations)

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
