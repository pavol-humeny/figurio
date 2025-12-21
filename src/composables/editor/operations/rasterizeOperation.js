/**
 * Rasterize operation – editor mode
 * Bakes SVG/blur objects into bitmap overlay
 */
export async function rasterizeOperation({ srcCanvas, ctx }) {
  const { t, imageStore } = ctx

  const result = await imageStore.rasterize('editor', {}, t)

  // No SVG nothing changes
  if (!result?.overlay) {
    return {
      canvas: srcCanvas,
      overlay: null,
    }
  }

  // canvas stays the SAME
  // overlay becomes rasterized SVG
  return {
    canvas: srcCanvas,
    overlay: result.overlay,
  }
}
