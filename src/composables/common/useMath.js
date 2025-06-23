export function useMath() {
  const round = (value, positions) => {
    return Number(value.toFixed(positions))
  }

  const clamp = (value, min, max) => {
    return Math.max(min, Math.min(max, value))
  }

  const closest = (target, values) => {
    if (!Array.isArray(values) || values.length === 0) return null
    return values.reduce((prev, curr) =>
      Math.abs(curr - target) < Math.abs(prev - target) ? curr : prev,
    )
  }

  return {
    round,
    clamp,
    closest,
  }
}
