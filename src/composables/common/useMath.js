export function useMath() {
  const round = (value, positions) => {
    return Number(value.toFixed(positions));
  };

  const clamp = (value, min, max) => {
    return Math.max(min, Math.min(max, value));
  };

  return {
    round,
    clamp,
  };
}
