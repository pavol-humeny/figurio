/**
 * @file: historyStore.js
 * @author: Pavol Humeny
 * @date: 15.5.2026
 */
import { defineStore } from 'pinia'
import { historyConfig } from '@/config/historyConfig'

/**
 * Store managing undo/redo history for image operations
 */
export const useHistoryStore = defineStore('historyStore', {
  state: () => ({
    /** Array of past state snapshots */
    history: [],

    /** Index of the current state in the history array */
    currentIndex: -1,

    /** Maximum number of history entries allowed */
    maximumHistoryLength: historyConfig.maximumHistoryLength,
  }),
  actions: {
    /**
     * Push a new state snapshot to the history stack
     * @param {any} stateSnapshot - Deep copy of the current state
     */
    push(stateSnapshot) {
      if (!stateSnapshot) return
      // Remove all "future" states after current index
      this.history = this.history.slice(0, this.currentIndex + 1)

      // Add the new state snapshot to the history
      this.history.push(stateSnapshot)
      this.currentIndex++

      // Trim oldest state if limit exceeded
      if (this.history.length > this.maximumHistoryLength) {
        this.history.shift()
        this.currentIndex--
      }
    },

    /**
     * Undo last change and return previous state snapshot
     * @returns {any|null} Previous state snapshot or null if not possible
     */
    undo() {
      if (this.currentIndex > 0) {
        this.currentIndex--
        return this.history[this.currentIndex]
      }
      return null
    },

    /**
     * Reset history to the initial state (first snapshot) and return it
     * @returns {any|null} Initial state snapshot or null if history is empty
     */
    resetHistory() {
      this.currentIndex = 0
      return this.history[this.currentIndex] || null
    },

    /**
     * Redo next change and return next state snapshot
     * @returns {any|null} Next state snapshot or null if not possible
     */
    redo() {
      if (this.currentIndex < this.history.length - 1) {
        this.currentIndex++
        return this.history[this.currentIndex]
      }
      return null
    },

    /**
     * Clear the entire history stack
     */
    reset() {
      this.history = []
      this.currentIndex = -1
    },

    /**
     * Get a full snapshot of the history state (for multi-file support)
     * @returns {{ history: any[], currentIndex: number }}
     */
    getFullSnapshot() {
      return {
        history: [...this.history], // shallow copy array
        currentIndex: this.currentIndex,
      }
    },

    /**
     * Apply a full history snapshot (for multi-file support)
     * @param {{ history: any[], currentIndex: number }} snapshot - Snapshot to restore
     */
    applyFullSnapshot(snapshot) {
      this.history = Array.isArray(snapshot.history) ? [...snapshot.history] : []

      this.currentIndex = typeof snapshot.currentIndex === 'number' ? snapshot.currentIndex : -1
    },
  },
})
