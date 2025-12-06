import noiseDetectionVideo from '@/assets/videos/noiseDetection.mp4'

import cropVideo from '@/assets/videos/crop.mp4'
import cropToolVideo from '@/assets/videos/cropTool.mp4'
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
      // Tool tip videos
      switch (key) {
        case 'crop':
          src = cropToolVideo
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
      // Feature tour videos
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
        case 'noiseDetection':
          src = noiseDetectionVideo
          break
      }
    }

    return src
  }

  return {
    getVideo,
  }
}
