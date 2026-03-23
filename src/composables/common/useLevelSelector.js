/**
 * @file: useLevelSelector.js
 * @author: Pavol Humeny
 * @date: 15.5.2026
 * @description: Composable for managing the logic of a level selector component, allowing users to select a specific level and emitting events to update the parent component with the selected level. .
 */

export function useLevelSelector(props, emit) {
  /**
   * Sets selected level
   * @param {number|string} level - The level to select
   */
  const selectLevel = (level) => {
    if (props.disabled) return
    emit('update:modelValue', level)
    emit('update', level)
  }

  return {
    selectLevel,
  }
}
