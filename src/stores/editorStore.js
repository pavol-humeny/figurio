import { defineStore } from 'pinia'

/**
 * State and actions for managing editor tool selection, subtools, and active tabs
 */
export const useEditorStore = defineStore('editorStore', {
  state: () => ({
    /** Currently selected main tool key */
    selectedToolKey: '',

    /** Mapping of selected tab per tool key */
    selectedTabPerTool: {},

    /** Currently selected subtool key */
    selectedSubToolKey: '',

    /** Key of the tool that has open subtools */
    toolWithOpenSubToolsKey: '',
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
  },
})
