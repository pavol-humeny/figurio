import { defineStore } from 'pinia'

export const useHistoryStore = defineStore('historyStore', {
  state: () => ({
    history: [],
    currentIndex: -1,
  }),
  actions: {
    push(stateSnapshot) {
      // Remove any future states if we are in the middle of the history
      this.history = this.history.slice(0, this.currentIndex + 1)

      // Add the new state snapshot to the history
      this.history.push(JSON.parse(JSON.stringify(stateSnapshot)))
      this.currentIndex++
    },
    undo() {
      if (this.currentIndex > 0) {
        this.currentIndex--
        return JSON.parse(JSON.stringify(this.history[this.currentIndex]))
      }
      return null
    },
    redo() {
      if (this.currentIndex < this.history.length - 1) {
        this.currentIndex++
        return JSON.parse(JSON.stringify(this.history[this.currentIndex]))
      }
      return null
    },
    reset() {
      this.history = []
      this.currentIndex = -1
    },
  },
})
