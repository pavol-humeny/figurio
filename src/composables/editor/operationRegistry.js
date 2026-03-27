/**
 * @file: operationRegistry.js
 * @author: Pavol Humeny
 * @date: 15.5.2026
 * @description: Operation registry for the editor. This module imports various image manipulation operations and registers them in a central registry object. Each operation is associated with a unique key that can be used to execute the corresponding operation in the editor.
 */
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
