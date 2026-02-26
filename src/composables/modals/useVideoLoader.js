import { useConsole } from '../common/useConsole'
const { log } = useConsole()

// Importing videos
import backgroundRemovalAutomatic from '@/assets/videos/backgroundRemovalAutomatic.mp4'
import backgroundRemovalManual from '@/assets/videos/backgroundRemovalManual.mp4'
import backgroundRemovalColor from '@/assets/videos/backgroundRemovalColor.mp4'
import brushBrush from '@/assets/videos/brushBrush.mp4'
import brushPencil from '@/assets/videos/brushPencil.mp4'
import crop from '@/assets/videos/crop.mp4'
import frame from '@/assets/videos/frame.mp4'
import grayscale from '@/assets/videos/grayscale.mp4'
import imageAnalysis from '@/assets/videos/imageAnalysis.mp4'
import presetCreate from '@/assets/videos/presetCreate.mp4'
import presetMyPreset from '@/assets/videos/presetMyPreset.mp4'
import shapeEllipse from '@/assets/videos/shapeEllipse.mp4'
import shapeLine from '@/assets/videos/shapeLine.mp4'
import shapeRectangle from '@/assets/videos/shapeRectangle.mp4'
import text from '@/assets/videos/text.mp4'
import transformFlip from '@/assets/videos/transformFlip.mp4'
import transformResize from '@/assets/videos/transformResize.mp4'
import transformRotate from '@/assets/videos/transformRotate.mp4'
import select from '@/assets/videos/select.mp4'
import magnifyArea from '@/assets/videos/magnifyArea.mp4'
import blurArea from '@/assets/videos/blurArea.mp4'

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
    let src = crop // fallback
    log('Getting video for key:', key)

    // Tool tip videos
    switch (key) {
      case 'crop':
        src = crop
        break
      case 'frame':
        src = frame
        break
      case 'grayscale':
        src = grayscale
        break
      case 'color':
        src = backgroundRemovalColor
        break
      case 'auto':
        src = backgroundRemovalAutomatic
        break
      case 'manual':
        src = backgroundRemovalManual
        break
      case 'brush':
        src = brushBrush
        break
      case 'pencil':
        src = brushPencil
        break
      case 'select':
        src = select
        break
      case 'blur':
        src = blurArea
        break
      case 'rectangle':
        src = shapeRectangle
        break
      case 'ellipse':
        src = shapeEllipse
        break
      case 'line':
        src = shapeLine
        break
      case 'text':
        src = text
        break
      case 'magnifyArea':
        src = magnifyArea
        break
      case 'resize':
        src = transformResize
        break
      case 'rotate':
        src = transformRotate
        break
      case 'flip':
        src = transformFlip
        break
      case 'createPreset':
        src = presetCreate
        break
      case 'myPresets':
        src = presetMyPreset
        break
      case 'imageAnalysis':
        src = imageAnalysis
        break
    }

    return src
  }

  return {
    getVideo,
  }
}
