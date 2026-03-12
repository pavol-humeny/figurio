/**
 * @file: UseShaking.spec.js
 * @author: Pavol Humeny
 * @date: 15.5.2026
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useShaking } from '@/composables/common/useShaking'

describe('useShaking', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('initially has isShaking = false', () => {
    const { isShaking } = useShaking()
    expect(isShaking.value).toBe(false)
  })

  it('sets isShaking to true temporarily on triggerShake', () => {
    const { isShaking, triggerShake } = useShaking()

    triggerShake()
    expect(isShaking.value).toBe(true)

    vi.advanceTimersByTime(500)
    expect(isShaking.value).toBe(false)
  })

  it('does not restart shake if already active', () => {
    const { isShaking, triggerShake } = useShaking()

    triggerShake()
    expect(isShaking.value).toBe(true)

    triggerShake() // second call should be ignored
    vi.advanceTimersByTime(500)

    expect(isShaking.value).toBe(false)
  })
})
