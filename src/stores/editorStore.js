import { defineStore } from 'pinia'

export const useEditorStore = defineStore('editorStore', {
  state: () => ({
    selectedToolKey: '',
    selectedTabPerTool: {},
    selectedSubToolKey: '',
  }),
  actions: {
    selectTool(toolKey) {
      this.selectedToolKey = toolKey
    },
    selectTab(tabKey) {
      if (this.selectedToolKey) {
        this.selectedTabPerTool[this.selectedToolKey] = tabKey
      }
    },
    selectSubTool(subToolKey) {
      this.selectedSubToolKey = subToolKey
    },
  },
})
