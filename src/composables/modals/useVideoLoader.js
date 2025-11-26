import cropVideo from '@/assets/videos/crop.mp4'
import brushVideo from '@/assets/videos/brush.mp4'
import shapeVideo from '@/assets/videos/shape.mp4'

/**
 * Hook for loading videos dynamically by key using switch
 */
export function useVideoLoader() {
  /**
   * Get video path by key
   * @param {string} key
   * @returns {string} video path
   */
  const getVideo = (key) => {
    let src = cropVideo // fallback

    switch (key) {
      case 'cropTool':
        src = cropVideo
        break
      case 'brushTool':
        src = brushVideo
        break
      case 'shapeTool':
        src = shapeVideo
        break
    }

    return src
  }

  return {
    getVideo,
  }
}
