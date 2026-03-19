/**
 * @file: historyConfig.js
 * @author: Pavol Humeny
 * @date: 15.5.2026
 * @description: Configuration for the history store. This module exports a `historyConfig` object that contains settings related to the undo/redo history management in the image editor, such as the maximum number of history entries allowed to prevent excessive memory usage.
 */
export const historyConfig = {
  maximumHistoryLength: 100,
}
