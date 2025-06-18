import { defineStore } from "pinia";

export const useEditorStore = defineStore ("editorStore", {
  state: () =>({
    selectedToolKey: '',
    selectedTabPerTool: {},
  }),
  actions: {
    selectTool(toolKey) {
      console.log('selectTool called with:', toolKey);
      this.selectedToolKey = toolKey;
    },
    selectTab(tabKey) {
      console.log('selectTab called with:', tabKey);
      if (this.selectedToolKey) {
        this.selectedTabPerTool[this.selectedToolKey] = tabKey;
      }
    },
  },
})
