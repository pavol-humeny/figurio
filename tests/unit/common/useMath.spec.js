import { describe, it, expect } from 'vitest'
import { useMath } from '@/composables/common/useMath'

describe('useMath', () => {
  const { round, clamp, closest } = useMath()

  describe('round', () => {
    it('rounds to 0 decimal places', () => {
      expect(round(4.6, 0)).toBe(5)
      expect(round(4.4, 0)).toBe(4)
    })

    it('rounds to 2 decimal places', () => {
      expect(round(3.14159, 2)).toBe(3.14)
      expect(round(2.71828, 2)).toBe(2.72)
    })

    it('rounds negative numbers', () => {
      expect(round(-1.2345, 2)).toBe(-1.23)
    })
  })

  describe('clamp', () => {
    it('returns value within range unchanged', () => {
      expect(clamp(5, 0, 10)).toBe(5)
    })

    it('returns min when value is below range', () => {
      expect(clamp(-1, 0, 10)).toBe(0)
    })

    it('returns max when value is above range', () => {
      expect(clamp(20, 0, 10)).toBe(10)
    })
  })

  describe('closest', () => {
    it('returns the closest value to target', () => {
      expect(closest(7, [1, 5, 8, 10])).toBe(8)
    })

    it('returns the first if equally close', () => {
      expect(closest(6, [5, 7])).toBe(5) // both are equally close, but 5 comes first
    })

    it('returns null for empty array', () => {
      expect(closest(10, [])).toBeNull()
    })

    it('returns correct value with negative numbers', () => {
      expect(closest(-3, [-10, -5, -2, 0])).toBe(-2)
    })
  })
})
