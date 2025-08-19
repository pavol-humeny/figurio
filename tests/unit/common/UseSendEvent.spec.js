import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useSendEvent } from '@/composables/common/useSendEvent'
import { globalConfig } from '@/config/globalConfig.js'
import { useUiStore } from '@/stores/uiStore'

vi.mock('@/stores/uiStore', () => ({
  useUiStore: vi.fn(),
}))

describe('useSendEvent', () => {
  let mockFetch

  const originalLocation = window.location

  beforeEach(() => {
    delete window.location
    window.location = { hostname: 'test.com' }

    vi.clearAllMocks()

    // fake userUuid z uiStore
    useUiStore.mockReturnValue({ userUuid: 'test-uuid' })

    // mock fetch
    mockFetch = vi.fn()
    globalThis.fetch = mockFetch
  })

  afterEach(() => {
    vi.resetAllMocks()
    window.location = originalLocation
  })

  it('sends event with correct payload and returns JSON on success', async () => {
    const mockResponse = { success: true }
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: vi.fn().mockResolvedValueOnce(mockResponse),
    })

    const { sendEvent } = useSendEvent()
    const result = await sendEvent('add_object', 'brush', 'apply', { size: 10 })

    expect(mockFetch).toHaveBeenCalledWith(
      `${globalConfig.API_BASE}/api/events`,
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: 'test-uuid',
          event_type: 'add_object',
          tool: 'brush',
          button_name: 'apply',
          event_data: { size: 10 },
        }),
      }),
    )
    expect(result).toEqual(mockResponse)
  })

  it('returns null and logs error text when response is not ok', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockFetch.mockResolvedValueOnce({
      ok: false,
      text: vi.fn().mockResolvedValueOnce('Bad request'),
    })

    const { sendEvent } = useSendEvent()
    const result = await sendEvent('invalid_event')

    expect(result).toBeNull()
    expect(consoleSpy).toHaveBeenCalledWith('Server error:', 'Bad request')
  })

  it('returns null and logs error when fetch throws', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockFetch.mockRejectedValueOnce(new Error('Network fail'))

    const { sendEvent } = useSendEvent()
    const result = await sendEvent('network_test')

    expect(result).toBeNull()
    expect(consoleSpy).toHaveBeenCalledWith('Error sending event:', expect.any(Error))
  })

  it('skips sending event on localhost', async () => {
    delete window.location
    window.location = { hostname: 'localhost' }

    const { sendEvent } = useSendEvent()
    const result = await sendEvent('add_object')

    expect(result).toBeNull()
  })
})
