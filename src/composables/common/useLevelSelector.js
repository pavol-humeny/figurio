export function useLevelSelector(props, emit) {
  /**
   * Sets selected level
   * @param {number|string} level
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
