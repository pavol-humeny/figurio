import { defineStore } from 'pinia'

export const useOperationsStore = defineStore('operationsStore', {
  state: () => ({
    operations: [],
    currentIndex: -1,
  }),
  actions: {
    addOperation(operation) {
      // Add the new operation to the operations
      this.operations.push(operation)
    },
    getNextOperation() {
      if (this.currentIndex < this.operations.length - 1) {
        this.currentIndex++
        return this.operations[this.currentIndex]
      }
      return null
    },
  },
})
