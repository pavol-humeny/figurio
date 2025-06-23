export function useFlipTool(imageStore) {
  const applyFlip = (direction) => {
    imageStore.applyFlip(direction)
  }

  return {
    applyFlip,
  }
}
