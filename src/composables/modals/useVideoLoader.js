import { useConsole } from '../common/useConsole'
const { log } = useConsole()

import cropTool_tool_dark from '@/assets/videos/cropTool_tour.mp4'
import cropTool_tool_light from '@/assets/videos/cropTool_tool.mp4'
import cropTool_tour_dark from '@/assets/videos/cropTool_tour.mp4'
import cropTool_tour_light from '@/assets/videos/cropTool_tour.mp4'

/**
 * Hook for loading videos dynamically by key using switch
 */
export function useVideoLoader(uiStore) {
  /**
   * Get video path by key
   * @param {string} key
   * @returns {string} video path
   */
  const getVideo = (key, isToolTip = false) => {
    log('Getting video for key:', key, 'isToolTip:', isToolTip)

    const isDarkTheme = uiStore.theme === 'dark'

    let src = isDarkTheme ? cropTool_tool_dark : cropTool_tool_light // fallback

    if (isToolTip) {
      // Tool tip videos
      switch (key) {
        case 'crop':
          src = isDarkTheme ? cropTool_tool_dark : cropTool_tool_light
          break
        case 'frame':
          src = isDarkTheme ? cropTool_tool_dark : cropTool_tool_light
          break
        case 'grayscale':
          src = isDarkTheme ? cropTool_tool_dark : cropTool_tool_light
          break
        case 'backgroundRemoval':
          src = isDarkTheme ? cropTool_tool_dark : cropTool_tool_light
          break
        case 'color':
        case 'auto':
        case 'manual':
          src = isDarkTheme ? cropTool_tool_dark : cropTool_tool_light
          break
        case 'brush':
        case 'eraser':
          src = isDarkTheme ? cropTool_tool_dark : cropTool_tool_light
          break
        case 'select':
          src = isDarkTheme ? cropTool_tool_dark : cropTool_tool_light
          break
        case 'blur':
          src = isDarkTheme ? cropTool_tool_dark : cropTool_tool_light
          break
        case 'shape':
          src = isDarkTheme ? cropTool_tool_dark : cropTool_tool_light
          break
        case 'text':
          src = isDarkTheme ? cropTool_tool_dark : cropTool_tool_light
          break
        case 'magnifyArea':
          src = isDarkTheme ? cropTool_tool_dark : cropTool_tool_light
          break
        case 'transform':
          src = isDarkTheme ? cropTool_tool_dark : cropTool_tool_light
          break
        case 'preset':
          src = isDarkTheme ? cropTool_tool_dark : cropTool_tool_light
          break
      }
    } else {
      // Feature tour videos
      switch (key) {
        case 'cropTool':
          src = isDarkTheme ? cropTool_tour_dark : cropTool_tour_light
          break
        case 'frameTool':
          src = isDarkTheme ? cropTool_tour_dark : cropTool_tour_light
          break
        case 'shapeTool':
          src = isDarkTheme ? cropTool_tour_dark : cropTool_tour_light
          break
        case 'noiseDetection':
          src = isDarkTheme ? cropTool_tour_dark : cropTool_tour_light
          break
        case 'colorTool':
        case 'manualTool':
        case 'autoTool':
          src = isDarkTheme ? cropTool_tour_dark : cropTool_tour_light
          break
        case 'grayscaleTool':
          src = isDarkTheme ? cropTool_tour_dark : cropTool_tour_light
          break
        case 'brushTool':
        case 'eraserTool':
          src = isDarkTheme ? cropTool_tour_dark : cropTool_tour_light
          break
      }
    }

    return src
  }

  return {
    getVideo,
  }
}
