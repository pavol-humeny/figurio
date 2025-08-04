import { ref, watch } from 'vue'

/**
 * Logic for handling time input in hours and minutes
 * @param {Object} props - Component props
 * @param {number} props.modelValue - Total time in minutes
 * @param {(event: string, value: number) => void} emit - Emit function for model updates
 * @returns {{
 *   hours: import('vue').Ref<number>,
 *   minutes: import('vue').Ref<number>,
 *   onHoursInput: (e: Event) => void,
 *   onMinutesInput: (e: Event) => void,
 *   updateTime: () => void
 * }}
 */
export function useTimeInput(props, emit) {
  /**
   * Local hour and minute inputs
   */
  const hours = ref(Math.floor(props.modelValue / 60))
  const minutes = ref(props.modelValue % 60)

  /**
   * Watch for external changes to modelValue and update internal state
   */
  watch(
    () => props.modelValue,
    (val) => {
      hours.value = Math.floor(val / 60)
      minutes.value = val % 60
    },
  )

  /**
   * Displayed as 2-digit string, but stored as number
   * @param {Event} event - Input event
   */
  const onHoursInput = (event) => {
    const val = event.target.value
    const parsed = parseInt(val, 10)

    if (isNaN(parsed) || parsed < 0 || parsed > 23) {
      hours.value = 10 // Default to 10 hours if invalid
    } else {
      hours.value = parsed
    }

    // Always update visible value to match internal state
    event.target.value = hours.value.toString().padStart(2, '0')
  }

  /**
   * Displayed as 2-digit string, but stored as number
   * @param {Event} event - Input event
   */
  const onMinutesInput = (event) => {
    const val = event.target.value
    const parsed = parseInt(val, 10)

    if (isNaN(parsed) || parsed < 0 || parsed > 59) {
      minutes.value = 10 // Default to 10 minutes if invalid
    } else {
      minutes.value = parsed
    }

    // Always update visible value to match internal state
    event.target.value = minutes.value.toString().padStart(2, '0')
  }

  /**
   * Emit updated total minutes
   */
  const updateTime = () => {
    const clampedHours = Math.max(0, hours.value)
    const clampedMinutes = Math.min(59, Math.max(0, minutes.value))
    const total = clampedHours * 60 + clampedMinutes
    emit('update:modelValue', total)
    emit('update', total)
  }

  return {
    hours,
    minutes,
    onHoursInput,
    onMinutesInput,
    updateTime,
  }
}
