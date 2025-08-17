import { globalConfig } from '@/config/globalConfig.js'
import { useUiStore } from '@/stores/uiStore'

export function useSendEvent() {
  /**
   * Sends an event to the API, unless running on localhost.
   *
   * @param {string} eventType - Type of the event (e.g., "add_object").
   * @param {string|null} tool - Tool used (optional).
   * @param {string|null} buttonName - Button name (optional).
   * @param {object|null} eventData - Additional event data (optional).
   * @returns {Promise<object|null>} API response or null on error.
   */
  const sendEvent = async (eventType, tool = null, buttonName = null, eventData = null) => {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      console.log('Skipping event send on localhost:', eventType)
      return null
    }
    const uiStore = useUiStore()

    try {
      const response = await fetch(`${globalConfig.API_BASE}/api/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: uiStore.userUuid,
          event_type: eventType,
          tool,
          button_name: buttonName,
          event_data: eventData,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Server error:', errorText)
        return null
      }

      return await response.json()
    } catch (error) {
      console.error('Error sending event:', error)
      return null
    }
  }

  return {
    sendEvent,
  }
}
