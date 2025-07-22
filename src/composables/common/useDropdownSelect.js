import { ref, watch } from 'vue'

/**
 * Logic for the <DropdownSelect> component
 *
 * @param {{ modelValue: string, icon?: string, onReset?: () => void }} props - Component props
 * @param {(event: string, value: any) => void} emit - Emit function for model updates
 * @returns {{
 *   selectedValue: import('vue').Ref<string>,
 *   onChange: () => void,
 *   onIconDoubleClick: () => void,
 *   setValue: (value: string) => void,
 *   showIcon: boolean
 * }}
 */
export function useDropdownSelect(props, emit) {
  /**
   * Currently selected value of the dropdown
   */
  const selectedValue = ref(props.modelValue)

  /**
   * Watch for external changes and synchronize internal value
   */
  watch(
    () => props.modelValue,
    (newVal) => {
      selectedValue.value = newVal
    },
  )

  /**
   * Emits updated value when user selects an option
   */
  const onChange = () => {
    emit('update:modelValue', selectedValue.value)
    emit('update', selectedValue.value)
  }

  /**
   * Emits reset action when icon is double-clicked
   */
  const onIconDoubleClick = () => {
    if (typeof props.onReset === 'function') {
      props.onReset()
    }
  }

  /**
   * Sets selected value programmatically
   *
   * @param {string} newValue - New selected value
   */
  const setValue = (newValue) => {
    selectedValue.value = newValue
  }

  /**
   * Whether the reset icon should be shown
   */
  const showIcon = props.icon !== ''

  return {
    selectedValue,
    onChange,
    onIconDoubleClick,
    setValue,
    showIcon,
  }
}
