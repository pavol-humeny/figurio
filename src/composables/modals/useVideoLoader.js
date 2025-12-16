import noiseDetectionVideo_tour from '@/assets/videos/noiseDetection_tour.mp4'

import cropTool_tour from '@/assets/videos/cropTool_tour.mp4'
import cropTool_tool from '@/assets/videos/cropTool_tool.mp4'
import frameTool_tour from '@/assets/videos/frameTool_tour.mp4'
import frameTool_tool from '@/assets/videos/frameTool_tool.mp4'
import backgroundRemovalTool_tour from '@/assets/videos/backgroundRemovalTool_tour.mp4'
import backgroundRemovalTool_tool from '@/assets/videos/backgroundRemovalTool_tool.mp4'

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
    let src = cropTool_tour // fallback
    console.log('Getting video for key:', key, 'isToolTip:', isToolTip)

    if (isToolTip) {
      // Tool tip videos
      switch (key) {
        case 'crop':
          src = cropTool_tool
          break
        case 'frame':
          src = frameTool_tool
          break
        case 'grayscale':
          src = cropTool_tool
          break
        case 'color':
        case 'auto':
        case 'manual':
          src = backgroundRemovalTool_tool
          break
        case 'brush':
          src = cropTool_tool
          break
        case 'select':
          src = cropTool_tool
          break
        case 'blur':
          src = cropTool_tool
          break
        case 'shape':
          src = cropTool_tool
          break
        case 'text':
          src = cropTool_tool
          break
        case 'magnifyArea':
          src = cropTool_tool
          break
        case 'transform':
          src = cropTool_tool
          break
        case 'preset':
          src = cropTool_tool
          break
      }
    } else {
      // Feature tour videos
      switch (key) {
        case 'cropTool':
          src = cropTool_tour
          break
        case 'frameTool':
          src = frameTool_tour
          break
        case 'shapeTool':
          src = cropTool_tour
          break
        case 'noiseDetection':
          src = noiseDetectionVideo_tour
          break
        case 'colorTool':
        case 'manualTool':
        case 'autoTool':
          src = backgroundRemovalTool_tour
          break
      }
    }

    return src
  }

  return {
    getVideo,
  }
}
