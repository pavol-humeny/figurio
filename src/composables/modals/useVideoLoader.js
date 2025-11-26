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
  const getVideo = (key, isToolTip = false) => {
    let src = cropVideo // fallback

    if (isToolTip) {
      switch (key) {
        case 'crop':
          src = cropVideo
          break
        case 'frame':
          src = cropVideo
          break
        case 'grayscale':
          src = cropVideo
          break
        case 'backgroundRemoval':
          src = cropVideo
          break
        case 'brush':
          src = cropVideo
          break
        case 'select':
          src = cropVideo
          break
        case 'blur':
          src = cropVideo
          break
        case 'shape':
          src = cropVideo
          break
        case 'text':
          src = cropVideo
          break
        case 'magnifyArea':
          src = cropVideo
          break
        case 'transform':
          src = cropVideo
          break
        case 'preset':
          src = cropVideo
          break
      }
    } else {
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
    }

    return src
  }

  return {
    getVideo,
  }
}
