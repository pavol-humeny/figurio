import { rotateOperation } from './operations/rotateOperation'
import { flipOperation } from './operations/flipOperation'
import { cropOperation } from './operations/cropOperation'
import { resizeOperation } from './operations/resizeOperation'
import { grayscaleOperation } from './operations/grayscaleOperation'
import { rasterizeOperation } from './operations/rasterizeOperation'
import { backgroundRemovalOperation } from './operations/backgroundRemovalOperation'
import { rasterizePdfOperation } from './operations/rasterizePdfOperation'
import { removeNoiseOperation } from './operations/removeNoiseOperation'

/**
 * Registry mapping operation types to their executor functions
 */
export const operationRegistry = {
  rotate: rotateOperation,
  flip: flipOperation,
  crop: cropOperation,
  resize: resizeOperation,
  grayscale: grayscaleOperation,
  rasterize: rasterizeOperation,
  rasterizePdf: rasterizePdfOperation,
  backgroundRemoval: backgroundRemovalOperation,
  removeNoise: removeNoiseOperation,
}
