import { globalConfig } from '@/config/globalConfig.js'
import { useConsole } from '@/composables/common/useConsole.js'
import { useUiStore } from '@/stores/uiStore'

const { log, warn, error } = useConsole()

/**
 * Custom composable to handle API requests for user visits and events
 */
export function useApi() {
  const API_BASE = globalConfig.API_BASE

  const isLocalhost = () => {
    return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  }

  /**
   * Adds a visit for a user.
   * If user does not exist, backend will create it automatically.
   * @param {string} userId - UUID of the user
   */
  const addUserVisit = async (userId) => {
    if (!globalConfig.sendUsageStats) return

    if (isLocalhost() && !globalConfig.sendUsageStatsOnLocalhost) return

    if (!userId) {
      warn('Missing userId for visit')
      return
    }

    // log('Adding visit for user:', userId)

    try {
      const res = await fetch(`${API_BASE}/api/users/${userId}/visits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      if (res.ok) {
        log(`Visit successfully added for user ${userId}`)
      } else {
        const msg = await res.text()
        warn(`Failed to add visit: ${msg}`)
      }
    } catch (err) {
      error('Network error while adding user visit:', err)
    }
  }

  /**
   * Adds an event for a user.
   * @param {string} eventType - Type of the event
   * @param {Object} data - Event data (will be JSON.stringified)
   */
  const addUserEvent = async (eventType, data) => {
    if (!globalConfig.sendUsageStats) return

    if (isLocalhost() && !globalConfig.sendUsageStatsOnLocalhost) return

    const uiStore = useUiStore()
    const userId = uiStore.userUuid

    if (!userId || !eventType) {
      warn('Missing userId or eventType for event')
      return
    }

    // log(`Adding event "${eventType}" for user:`, userId)

    try {
      const res = await fetch(`${API_BASE}/api/users/${userId}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventType, data }),
      })

      if (res.ok) {
        log(`Event "${eventType}" successfully added for user ${userId}`)
      } else {
        const msg = await res.text()
        warn(`Failed to add event: ${msg}`)
      }
    } catch (err) {
      error('Network error while adding user event:', err)
    }
  }

  return {
    addUserVisit,
    addUserEvent,
  }
}
