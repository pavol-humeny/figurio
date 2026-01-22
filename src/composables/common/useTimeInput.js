import { ref, watch } from 'vue'

/**
 * Logic for handling time input in hours and minutes
 */
export function useTimeInput(props, emit) {
  /**
   * Internal input values (string – free typing)
   */
  const hoursInput = ref('')
  const minutesInput = ref('')

  /**
   * Sync from modelValue → inputs
   */
  const syncFromModel = (totalMinutes) => {
    const h = Math.floor(totalMinutes / 60)
    const m = totalMinutes % 60

    hoursInput.value = h.toString().padStart(2, '0')
    minutesInput.value = m.toString().padStart(2, '0')
  }

  // Initial sync
  syncFromModel(props.modelValue)

  /**
   * Watch external modelValue
   */
  watch(
    () => props.modelValue,
    (val) => {
      syncFromModel(val)
    },
  )

  /**
   * Free typing – NO validation
   */
  const onHoursInput = (e) => {
    hoursInput.value = e.target.value
  }

  const onMinutesInput = (e) => {
    minutesInput.value = e.target.value
  }

  /**
   * Validate + clamp + emit (blur / enter)
   */
  const updateTime = () => {
    let h = parseInt(hoursInput.value, 10)
    let m = parseInt(minutesInput.value, 10)

    if (Number.isNaN(h)) h = 0
    if (Number.isNaN(m)) m = 0

    // Clamp
    h = Math.min(23, Math.max(0, h))
    m = Math.min(59, Math.max(0, m))

    const total = h * 60 + m

    // Sync back formatted values
    hoursInput.value = h.toString().padStart(2, '0')
    minutesInput.value = m.toString().padStart(2, '0')

    emit('update:modelValue', total)
    emit('update', total)

    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur()
    }
  }

  /**
   * Handle mouse wheel on hours/minutes input
   *
   * @param {'hours' | 'minutes'} type
   * @param {WheelEvent} event
   */
  const onWheel = (type, event) => {
    if (props.disabled) return

    event.preventDefault()

    const delta = event.deltaY < 0 ? 1 : -1

    if (type === 'hours') {
      let h = parseInt(hoursInput.value, 10)
      if (Number.isNaN(h)) h = 0

      h += delta
      h = Math.min(23, Math.max(0, h))

      hoursInput.value = h.toString()
    }

    if (type === 'minutes') {
      let m = parseInt(minutesInput.value, 10)
      if (Number.isNaN(m)) m = 0

      m += delta
      m = Math.min(59, Math.max(0, m))

      minutesInput.value = m.toString()
    }

    updateTime()
  }

  return {
    hours: hoursInput,
    minutes: minutesInput,
    onHoursInput,
    onMinutesInput,
    updateTime,
    onWheel,
  }
}
