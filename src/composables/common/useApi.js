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

  /**
   * Fetches total number of visits
   */
  const getAllVisits = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/visits/allVisits`)
      if (!res.ok) throw new Error('Failed to fetch all visits')
      const data = await res.json()
      log('Total visits fetched:', data.totalVisits)
      return data.totalVisits
    } catch (err) {
      error('Error fetching total visits:', err)
      return 0
    }
  }

  /**
   * Fetches number of unique visitors
   */
  const getUniqueVisits = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/visits/uniqueVisits`)
      if (!res.ok) throw new Error('Failed to fetch unique visits')
      const data = await res.json()
      log('Unique visits fetched:', data.uniqueVisitors)
      return data.uniqueVisitors
    } catch (err) {
      error('Error fetching unique visits:', err)
      return 0
    }
  }

  /**
   * Fetches visits data for the last seven days
   */
  const getLastSevenDaysVisits = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/visits/lastSevenDaysVisits`)
      if (!res.ok) throw new Error('Failed to fetch last seven days visits')

      const data = await res.json()
      log('Last seven days visits fetched:', data)

      return data
    } catch (err) {
      error('Error fetching last seven days visits:', err)
      return []
    }
  }

  /**
   * Fetches visits grouped by country
   */
  const getVisitsByCountry = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/visits/visitsByCountry`)
      if (!res.ok) throw new Error('Failed to fetch visits by country')

      const data = await res.json()
      log('Visits by country fetched:', data)

      return data
    } catch (err) {
      error('Error fetching visits by country:', err)
      return []
    }
  }

  /**
   * Fetches all visits with total visits and new users per day
   */
  const getDaysVisits = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/visits`)
      if (!res.ok) throw new Error('Failed to fetch all visits')

      const data = await res.json()
      log('All visits fetched:', data)

      return data
    } catch (err) {
      error('Error fetching all visits:', err)
      return []
    }
  }

  /**
   * Fetches overview of events
   */
  const getEventsOverview = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/events/overview`)
      if (!res.ok) throw new Error('Failed to fetch events overview')

      const data = await res.json()
      log('Events overview fetched:', data)

      return data
    } catch (err) {
      error('Error fetching events overview:', err)
      return []
    }
  }

  /**
   * Fetches toggle tool events
   */
  const getToggleTool = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/events/toggleTool`)
      if (!res.ok) throw new Error('Failed to fetch toggle tool events')

      const data = await res.json()
      log('Toggle tool events fetched:', data)

      return data
    } catch (err) {
      error('Error fetching toggle tool events:', err)
      return []
    }
  }

  return {
    addUserVisit,
    addUserEvent,
    getAllVisits,
    getUniqueVisits,
    getLastSevenDaysVisits,
    getVisitsByCountry,
    getDaysVisits,
    getEventsOverview,
    getToggleTool,
  }
}
