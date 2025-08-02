import { editorConfig } from '@/config/editorConfig'
import { defineStore } from 'pinia'

/**
 * State and actions for managing editor tool selection, subtools, and active tabs
 */
export const useEditorStore = defineStore('editorStore', {
  state: () => ({
    /** Currently selected main tool key */
    selectedToolKey: editorConfig.defaultToolKey,

    /** Mapping of selected tab per tool key */
    selectedTabPerTool: {},

    /** Currently selected subtool key */
    selectedSubToolKey: '',

    /** Key of the tool that has open subtools */
    toolWithOpenSubToolsKey: '',

    /** Whether any SVG object is selected */
    isSvgObjectSelected: false,

    /** Whether any SVG object is currently being resized */
    isSvgObjectResizing: false,

    /** Whether any SVG object is currently being drawn */
    isSvgObjectDrawing: false,
  }),
  actions: {
    /**
     * Select main tool
     * @param {string} toolKey - Key of the selected tool
     */
    selectTool(toolKey) {
      this.selectedToolKey = toolKey
    },

    /**
     * Select active tab for the current tool
     * @param {string} tabKey - Key of the selected tab
     */
    selectTab(tabKey) {
      if (this.selectedToolKey) {
        this.selectedTabPerTool[this.selectedToolKey] = tabKey
      }
    },

    /**
     * Select a subtool
     * @param {string} subToolKey - Key of the selected subtool
     */
    selectSubTool(subToolKey) {
      this.selectedSubToolKey = subToolKey
    },

    /**
     * Set which tool has its subtools panel open
     * @param {string} toolKey - Tool key with open subtools
     */
    setToolWithOpenSubTools(toolKey) {
      this.toolWithOpenSubToolsKey = toolKey
    },

    /**
     * Set whether any SVG object is selected
     * @param {boolean} isSelected - True if an SVG object is selected, false otherwise
     */
    setIsSvgObjectSelected(isSelected) {
      this.isSvgObjectSelected = isSelected
    },
  },
})
