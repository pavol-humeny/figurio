/**
 * @file: useMath.js
 * @author: Pavol Humeny
 * @date: 15.5.2026
 * @description: Composable for common mathematical operations. Provides utility functions for rounding, clamping, finding closest values, and calculating distances, which can be used across various components in the application to ensure consistency and reduce code duplication.
 */
/**
 * Composable for common mathematical operations
 * @returns {{
 *   round: (value: number, positions: number) => number,
 *   clamp: (value: number, min: number, max: number) => number,
 *   closest: (target: number, values: number[]) => number | null,
 *   pythagorean: (a: number, b: number) => number,
 *   distance: (x1: number, y1: number, x2: number, y2: number) => number
 * }}
 */
export function useMath() {
  /**
   * Rounds a number to a specified number of decimal places
   * @param {number} value - The number to round
   * @param {number} positions - The number of decimal places to round to (explicit 0)
   * @returns {number} - The rounded number
   */
  const round = (value, positions = 0) => {
    return Number(value.toFixed(positions))
  }

  /**
   * Clamps a number between a minimum and maximum value
   * @param {number} value - The number to clamp
   * @param {number} min - The minimum value
   * @param {number} max - The maximum value
   * @returns {number} - The clamped number
   */
  const clamp = (value, min, max) => {
    return Math.max(min, Math.min(max, value))
  }

  /**
   * Finds the closest value in an array to a target number
   * @param {number} target - The target number to compare against
   * @param {number[]} values - An array of numbers to search
   * @returns {number | null} - The closest number from the array, or null if the array is empty
   */
  const closest = (target, values) => {
    if (!Array.isArray(values) || values.length === 0) return null
    return values.reduce((prev, curr) =>
      Math.abs(curr - target) < Math.abs(prev - target) ? curr : prev,
    )
  }

  /**
   * Calculates the length of the hypotenuse using the Pythagorean theorem
   * @param {number} a - Length of the first leg
   * @param {number} b - Length of the second leg
   * @returns {number} - Length of the hypotenuse
   */
  const pythagorean = (a, b) => {
    return Math.sqrt(a * a + b * b)
  }

  /**
   * Calculates distance between two points
   * @param {number} x1 - X coordinate of the first point
   * @param {number} y1 - Y coordinate of the first point
   * @param {number} x2 - X coordinate of the second point
   * @param {number} y2 - Y coordinate of the second point
   * @returns {number} - Distance between the two points
   */
  const distance = (x1, y1, x2, y2) => {
    return pythagorean(x2 - x1, y2 - y1)
  }

  return {
    round,
    clamp,
    closest,
    pythagorean,
    distance,
  }
}
