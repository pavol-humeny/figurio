import { defineStore } from "pinia";

export const useToolStore = defineStore ("toolStore", {
  state: () =>({
    selectedToolKey: '',
  }),
  actions: {
    selectTool(toolKey) {
      this.selectedToolKey = toolKey;
    }
  },
})
