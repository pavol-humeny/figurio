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
    if (!globalConfig.usageStatsSettings.sendUsageStats) return

    if (isLocalhost() && !globalConfig.usageStatsSettings.sendUsageStatsOnLocalhost) return

    if (!userId) {
      warn('Missing userId for visit')
      return
    }

    try {
      // Get public IP
      const ipRes = await fetch('https://api.ipify.org?format=json')
      const { ip } = await ipRes.json()

      const res = await fetch(`${API_BASE}/api/users/${userId}/visits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ip }),
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
   * Adds a session for a user with the given duration.
   * @param {string} userId - UUID of the user
   * @param {number} durationMs - Duration of the session in milliseconds
   */
  const addUserSession = async (userId, durationMs) => {
    if (!globalConfig.usageStatsSettings.sendUsageStats) return

    if (isLocalhost() && !globalConfig.usageStatsSettings.sendUsageStatsOnLocalhost) return

    console.warn('Adding session with duration (ms):', durationMs)

    if (!userId) {
      warn('Missing userId for session')
      return
    }

    try {
      const res = await fetch(`${API_BASE}/api/users/${userId}/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ durationMs }),
      })

      if (res.ok) {
        log(`Session successfully added for user ${userId}`)
      } else {
        const msg = await res.text()
        warn(`Failed to add session: ${msg}`)
      }
    } catch (err) {
      error('Network error while adding user session:', err)
    }
  }

  /**
   * Adds an event for a user.
   * @param {string} eventType - Type of the event
   * @param {Object} data - Event data (will be JSON.stringified)
   */
  const addUserEvent = async (eventType, data) => {
    if (!globalConfig.usageStatsSettings.sendUsageStats) return

    if (isLocalhost() && !globalConfig.usageStatsSettings.sendUsageStatsOnLocalhost) return

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
   * Fetches visits data for the last days
   */
  const getLastDaysVisits = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/visits/lastDaysVisits`)
      if (!res.ok) throw new Error('Failed to fetch last days visits')

      const data = await res.json()
      log('Last days visits fetched:', data)

      return data
    } catch (err) {
      error('Error fetching last days visits:', err)
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

  /**
   * Fetches apply operation events
   */
  const getApplyOperation = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/events/applyOperation`)
      if (!res.ok) throw new Error('Failed to fetch apply operation events')

      const data = await res.json()
      log('Apply operation events fetched:', data)

      return data
    } catch (err) {
      error('Error fetching apply operation events:', err)
      return []
    }
  }

  /**
   * Fetches upload image events
   */
  const getUploadImage = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/events/uploadImage`)
      if (!res.ok) throw new Error('Failed to fetch upload image events')

      const data = await res.json()
      log('Upload image events fetched:', data)

      return data
    } catch (err) {
      error('Error fetching upload image events:', err)
      return []
    }
  }

  /**
   * Fetches export image events
   */
  const getExportImage = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/events/exportImage`)
      if (!res.ok) throw new Error('Failed to fetch export image events')

      const data = await res.json()
      log('Export image events fetched:', data)

      return data
    } catch (err) {
      error('Error fetching export image events:', err)
      return []
    }
  }

  /**
   * Fetches open modal events
   */
  const getOpenModal = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/events/openModal`)
      if (!res.ok) throw new Error('Failed to fetch open modal events')

      const data = await res.json()
      log('Open modal events fetched:', data)

      return data
    } catch (err) {
      error('Error fetching open modal events:', err)
      return []
    }
  }

  /**
   * Fetches keyboard shortcut events
   */
  const getKeyboardShortcuts = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/events/keyboardShortcuts`)
      if (!res.ok) throw new Error('Failed to fetch keyboard shortcut events')

      const data = await res.json()
      log('Keyboard shortcut events fetched:', data)

      return data
    } catch (err) {
      error('Error fetching keyboard shortcut events:', err)
      return []
    }
  }

  /**
   * Sends contact form email
   * @param {Object} contactForm - Contact form data
   */
  const sendContactFormEmail = async (contactForm) => {
    try {
      const res = await fetch(`${API_BASE}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactForm),
      })

      if (res.ok) {
        log('Contact form email successfully sent')
      } else {
        const msg = await res.text()
        warn(`Failed to send contact form email: ${msg}`)
      }
    } catch (err) {
      error('Network error while sending contact form email:', err)
    }
  }

  /**
   * Sends visit during maintenance email
   * @param {string} userId - UUID of the user
   */
  const sendVisitDuringMaintenanceEmail = async (userId) => {
    if (!globalConfig.usageStatsSettings.sendUsageStats) return

    if (!globalConfig.usageStatsSettings.sendVisitDuringMaintenanceEmail) return

    if (isLocalhost() && !globalConfig.usageStatsSettings.sendUsageStatsOnLocalhost) return
    if (!userId) {
      warn('Missing userId for visit during maintenance email')
      return
    }

    try {
      // Get public IP
      const ipRes = await fetch('https://api.ipify.org?format=json')
      const { ip } = await ipRes.json()

      const res = await fetch(`${API_BASE}/api/contact/${userId}/visitDuringMaintenance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ip }),
      })

      if (res.ok) {
        log(`Visit during maintenance email successfully sent for user ${userId}`)
      } else {
        const msg = await res.text()
        warn(`Failed to send visit during maintenance email: ${msg}`)
      }
    } catch (err) {
      error('Network error while sending visit during maintenance email:', err)
    }
  }

  /**
   * Fetches visits for all days (from first recorded visit to today)
   */
  const getVisitsByDayFullRange = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/visits/byDayFullRange`)
      if (!res.ok) throw new Error('Failed to fetch visits by day full range')

      const data = await res.json()
      log('Visits by day (full range) fetched:', data)

      return data
    } catch (err) {
      error('Error fetching visits by day full range:', err)
      return []
    }
  }

  /**
   * Fetches sessions grouped by day for all days (from first recorded session to today)
   * [{ date, allVisits, avgUploadImage, avgExportImage, avgApplyOperation }, ...]
   */
  const getSessionsByDay = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/users/sessions`)
      if (!res.ok) throw new Error('Failed to fetch sessions by day')

      const data = await res.json()
      log('Sessions by day fetched:', data)

      return data
    } catch (err) {
      error('Error fetching sessions by day:', err)
      return []
    }
  }

  /**
   * Fetches average number of events per visit grouped by day for all days
   * [{ date, allVisits, avgUploadImage, avgExportImage, avgApplyOperation }, ...]
   */
  const getAvgEventsPerVisitByDay = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/visits/avgEventsPerVisitByDay`)
      if (!res.ok) throw new Error('Failed to fetch avg events per visit by day')

      const data = await res.json()
      log('Avg events per visit by day fetched:', data)

      return data
    } catch (err) {
      error('Error fetching avg events per visit by day:', err)
      return []
    }
  }

  return {
    addUserVisit,
    addUserEvent,
    getAllVisits,
    getUniqueVisits,
    getLastDaysVisits,
    getVisitsByCountry,
    getDaysVisits,
    getEventsOverview,
    getToggleTool,
    getApplyOperation,
    getUploadImage,
    getExportImage,
    getOpenModal,
    getKeyboardShortcuts,
    sendContactFormEmail,
    sendVisitDuringMaintenanceEmail,
    getVisitsByDayFullRange,
    addUserSession,
    getSessionsByDay,
    getAvgEventsPerVisitByDay,
  }
}
